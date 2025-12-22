import { useState, useEffect, useRef } from "react";
import { Video, Calendar, CheckCircle, ExternalLink, Loader2, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import type { Database } from "@/integrations/supabase/types";

type VideoProvider = Database["public"]["Enums"]["video_provider"];
type CalendarProvider = Database["public"]["Enums"]["calendar_provider"];

interface IntegrationsOnboardingStepProps {
  coachId: string;
  /** Called to indicate state changes - parent controls footer */
  onStateChange?: (state: { hasAnyConnection: boolean }) => void;
}

const VIDEO_PROVIDERS: {
  id: VideoProvider;
  nameKey: string;
  descriptionKey: string;
  icon: typeof Video;
  color: string;
}[] = [
  {
    id: "zoom",
    nameKey: "integrations.video.zoom.name",
    descriptionKey: "integrations.video.zoom.description",
    icon: Video,
    color: "bg-blue-500",
  },
  {
    id: "google_meet",
    nameKey: "integrations.video.googleMeet.name",
    descriptionKey: "integrations.video.googleMeet.description",
    icon: Video,
    color: "bg-green-500",
  },
];

const CALENDAR_PROVIDERS: {
  id: CalendarProvider;
  nameKey: string;
  descriptionKey: string;
  icon: typeof Calendar;
  color: string;
}[] = [
  {
    id: "google_calendar",
    nameKey: "integrations.calendar.googleCalendar.name",
    descriptionKey: "integrations.calendar.googleCalendar.description",
    icon: Calendar,
    color: "bg-red-500",
  },
];

export function useIntegrationsState(coachId: string) {
  const { user } = useAuth();

  // Check connected video providers
  const { data: videoConnections } = useQuery({
    queryKey: ["video-connections-onboarding", coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_conference_settings")
        .select("provider")
        .eq("coach_id", coachId)
        .eq("is_active", true);
      
      if (error) return [];
      return data.map(c => c.provider);
    },
    enabled: !!coachId,
  });

  // Check connected calendar providers
  const { data: calendarConnections } = useQuery({
    queryKey: ["calendar-connections-onboarding", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_connections")
        .select("provider")
        .eq("user_id", user!.id);
      
      if (error) return [];
      return data.map(c => c.provider);
    },
    enabled: !!user,
  });

  const hasAnyConnection = (videoConnections?.length || 0) > 0 || (calendarConnections?.length || 0) > 0;

  return { videoConnections, calendarConnections, hasAnyConnection };
}

const IntegrationsOnboardingStep = ({ coachId, onStateChange }: IntegrationsOnboardingStepProps) => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const { hasFeature } = useFeatureAccess();

  const { videoConnections, calendarConnections, hasAnyConnection } = useIntegrationsState(coachId);

  // Track previous state to avoid unnecessary calls
  const prevStateRef = useRef({ hasAnyConnection: false });

  // Check if user has access to integrations (enterprise+ only)
  const hasIntegrationsAccess = hasFeature("custom_integrations");

  // Get the currently connected video provider (for single-provider enforcement)
  const connectedVideoProvider = videoConnections?.[0] || null;

  // Notify parent of state changes - MUST be in useEffect to avoid render-loop freezes
  useEffect(() => {
    if (prevStateRef.current.hasAnyConnection !== hasAnyConnection) {
      prevStateRef.current = { hasAnyConnection };
      onStateChange?.({ hasAnyConnection });
    }
  }, [hasAnyConnection, onStateChange]);

  const handleConnectVideo = async (providerId: VideoProvider) => {
    // Single-provider enforcement
    if (connectedVideoProvider && connectedVideoProvider !== providerId) {
      const activeName = connectedVideoProvider === "zoom" ? "Zoom" : "Google Meet";
      toast.error(`You already have ${activeName} connected. Please disconnect it first.`);
      return;
    }
    
    setConnectingProvider(providerId);
    try {
      const { data, error } = await supabase.functions.invoke("video-oauth-start", {
        body: { provider: providerId },
      });

      if (error) throw error;
      
      if (data?.authUrl) {
        sessionStorage.setItem("onboarding_return", "coach");
        window.location.href = data.authUrl;
      }
    } catch (error) {
      toast.error(t('integrations.connectionError'));
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleConnectCalendar = async (providerId: CalendarProvider) => {
    setConnectingProvider(providerId);
    try {
      const { data, error } = await supabase.functions.invoke("calendar-oauth-start", {
        body: { provider: providerId },
      });

      if (error) throw error;
      
      if (data?.authUrl) {
        sessionStorage.setItem("onboarding_return", "coach");
        window.location.href = data.authUrl;
      }
    } catch (error) {
      toast.error(t('integrations.connectionError'));
    } finally {
      setConnectingProvider(null);
    }
  };

  // Show locked state for users without enterprise+ plan
  if (!hasIntegrationsAccess) {
    return (
      <div className="space-y-5">
        <div className="mb-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            {t('onboardingIntegrations.videoCalendar.title')}
          </h2>
          <p className="text-muted-foreground text-sm mt-1.5">
            {t('onboardingIntegrations.videoCalendar.subtitle')}
          </p>
        </div>
        <div className="p-6 rounded-xl border-2 border-dashed border-border bg-muted/30 text-center">
          <Lock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-medium text-foreground mb-2">{t('integrations.enterpriseOnly', 'Enterprise Feature')}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t('integrations.upgradeToEnterprise', 'Video conferencing and calendar integrations are available on the Enterprise plan. You can skip this step and upgrade later.')}
          </p>
        </div>
      </div>
    );
  }

  const handleConnectCalendar = async (providerId: CalendarProvider) => {
    setConnectingProvider(providerId);
    try {
      const { data, error } = await supabase.functions.invoke("calendar-oauth-start", {
        body: { provider: providerId },
      });

      if (error) throw error;
      
      if (data?.authUrl) {
        sessionStorage.setItem("onboarding_return", "coach");
        window.location.href = data.authUrl;
      }
    } catch (error) {
      toast.error(t('integrations.connectionError'));
    } finally {
      setConnectingProvider(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="mb-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          {t('onboardingIntegrations.videoCalendar.title')}
        </h2>
        <p className="text-muted-foreground text-sm mt-1.5">
          {t('onboardingIntegrations.videoCalendar.subtitle')}
        </p>
      </div>

      {/* Video Conferencing */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground text-sm">{t('onboardingIntegrations.videoCalendar.videoSection')}</h3>
        <div className="space-y-2">
          {VIDEO_PROVIDERS.map((provider) => {
            const isConnected = videoConnections?.includes(provider.id);
            const isConnecting = connectingProvider === provider.id;
            const Icon = provider.icon;

            return (
              <div
                key={provider.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isConnected
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${provider.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{t(provider.nameKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(provider.descriptionKey)}</p>
                    </div>
                  </div>
                  {isConnected ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{t('integrations.connected')}</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnectVideo(provider.id)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          {t('integrations.connect')}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Sync */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground text-sm">{t('onboardingIntegrations.videoCalendar.calendarSection')}</h3>
        <div className="space-y-2">
          {CALENDAR_PROVIDERS.map((provider) => {
            const isConnected = calendarConnections?.includes(provider.id);
            const isConnecting = connectingProvider === provider.id;
            const Icon = provider.icon;

            return (
              <div
                key={provider.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isConnected
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${provider.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{t(provider.nameKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(provider.descriptionKey)}</p>
                    </div>
                  </div>
                  {isConnected ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{t('integrations.connected')}</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnectCalendar(provider.id)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          {t('integrations.connect')}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsOnboardingStep;
