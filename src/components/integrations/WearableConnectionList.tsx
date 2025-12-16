import { Activity, Heart, Watch } from "lucide-react";
import WearableConnectionCard from "./WearableConnectionCard";
import { useWearables, WearableProvider } from "@/hooks/useWearables";

const providers: {
  id: WearableProvider;
  name: string;
  icon: React.ReactNode;
  color: string;
}[] = [
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
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-card/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          />
        );
      })}
    </div>
  );
};

export default WearableConnectionList;
