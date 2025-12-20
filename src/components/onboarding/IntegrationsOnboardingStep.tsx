import { useState } from "react";
import { Video, Calendar, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type VideoProvider = Database["public"]["Enums"]["video_provider"];
type CalendarProvider = Database["public"]["Enums"]["calendar_provider"];

interface IntegrationsOnboardingStepProps {
  coachId: string;
  onComplete: () => void;
  onSkip: () => void;
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

const IntegrationsOnboardingStep = ({ coachId, onComplete, onSkip }: IntegrationsOnboardingStepProps) => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  // Check connected video providers - uses video_conference_settings table
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

  const handleConnectVideo = async (providerId: VideoProvider) => {
    setConnectingProvider(providerId);
    try {
      const { data, error } = await supabase.functions.invoke("video-oauth-start", {
        body: { provider: providerId },
      });

      if (error) throw error;
      
      if (data?.authUrl) {
        // Store return info in sessionStorage
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

  const hasAnyConnection = (videoConnections?.length || 0) > 0 || (calendarConnections?.length || 0) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          {t('onboardingIntegrations.videoCalendar.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('onboardingIntegrations.videoCalendar.subtitle')}
        </p>
      </div>

      {/* Video Conferencing */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">{t('onboardingIntegrations.videoCalendar.videoSection')}</h3>
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
                      <p className="font-medium text-foreground">{t(provider.nameKey)}</p>
                      <p className="text-sm text-muted-foreground">{t(provider.descriptionKey)}</p>
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
        <h3 className="font-medium text-foreground">{t('onboardingIntegrations.videoCalendar.calendarSection')}</h3>
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
                      <p className="font-medium text-foreground">{t(provider.nameKey)}</p>
                      <p className="text-sm text-muted-foreground">{t(provider.descriptionKey)}</p>
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

      <Button 
        onClick={hasAnyConnection ? onComplete : onSkip} 
        className="w-full bg-primary text-primary-foreground"
      >
        {hasAnyConnection ? t('onboardingIntegrations.videoCalendar.continueButton') : t('onboardingIntegrations.videoCalendar.skipButton')}
      </Button>
    </div>
  );
};

export default IntegrationsOnboardingStep;
