import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CheckinLog {
  id: string;
  checkin_id: string;
  coach_id: string;
  client_id: string;
  status: "sent" | "failed" | "skipped";
  message_id: string | null;
  error_message: string | null;
  notification_sent: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export function useScheduledCheckinLogs(checkinId?: string) {
  return useQuery({
    queryKey: ["scheduled-checkin-logs", checkinId],
    queryFn: async () => {
      let query = supabase
        .from("scheduled_checkin_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (checkinId) {
        query = query.eq("checkin_id", checkinId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CheckinLog[];
    },
    enabled: true,
  });
}

export function useLatestCheckinLog(checkinId: string) {
  return useQuery({
    queryKey: ["scheduled-checkin-latest-log", checkinId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_checkin_logs")
        .select("*")
        .eq("checkin_id", checkinId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as CheckinLog | null;
    },
    enabled: !!checkinId,
  });
}
