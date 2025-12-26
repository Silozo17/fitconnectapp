import { useState } from "react";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import WearableConnectionList from "@/components/integrations/WearableConnectionList";
import CalendarConnectionCard from "@/components/integrations/CalendarConnectionCard";
import HealthDataWidget from "@/components/integrations/HealthDataWidget";
import AppleCalendarConnectModal from "@/components/integrations/AppleCalendarConnectModal";
import { useCalendarSync, CalendarProvider } from "@/hooks/useCalendarSync";
import { Calendar, Apple, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";

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

const ClientIntegrations = () => {
  const [showAppleCalendarModal, setShowAppleCalendarModal] = useState(false);
  const { connectCalendar, disconnectCalendar, toggleSync, getConnection, isLoading } =
    useCalendarSync();

  const handleCalendarConnect = (provider: CalendarProvider, isCalDAV?: boolean) => {
    if (isCalDAV) {
      setShowAppleCalendarModal(true);
    } else {
      connectCalendar.mutate({ provider });
    }
  };

  return (
    <ClientDashboardLayout
      title="Integrations"
      description="Connect your fitness wearables and calendars"
    >
      <PageHelpBanner
        pageKey="client_integrations"
        title="Connect Your Devices"
        description="Sync health data from Apple Health, Google Fit, and wearables"
      />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your fitness devices and calendars to sync your health data
          </p>
        </div>

        {/* Health Data Widget */}
        <HealthDataWidget />

        <Separator />

        {/* Wearable Devices */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Fitness Wearables</h2>
            <p className="text-sm text-muted-foreground">
              Connect your fitness tracker to automatically sync steps, heart rate, sleep, and more
            </p>
          </div>
          <WearableConnectionList />
        </div>

        <Separator />

        {/* Calendar Integration */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Calendar Sync</h2>
            <p className="text-sm text-muted-foreground">
              Automatically add your coaching sessions to your calendar
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  isConnecting={connectCalendar.isPending}
                />
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Data & Privacy */}
        <Card className="p-5 bg-muted/30 border-muted/50 rounded-2xl backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
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

      <AppleCalendarConnectModal
        open={showAppleCalendarModal}
        onOpenChange={setShowAppleCalendarModal}
      />
    </ClientDashboardLayout>
  );
};

export default ClientIntegrations;
