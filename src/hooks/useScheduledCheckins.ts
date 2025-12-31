import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Calculate the next run time based on schedule configuration
function calculateNextRunAt(
  scheduleType: string,
  timeOfDay: string,
  dayOfWeek?: number | null,
  dayOfMonth?: number | null
): Date {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(":").map(Number);
  
  const nextRun = new Date();
  nextRun.setHours(hours, minutes, 0, 0);

  if (scheduleType === "daily") {
    // If today's time has passed, schedule for tomorrow
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
  } else if (scheduleType === "weekly" && dayOfWeek !== undefined && dayOfWeek !== null) {
    const currentDay = nextRun.getDay();
    let daysUntil = dayOfWeek - currentDay;
    if (daysUntil < 0 || (daysUntil === 0 && nextRun <= now)) {
      daysUntil += 7;
    }
    nextRun.setDate(nextRun.getDate() + daysUntil);
  } else if (scheduleType === "monthly") {
    const targetDay = dayOfMonth || nextRun.getDate();
    nextRun.setDate(targetDay);
    if (nextRun <= now) {
      nextRun.setMonth(nextRun.getMonth() + 1);
    }
  }

  return nextRun;
}

export function useScheduledCheckins() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: coachProfile } = useQuery({
    queryKey: ["coach-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("coach_profiles").select("id").eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: scheduledCheckins = [], isLoading } = useQuery({
    queryKey: ["scheduled-checkins", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data, error } = await supabase
        .from("scheduled_checkins")
        .select(`*, client:client_profiles!scheduled_checkins_client_id_fkey(first_name, last_name)`)
        .eq("coach_id", coachProfile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!coachProfile,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const nextRunAt = calculateNextRunAt(
        data.schedule_type,
        data.time_of_day,
        data.day_of_week
      );
      const { error } = await supabase.from("scheduled_checkins").insert({
        ...data,
        coach_id: coachProfile?.id,
        next_run_at: nextRunAt.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Check-in scheduled");
      queryClient.invalidateQueries({ queryKey: ["scheduled-checkins"] });
    },
    onError: () => toast.error("Failed to create check-in"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      // Recalculate next_run_at when updating schedule settings
      const nextRunAt = calculateNextRunAt(
        data.schedule_type,
        data.time_of_day,
        data.day_of_week
      );
      const { error } = await supabase.from("scheduled_checkins").update({
        ...data,
        next_run_at: nextRunAt.toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Check-in updated");
      queryClient.invalidateQueries({ queryKey: ["scheduled-checkins"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scheduled_checkins").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Check-in deleted");
      queryClient.invalidateQueries({ queryKey: ["scheduled-checkins"] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("scheduled_checkins").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["scheduled-checkins"] }),
  });

  return {
    scheduledCheckins,
    isLoading,
    createCheckin: createMutation.mutate,
    updateCheckin: updateMutation.mutate,
    deleteCheckin: deleteMutation.mutate,
    toggleActive: (id: string, is_active: boolean) => toggleActiveMutation.mutate({ id, is_active }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
