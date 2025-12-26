import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VideoProviderCard from "@/components/integrations/VideoProviderCard";
import CalendarConnectionCard from "@/components/integrations/CalendarConnectionCard";
import AppleCalendarConnectModal from "@/components/integrations/AppleCalendarConnectModal";
import { useVideoConference, VideoProvider } from "@/hooks/useVideoConference";
import { useCalendarSync, CalendarProvider } from "@/hooks/useCalendarSync";
import { Video, Calendar, Shield, Apple } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { FeatureGate } from "@/components/FeatureGate";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";

const videoProviders: {
  id: VideoProvider;
  name: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: "zoom",
    name: "Zoom",
    icon: <Video className="w-6 h-6 text-white" />,
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
  {
    id: "google_meet",
    name: "Google Meet",
    icon: <Video className="w-6 h-6 text-white" />,
    color: "bg-gradient-to-br from-green-500 to-teal-600",
  },
];

const calendarProviders: {
  id: CalendarProvider;
  name: string;
  icon: React.ReactNode;
  color: string;
  isCalDAV?: boolean;
}[] = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    icon: <Calendar className="w-6 h-6 text-white" />,
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
  {
    id: "apple_calendar",
    name: "Apple Calendar",
    icon: <Apple className="w-6 h-6 text-white" />,
    color: "bg-gradient-to-br from-gray-700 to-gray-900",
    isCalDAV: true,
  },
];

const CoachIntegrations = () => {
  const [appleCalendarModalOpen, setAppleCalendarModalOpen] = useState(false);
  
  const {
    connectVideoProvider,
    disconnectVideoProvider,
    updateSettings,
    getSettings,
    isLoading: videoLoading,
    activeProvider,
    getActiveProviderName,
  } = useVideoConference();

  const {
    connectCalendar,
    disconnectCalendar,
    toggleSync,
    syncAllSessions,
    getConnection,
    isLoading: calendarLoading,
  } = useCalendarSync();

  const handleCalendarConnect = (providerId: CalendarProvider, isCalDAV?: boolean) => {
    if (isCalDAV) {
      setAppleCalendarModalOpen(true);
    } else {
      connectCalendar.mutate({ provider: providerId });
    }
  };

  return (
    <DashboardLayout
      title="Integrations"
      description="Connect video conferencing and calendar services"
    >
      <FeatureGate feature="custom_integrations">
      <PageHelpBanner
        pageKey="coach_integrations"
        title="App Integrations"
        description="Connect video conferencing and calendar sync"
      />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your video conferencing and calendar apps to streamline sessions
          </p>
        </div>

        {/* Video Conferencing */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Video Conferencing</h2>
            <p className="text-sm text-muted-foreground">
              Automatically create video meeting links for your online sessions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videoProviders.map((provider) => {
              const settings = getSettings(provider.id);
              const isConnected = !!settings;
              // Block if another provider is active
              const isBlocked = !isConnected && !!activeProvider && activeProvider.provider !== provider.id;
              
              return (
                <VideoProviderCard
                  key={provider.id}
                  provider={provider.id}
                  providerName={provider.name}
                  providerIcon={provider.icon}
                  providerColor={provider.color}
                  isConnected={isConnected}
                  autoCreateMeetings={settings?.auto_create_meetings}
                  onConnect={() => connectVideoProvider.mutate(provider.id)}
                  onDisconnect={() => settings && disconnectVideoProvider.mutate(settings.id)}
                  onToggleAutoCreate={(enabled) =>
                    settings &&
                    updateSettings.mutate({
                      settingsId: settings.id,
                      autoCreateMeetings: enabled,
                    })
                  }
                  isConnecting={connectVideoProvider.isPending}
                  isBlocked={isBlocked}
                  blockedByProvider={isBlocked ? getActiveProviderName() : null}
                />
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Calendar Integration */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Calendar Sync</h2>
            <p className="text-sm text-muted-foreground">
              Automatically add coaching sessions to your calendar
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calendarProviders.map((provider) => {
              const connection = getConnection(provider.id);
              return (
                <CalendarConnectionCard
                  key={provider.id}
                  provider={provider.id}
                  providerName={provider.name}
                  providerIcon={provider.icon}
                  providerColor={provider.color}
                  isConnected={!!connection}
                  syncEnabled={connection?.sync_enabled}
                  onConnect={() => handleCalendarConnect(provider.id, provider.isCalDAV)}
                  onDisconnect={() => connection && disconnectCalendar.mutate(connection.id)}
                  onToggleSync={(enabled) =>
                    connection && toggleSync.mutate({ connectionId: connection.id, enabled })
                  }
                  onSyncAll={() => syncAllSessions.mutate()}
                  isConnecting={connectCalendar.isPending}
                  isSyncing={syncAllSessions.isPending}
                  supportsTwoWaySync={provider.isCalDAV}
                />
              );
            })}
          </div>
        </div>

        {/* Apple Calendar Connect Modal */}
        <AppleCalendarConnectModal
          open={appleCalendarModalOpen}
          onOpenChange={setAppleCalendarModalOpen}
        />

        <Separator />

        {/* Data & Privacy */}
        <Card className="p-4 bg-muted/50 border-muted">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-2">
              <h3 className="font-medium">Data & Privacy</h3>
              <p className="text-sm text-muted-foreground">
                When you connect integrations, your data is handled according to our privacy practices. 
                Learn more about how we protect your data.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <Link to="/privacy#integrations" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
      </FeatureGate>
    </DashboardLayout>
  );
};

export default CoachIntegrations;
