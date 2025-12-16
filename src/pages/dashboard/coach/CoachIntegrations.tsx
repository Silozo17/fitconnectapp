import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VideoProviderCard from "@/components/integrations/VideoProviderCard";
import CalendarConnectionCard from "@/components/integrations/CalendarConnectionCard";
import { useVideoConference, VideoProvider } from "@/hooks/useVideoConference";
import { useCalendarSync, CalendarProvider } from "@/hooks/useCalendarSync";
import { Video, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
}[] = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    icon: <Calendar className="w-6 h-6 text-white" />,
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
];

const CoachIntegrations = () => {
  const {
    connectVideoProvider,
    disconnectVideoProvider,
    updateSettings,
    getSettings,
    isLoading: videoLoading,
  } = useVideoConference();

  const {
    connectCalendar,
    disconnectCalendar,
    toggleSync,
    getConnection,
    isLoading: calendarLoading,
  } = useCalendarSync();

  return (
    <DashboardLayout
      title="Integrations"
      description="Connect video conferencing and calendar services"
    >
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
              return (
                <VideoProviderCard
                  key={provider.id}
                  provider={provider.id}
                  providerName={provider.name}
                  providerIcon={provider.icon}
                  providerColor={provider.color}
                  isConnected={!!settings}
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
                  onConnect={() => connectCalendar.mutate(provider.id)}
                  onDisconnect={() => connection && disconnectCalendar.mutate(connection.id)}
                  onToggleSync={(enabled) =>
                    connection && toggleSync.mutate({ connectionId: connection.id, enabled })
                  }
                  isConnecting={connectCalendar.isPending}
                />
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoachIntegrations;
