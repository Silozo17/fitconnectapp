import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ExternalCalendarEvent {
  id: string;
  user_id: string;
  calendar_connection_id: string;
  external_event_id: string;
  title: string | null;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  source: string;
  last_synced_at: string;
}

export const useExternalCalendarEvents = (coachUserId?: string, startDate?: Date, endDate?: Date) => {
  const { user } = useAuth();
  const targetUserId = coachUserId || user?.id;

  return useQuery({
    queryKey: ["external-calendar-events", targetUserId, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      if (!targetUserId) return [];

      let query = supabase
        .from("external_calendar_events")
        .select("*")
        .eq("user_id", targetUserId);

      if (startDate) {
        query = query.gte("end_time", startDate.toISOString());
      }
      if (endDate) {
        query = query.lte("start_time", endDate.toISOString());
      }

      const { data, error } = await query.order("start_time");

      if (error) throw error;
      return data as ExternalCalendarEvent[];
    },
    enabled: !!targetUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSyncExternalCalendar = () => {
  const { user } = useAuth();

  const syncCalendar = async (connectionId?: string) => {
    // Call both Apple (CalDAV) and Google Calendar sync in parallel
    const [caldavResult, googleResult] = await Promise.allSettled([
      supabase.functions.invoke("calendar-caldav-fetch-events", {
        body: connectionId ? { connectionId } : {},
      }),
      supabase.functions.invoke("calendar-google-fetch-events", {
        body: connectionId ? { connectionId } : {},
      }),
    ]);

    // Check for errors
    const errors: string[] = [];
    if (caldavResult.status === 'rejected') {
      console.error("CalDAV sync failed:", caldavResult.reason);
      errors.push("Apple Calendar sync failed");
    } else if (caldavResult.value.error) {
      console.error("CalDAV sync error:", caldavResult.value.error);
      errors.push("Apple Calendar sync error");
    }

    if (googleResult.status === 'rejected') {
      console.error("Google sync failed:", googleResult.reason);
      errors.push("Google Calendar sync failed");
    } else if (googleResult.value.error) {
      console.error("Google sync error:", googleResult.value.error);
      errors.push("Google Calendar sync error");
    }

    if (errors.length === 2) {
      throw new Error("All calendar syncs failed");
    }

    return {
      apple: caldavResult.status === 'fulfilled' ? caldavResult.value.data : null,
      google: googleResult.status === 'fulfilled' ? googleResult.value.data : null,
    };
  };

  return { syncCalendar };
};
