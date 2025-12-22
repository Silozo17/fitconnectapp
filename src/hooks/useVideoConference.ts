import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type VideoProvider = "zoom" | "google_meet";

interface VideoConferenceSettings {
  id: string;
  coach_id: string;
  provider: VideoProvider;
  provider_user_id: string | null;
  is_active: boolean;
  auto_create_meetings: boolean;
  created_at: string;
}

export const useVideoConference = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["video-conference-settings", user?.id],
    queryFn: async () => {
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user!.id)
        .single();

      if (!coachProfile) return [];

      const { data, error } = await supabase
        .from("video_conference_settings")
        .select("id, coach_id, provider, provider_user_id, is_active, auto_create_meetings, created_at")
        .eq("coach_id", coachProfile.id);

      if (error) throw error;
      return data as VideoConferenceSettings[];
    },
    enabled: !!user,
  });

  // Get the currently active provider (there should only be one)
  const activeProvider = settings?.find((s) => s.is_active);
  
  // Check if a specific provider is connected and active
  const isConnected = (provider: VideoProvider): boolean => {
    return settings?.some((s) => s.provider === provider && s.is_active) ?? false;
  };
  
  // Check if ANY provider is connected (for single-provider enforcement)
  const hasActiveProvider = (): boolean => {
    return !!activeProvider;
  };
  
  // Get settings for a specific provider (only if active)
  const getSettings = (provider: VideoProvider): VideoConferenceSettings | undefined => {
    return settings?.find((s) => s.provider === provider && s.is_active);
  };
  
  // Get the name of the currently active provider for display
  const getActiveProviderName = (): string | null => {
    if (!activeProvider) return null;
    return activeProvider.provider === "zoom" ? "Zoom" : "Google Meet";
  };

  const connectVideoProvider = useMutation({
    mutationFn: async (provider: VideoProvider) => {
      // ENFORCEMENT: Check if another provider is already connected
      if (activeProvider && activeProvider.provider !== provider) {
        const activeName = activeProvider.provider === "zoom" ? "Zoom" : "Google Meet";
        throw new Error(`You already have ${activeName} connected. Please disconnect it first before connecting a different provider.`);
      }
      
      const { data, error } = await supabase.functions.invoke("video-oauth-start", {
        body: { provider },
      });

      if (error) throw error;
      
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
      
      return data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to connect video provider");
    },
  });

  const disconnectVideoProvider = useMutation({
    mutationFn: async (settingsId: string) => {
      const { error } = await supabase
        .from("video_conference_settings")
        .update({ is_active: false })
        .eq("id", settingsId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-conference-settings"] });
      toast.success("Video provider disconnected");
    },
    onError: (error) => {
      toast.error("Failed to disconnect: " + error.message);
    },
  });

  const updateSettings = useMutation({
    mutationFn: async ({
      settingsId,
      autoCreateMeetings,
    }: {
      settingsId: string;
      autoCreateMeetings: boolean;
    }) => {
      const { error } = await supabase
        .from("video_conference_settings")
        .update({ auto_create_meetings: autoCreateMeetings })
        .eq("id", settingsId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-conference-settings"] });
      toast.success("Settings updated");
    },
  });

  const createMeeting = useMutation({
    mutationFn: async ({
      sessionId,
      provider,
    }: {
      sessionId: string;
      provider: VideoProvider;
    }) => {
      const { data, error } = await supabase.functions.invoke("video-create-meeting", {
        body: { sessionId, provider },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Meeting created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create meeting: " + error.message);
    },
  });

  return {
    settings,
    isLoading,
    connectVideoProvider,
    disconnectVideoProvider,
    updateSettings,
    createMeeting,
    isConnected,
    getSettings,
    // New helpers for single-provider enforcement
    activeProvider,
    hasActiveProvider,
    getActiveProviderName,
  };
};
