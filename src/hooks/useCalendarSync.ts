import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type CalendarProvider = "google_calendar" | "apple_calendar";

interface CalendarConnection {
  id: string;
  user_id: string;
  provider: CalendarProvider;
  calendar_id: string | null;
  sync_enabled: boolean;
  created_at: string;
}

export const useCalendarSync = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: connections, isLoading } = useQuery({
    queryKey: ["calendar-connections", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_connections")
        .select("id, user_id, provider, calendar_id, sync_enabled, created_at")
        .eq("user_id", user!.id);

      if (error) throw error;
      return data as CalendarConnection[];
    },
    enabled: !!user,
  });

  const connectCalendar = useMutation({
    mutationFn: async ({ provider, returnPath }: { provider: CalendarProvider; returnPath?: string }) => {
      const { data, error } = await supabase.functions.invoke("calendar-oauth-start", {
        body: { provider, returnPath: returnPath || window.location.pathname },
      });

      if (error) throw error;
      
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
      
      return data;
    },
    onError: () => {
      toast.error("Failed to connect calendar. Please try again.");
    },
  });

  const disconnectCalendar = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from("calendar_connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-connections"] });
      toast.success("Calendar disconnected");
    },
    onError: () => {
      toast.error("Failed to disconnect. Please try again.");
    },
  });

  const toggleSync = useMutation({
    mutationFn: async ({
      connectionId,
      enabled,
    }: {
      connectionId: string;
      enabled: boolean;
    }) => {
      const { error } = await supabase
        .from("calendar_connections")
        .update({ sync_enabled: enabled })
        .eq("id", connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-connections"] });
      toast.success("Calendar sync updated");
    },
  });

  const syncSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.functions.invoke("calendar-sync-session", {
        body: { sessionId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Session synced to calendar");
    },
    onError: () => {
      toast.error("Failed to sync. Please try again.");
    },
  });

  const syncAllSessions = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase.functions.invoke("calendar-sync-existing-sessions", {
        body: { userId: user.id },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.syncedCount > 0) {
        toast.success(`Synced ${data.syncedCount} session${data.syncedCount > 1 ? 's' : ''} to your calendar`);
      } else {
        toast.info("No upcoming sessions to sync");
      }
    },
    onError: () => {
      toast.error("Failed to sync sessions. Please try again.");
    },
  });

  const isConnected = (provider: CalendarProvider) => {
    return connections?.some((c) => c.provider === provider);
  };

  const getConnection = (provider: CalendarProvider) => {
    return connections?.find((c) => c.provider === provider);
  };

  return {
    connections,
    isLoading,
    connectCalendar,
    disconnectCalendar,
    toggleSync,
    syncSession,
    syncAllSessions,
    isConnected,
    getConnection,
  };
};
