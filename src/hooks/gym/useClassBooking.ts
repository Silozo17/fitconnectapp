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
  credits_used: number;
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

interface ClassType {
  id: string;
  credit_cost: number;
  cancellation_window_hours: number;
  late_cancel_credits: number;
}

export function useClassBooking(gymId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const client = supabase as any;

  // Get member ID and credits for current user at this gym
  const { data: memberData } = useQuery({
    queryKey: ["gym-member", gymId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await client
        .from("gym_members")
        .select("id, status, credits_remaining, gym_membership_plans(unlimited_classes)")
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
  const creditsRemaining = memberData?.credits_remaining || 0;
  const unlimitedClasses = memberData?.gym_membership_plans?.unlimited_classes || false;

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

  // Book a class with credit deduction
  const bookClass = useMutation({
    mutationFn: async (classId: string) => {
      if (!memberId) throw new Error("You must be a gym member to book classes");

      // Get class details including credit cost
      const { data: classData, error: classError } = await client
        .from("gym_classes")
        .select("id, max_capacity, current_bookings, status, class_type_id, gym_class_types(credit_cost)")
        .eq("id", classId)
        .single();

      if (classError) throw classError;
      if (classData.status !== "scheduled") throw new Error("This class is not available for booking");

      const creditCost = classData.gym_class_types?.credit_cost || 1;

      // Check if user has enough credits (unless unlimited)
      if (!unlimitedClasses && creditsRemaining < creditCost) {
        throw new Error(`Insufficient credits. This class requires ${creditCost} credit(s), you have ${creditsRemaining}.`);
      }

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

      // Deduct credits only for confirmed bookings (not waitlist)
      let creditsUsed = 0;
      if (status === "confirmed" && !unlimitedClasses) {
        creditsUsed = creditCost;
        
        // Update member credits
        const { error: creditError } = await client
          .from("gym_members")
          .update({ credits_remaining: creditsRemaining - creditCost })
          .eq("id", memberId);
        
        if (creditError) throw creditError;

        // Log credit transaction
        await client
          .from("gym_credit_transactions")
          .insert({
            gym_id: gymId,
            member_id: memberId,
            amount: -creditCost,
            balance_after: creditsRemaining - creditCost,
            transaction_type: "booking",
            reference_type: "booking",
            notes: "Class booking",
            created_by: user?.id,
          });
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
          credits_used: creditsUsed,
        })
        .select()
        .single();

      if (error) throw error;

      // Update credit transaction with booking reference
      if (creditsUsed > 0) {
        await client
          .from("gym_credit_transactions")
          .update({ reference_id: data.id })
          .eq("member_id", memberId)
          .eq("transaction_type", "booking")
          .order("created_at", { ascending: false })
          .limit(1);
      }

      // Update class booking count if confirmed
      if (status === "confirmed") {
        await client
          .from("gym_classes")
          .update({ current_bookings: classData.current_bookings + 1 })
          .eq("id", classId);
      }

      return { booking: data, status, creditsUsed };
    },
    onSuccess: (result) => {
      if (result.status === "confirmed") {
        const creditMsg = result.creditsUsed > 0 ? ` (${result.creditsUsed} credit used)` : "";
        toast.success(`Class booked successfully!${creditMsg}`);
      } else {
        toast.info(`Added to waitlist (position ${result.booking.waitlist_position})`);
      }
      queryClient.invalidateQueries({ queryKey: ["my-class-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["gym-classes"] });
      queryClient.invalidateQueries({ queryKey: ["gym-member"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to book class");
    },
  });

  // Cancel a booking with credit refund logic
  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      // Get booking details including credits used and class info
      const { data: booking, error: bookingError } = await client
        .from("gym_class_bookings")
        .select("id, class_id, status, credits_used, gym_classes(start_time, gym_class_types(cancellation_window_hours, late_cancel_credits))")
        .eq("id", bookingId)
        .single();

      if (bookingError) throw bookingError;

      const classStartTime = new Date(booking.gym_classes.start_time);
      const hoursUntilClass = (classStartTime.getTime() - Date.now()) / (1000 * 60 * 60);
      const cancellationWindow = booking.gym_classes.gym_class_types?.cancellation_window_hours || 24;
      const lateCancelCredits = booking.gym_classes.gym_class_types?.late_cancel_credits || 0;
      
      const isLateCancellation = hoursUntilClass < cancellationWindow;
      const creditsToRefund = isLateCancellation 
        ? Math.max(0, (booking.credits_used || 0) - lateCancelCredits)
        : (booking.credits_used || 0);

      // Update booking status
      const { error } = await client
        .from("gym_class_bookings")
        .update({ 
          status: "cancelled",
          cancelled_at: new Date().toISOString()
        })
        .eq("id", bookingId);

      if (error) throw error;

      // Refund credits if applicable
      if (creditsToRefund > 0 && !unlimitedClasses) {
        const newBalance = creditsRemaining + creditsToRefund;
        
        await client
          .from("gym_members")
          .update({ credits_remaining: newBalance })
          .eq("id", memberId);

        await client
          .from("gym_credit_transactions")
          .insert({
            gym_id: gymId,
            member_id: memberId,
            amount: creditsToRefund,
            balance_after: newBalance,
            transaction_type: "cancellation_refund",
            reference_id: bookingId,
            reference_type: "booking",
            notes: isLateCancellation 
              ? `Late cancellation refund (${lateCancelCredits} credit penalty applied)`
              : "Booking cancellation refund",
            created_by: user?.id,
          });
      }

      // If was confirmed, decrement count (trigger handles waitlist promotion)
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
      }

      return { booking, creditsRefunded: creditsToRefund, isLateCancellation };
    },
    onSuccess: (result) => {
      let message = "Booking cancelled";
      if (result.creditsRefunded > 0) {
        message += ` (${result.creditsRefunded} credit${result.creditsRefunded > 1 ? "s" : ""} refunded)`;
      }
      if (result.isLateCancellation && result.creditsRefunded === 0) {
        message += " (no refund - late cancellation)";
      }
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["my-class-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["gym-classes"] });
      queryClient.invalidateQueries({ queryKey: ["gym-member"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel booking");
    },
  });

  // Check if member can book (has credits or unlimited)
  const canBook = (creditCost: number = 1): boolean => {
    if (unlimitedClasses) return true;
    return creditsRemaining >= creditCost;
  };

  return {
    memberId,
    myBookings,
    loadingBookings,
    creditsRemaining,
    unlimitedClasses,
    canBook,
    bookClass,
    cancelBooking,
    isBooked: (classId: string) => myBookings?.some(b => b.class_id === classId) || false,
    getBooking: (classId: string) => myBookings?.find(b => b.class_id === classId),
  };
}
