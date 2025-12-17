import { useState } from "react";
import { Activity, Heart, Watch, Apple, Smartphone, PenLine } from "lucide-react";
import WearableConnectionCard from "./WearableConnectionCard";
import { useWearables, WearableProvider } from "@/hooks/useWearables";
import ManualHealthDataModal from "./ManualHealthDataModal";
import { Button } from "@/components/ui/button";

const providers: {
  id: WearableProvider;
  name: string;
  icon: React.ReactNode;
  color: string;
  comingSoon?: boolean;
  description?: string;
}[] = [
  {
    id: "apple_health",
    name: "Apple Health",
    icon: <Apple className="w-6 h-6 text-white" />,
    color: "bg-gradient-to-br from-pink-500 to-red-500",
    comingSoon: true,
    description: "Requires FitConnect iOS app",
  },
  {
    id: "google_fit",
    name: "Google Fit",
    icon: <Activity className="w-6 h-6 text-white" />,
    color: "bg-gradient-to-br from-blue-500 to-green-500",
  },
  {
    id: "fitbit",
    name: "Fitbit",
    icon: <Heart className="w-6 h-6 text-white" />,
    color: "bg-gradient-to-br from-teal-500 to-cyan-500",
  },
  {
    id: "garmin",
    name: "Garmin",
    icon: <Watch className="w-6 h-6 text-white" />,
    color: "bg-gradient-to-br from-blue-600 to-blue-800",
  },
];

const WearableConnectionList = () => {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const {
    connections,
    isLoading,
    connectWearable,
    disconnectWearable,
    syncWearable,
    getConnection,
  } = useWearables();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-card/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Manual Entry Option */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-dashed border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <PenLine className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Manual Health Data Entry</h4>
            <p className="text-sm text-muted-foreground">
              Log steps, heart rate, sleep, and calories manually
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowManualEntry(true)}>
          Log Data
        </Button>
      </div>

      {/* Wearable Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {providers.map((provider) => {
          const connection = getConnection(provider.id);
          return (
            <WearableConnectionCard
              key={provider.id}
              provider={provider.id}
              providerName={provider.name}
              providerIcon={provider.icon}
              providerColor={provider.color}
              isConnected={!!connection}
              lastSynced={connection?.last_synced_at}
              onConnect={() => connectWearable.mutate(provider.id)}
              onDisconnect={() => connection && disconnectWearable.mutate(connection.id)}
              onSync={() => connection && syncWearable.mutate(connection.id)}
              isConnecting={connectWearable.isPending}
              isSyncing={syncWearable.isPending}
              comingSoon={provider.comingSoon}
              comingSoonDescription={provider.description}
            />
          );
        })}
      </div>

      <ManualHealthDataModal open={showManualEntry} onOpenChange={setShowManualEntry} />
    </div>
  );
};

export default WearableConnectionList;
