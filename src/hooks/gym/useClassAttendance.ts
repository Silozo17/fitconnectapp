import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClassBookingWithMember {
  id: string;
  class_id: string;
  member_id: string;
  status: string;
  booked_at: string;
  attended: boolean | null;
  checked_in_at: string | null;
  member: {
    id: string;
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

export function useClassAttendance(classId: string) {
  const queryClient = useQueryClient();
  const client = supabase as any;

  // Get all bookings for a class with member details
  const { data: attendees, isLoading } = useQuery({
    queryKey: ["class-attendance", classId],
    queryFn: async () => {
      // Get bookings
      const { data: bookings, error: bookingsError } = await client
        .from("gym_class_bookings")
        .select("id, class_id, member_id, status, booked_at, attended, checked_in_at")
        .eq("class_id", classId)
        .in("status", ["confirmed", "waitlisted"])
        .order("booked_at", { ascending: true });

      if (bookingsError) throw bookingsError;
      if (!bookings || bookings.length === 0) return [];

      // Get member details
      const memberIds = bookings.map((b: any) => b.member_id);
      const { data: members, error: membersError } = await client
        .from("gym_members")
        .select("id, user_id, first_name, last_name, email")
        .in("id", memberIds);

      if (membersError) throw membersError;

      const memberMap = new Map((members || []).map((m: any) => [m.id, m]));

      return bookings.map((booking: any) => ({
        ...booking,
        member: memberMap.get(booking.member_id) || null,
      })) as ClassBookingWithMember[];
    },
    enabled: !!classId,
  });

  // Mark attendance
  const markAttendance = useMutation({
    mutationFn: async ({ bookingId, attended }: { bookingId: string; attended: boolean }) => {
      const { error } = await client
        .from("gym_class_bookings")
        .update({ 
          attended,
          checked_in_at: attended ? new Date().toISOString() : null
        })
        .eq("id", bookingId);

      if (error) throw error;

      // Also create a check-in record
      if (attended) {
        const booking = attendees?.find(a => a.id === bookingId);
        if (booking) {
          await client
            .from("gym_check_ins")
            .upsert({
              gym_id: (await client.from("gym_classes").select("gym_id").eq("id", classId).single()).data?.gym_id,
              member_id: booking.member_id,
              check_in_time: new Date().toISOString(),
              check_in_type: "class",
              class_id: classId,
            }, {
              onConflict: "member_id,class_id"
            });
        }
      }

      return { bookingId, attended };
    },
    onSuccess: ({ attended }) => {
      toast.success(attended ? "Marked as attended" : "Marked as not attended");
      queryClient.invalidateQueries({ queryKey: ["class-attendance", classId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update attendance");
    },
  });

  // Bulk mark all as attended
  const markAllAttended = useMutation({
    mutationFn: async () => {
      const confirmed = attendees?.filter(a => a.status === "confirmed") || [];
      
      for (const attendee of confirmed) {
        await client
          .from("gym_class_bookings")
          .update({ 
            attended: true,
            checked_in_at: new Date().toISOString()
          })
          .eq("id", attendee.id);
      }

      return confirmed.length;
    },
    onSuccess: (count) => {
      toast.success(`Marked ${count} attendees as present`);
      queryClient.invalidateQueries({ queryKey: ["class-attendance", classId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update attendance");
    },
  });

  const confirmedCount = attendees?.filter(a => a.status === "confirmed").length || 0;
  const waitlistedCount = attendees?.filter(a => a.status === "waitlisted").length || 0;
  const attendedCount = attendees?.filter(a => a.attended === true).length || 0;

  return {
    attendees,
    isLoading,
    markAttendance,
    markAllAttended,
    confirmedCount,
    waitlistedCount,
    attendedCount,
  };
}
