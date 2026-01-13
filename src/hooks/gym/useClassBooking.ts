import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ClassBooking {
  id: string;
  class_id: string;
  member_id: string;
  status: string;
  booked_at: string;
  cancelled_at: string | null;
  waitlist_position: number | null;
  attended: boolean | null;
  checked_in_at: string | null;
}

interface GymClass {
  id: string;
  gym_id: string;
  class_type_id: string;
  instructor_id: string | null;
  location_id: string | null;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_bookings: number;
  status: string;
  notes: string | null;
}

export function useClassBooking(gymId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const client = supabase as any;

  // Get member ID for current user at this gym
  const { data: memberData } = useQuery({
    queryKey: ["gym-member", gymId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await client
        .from("gym_members")
        .select("id, status")
        .eq("gym_id", gymId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user && !!gymId,
  });

  const memberId = memberData?.id;

  // Get bookings for current member
  const { data: myBookings, isLoading: loadingBookings } = useQuery({
    queryKey: ["my-class-bookings", gymId, memberId],
    queryFn: async () => {
      if (!memberId) return [];
      const { data, error } = await client
        .from("gym_class_bookings")
        .select("*")
        .eq("member_id", memberId)
        .in("status", ["confirmed", "waitlisted"]);
      
      if (error) throw error;
      return data as ClassBooking[];
    },
    enabled: !!memberId,
  });

  // Book a class
  const bookClass = useMutation({
    mutationFn: async (classId: string) => {
      if (!memberId) throw new Error("You must be a gym member to book classes");

      // Get class details to check capacity
      const { data: classData, error: classError } = await client
        .from("gym_classes")
        .select("id, max_capacity, current_bookings, status")
        .eq("id", classId)
        .single();

      if (classError) throw classError;
      if (classData.status !== "scheduled") throw new Error("This class is not available for booking");

      // Check if already booked
      const { data: existingBooking } = await client
        .from("gym_class_bookings")
        .select("id")
        .eq("class_id", classId)
        .eq("member_id", memberId)
        .in("status", ["confirmed", "waitlisted"])
        .single();

      if (existingBooking) throw new Error("You have already booked this class");

      const isFull = classData.current_bookings >= classData.max_capacity;
      const status = isFull ? "waitlisted" : "confirmed";

      // Get waitlist position if joining waitlist
      let waitlistPosition = null;
      if (isFull) {
        const { count } = await client
          .from("gym_class_bookings")
          .select("id", { count: "exact" })
          .eq("class_id", classId)
          .eq("status", "waitlisted");
        waitlistPosition = (count || 0) + 1;
      }

      // Create booking
      const { data, error } = await client
        .from("gym_class_bookings")
        .insert({
          class_id: classId,
          member_id: memberId,
          status,
          waitlist_position: waitlistPosition,
          booked_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update class booking count if confirmed
      if (status === "confirmed") {
        await client
          .from("gym_classes")
          .update({ current_bookings: classData.current_bookings + 1 })
          .eq("id", classId);
      }

      return { booking: data, status };
    },
    onSuccess: (result) => {
      if (result.status === "confirmed") {
        toast.success("Class booked successfully!");
      } else {
        toast.info(`Added to waitlist (position ${result.booking.waitlist_position})`);
      }
      queryClient.invalidateQueries({ queryKey: ["my-class-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["gym-classes"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to book class");
    },
  });

  // Cancel a booking
  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      // Get booking details
      const { data: booking, error: bookingError } = await client
        .from("gym_class_bookings")
        .select("id, class_id, status")
        .eq("id", bookingId)
        .single();

      if (bookingError) throw bookingError;

      // Update booking status
      const { error } = await client
        .from("gym_class_bookings")
        .update({ 
          status: "cancelled",
          cancelled_at: new Date().toISOString()
        })
        .eq("id", bookingId);

      if (error) throw error;

      // If was confirmed, decrement count and promote from waitlist
      if (booking.status === "confirmed") {
        const { data: classData } = await client
          .from("gym_classes")
          .select("current_bookings")
          .eq("id", booking.class_id)
          .single();

        if (classData) {
          await client
            .from("gym_classes")
            .update({ current_bookings: Math.max(0, classData.current_bookings - 1) })
            .eq("id", booking.class_id);
        }

        // Promote first waitlisted person
        const { data: waitlisted } = await client
          .from("gym_class_bookings")
          .select("id")
          .eq("class_id", booking.class_id)
          .eq("status", "waitlisted")
          .order("waitlist_position", { ascending: true })
          .limit(1);

        if (waitlisted && waitlisted.length > 0) {
          await client
            .from("gym_class_bookings")
            .update({ 
              status: "confirmed",
              waitlist_position: null
            })
            .eq("id", waitlisted[0].id);

          // Update remaining waitlist positions
          await client.rpc("decrement_waitlist_positions", { 
            p_class_id: booking.class_id 
          });
        }
      }

      return booking;
    },
    onSuccess: () => {
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["my-class-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["gym-classes"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel booking");
    },
  });

  return {
    memberId,
    myBookings,
    loadingBookings,
    bookClass,
    cancelBooking,
    isBooked: (classId: string) => myBookings?.some(b => b.class_id === classId) || false,
    getBooking: (classId: string) => myBookings?.find(b => b.class_id === classId),
  };
}
