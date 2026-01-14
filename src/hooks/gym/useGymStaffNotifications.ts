import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";

export interface GymStaffNotification {
  id: string;
  gym_id: string;
  staff_id: string;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export function useGymStaffNotifications(limit = 20) {
  const { gym, staffRecord } = useGym();

  return useQuery({
    queryKey: ["gym-staff-notifications", gym?.id, staffRecord?.id, limit],
    queryFn: async () => {
      if (!gym?.id || !staffRecord?.id) return [];

      const { data, error } = await supabase
        .from("gym_staff_notifications")
        .select("*")
        .eq("staff_id", staffRecord.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as GymStaffNotification[];
    },
    enabled: !!gym?.id && !!staffRecord?.id,
  });
}

export function useUnreadNotificationsCount() {
  const { gym, staffRecord } = useGym();

  return useQuery({
    queryKey: ["gym-staff-notifications-unread", gym?.id, staffRecord?.id],
    queryFn: async () => {
      if (!gym?.id || !staffRecord?.id) return 0;

      const { count, error } = await supabase
        .from("gym_staff_notifications")
        .select("id", { count: "exact", head: true })
        .eq("staff_id", staffRecord.id)
        .eq("read", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!gym?.id && !!staffRecord?.id,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("gym_staff_notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-staff-notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { staffRecord } = useGym();

  return useMutation({
    mutationFn: async () => {
      if (!staffRecord?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("gym_staff_notifications")
        .update({ read: true })
        .eq("staff_id", staffRecord.id)
        .eq("read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-staff-notifications"] });
    },
  });
}
