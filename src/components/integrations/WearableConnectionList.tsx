import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Activity, Heart, Watch, Apple, PenLine } from "lucide-react";
import WearableConnectionCard from "./WearableConnectionCard";
import { useWearables, WearableProvider } from "@/hooks/useWearables";
import ManualHealthDataModal from "./ManualHealthDataModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEnvironment } from "@/hooks/useEnvironment";

const WearableConnectionList = () => {
  const { t } = useTranslation('settings');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<WearableProvider | null>(null);
  const { isDespia, isIOS, isAndroid } = useEnvironment();
  const {
    connections,
    isLoading,
    connectWearable,
    disconnectWearable,
    syncWearable,
    getConnection,
  } = useWearables();

  // Platform-aware provider configuration
  // STRICT RULES:
  // - Apple Health: ONLY visible on iOS native (NOT on web, NOT on Android)
  // - Health Connect: ONLY visible on Android native (NOT on web, NOT on iOS)
  // - Fitbit/Garmin: Always available (OAuth-based, works everywhere)
  const providers = useMemo(() => {
    const isIOSNative = isDespia && isIOS;
    const isAndroidNative = isDespia && isAndroid;

    const allProviders: Array<{
      id: WearableProvider;
      name: string;
      icon: React.ReactNode;
      color: string;
      disabled?: boolean;
      disabledMessage?: string;
    }> = [];

    // Apple Health: ONLY on iOS native - never on web, never on Android
    if (isIOSNative) {
      allProviders.push({
        id: "apple_health" as WearableProvider,
        name: "Apple Health",
        icon: <Apple className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-pink-500 to-red-500",
        disabled: false,
      });
    }

    // Health Connect: ONLY on Android native - never on web, never on iOS
    if (isAndroidNative) {
      allProviders.push({
        id: "health_connect" as WearableProvider,
        name: "Health Connect",
        icon: <Activity className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-green-500 to-teal-500",
        disabled: false,
      });
    }

    // Fitbit and Garmin: Always available (OAuth-based, works on all platforms)
    allProviders.push(
      {
        id: "fitbit" as WearableProvider,
        name: "Fitbit",
        icon: <Heart className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-teal-500 to-cyan-500",
        disabled: false,
      },
      {
        id: "garmin" as WearableProvider,
        name: "Garmin",
        icon: <Watch className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-blue-600 to-blue-800",
        disabled: false,
      }
    );

    return allProviders;
  }, [isDespia, isIOS, isAndroid]);

  // Handle connect with individual loading state tracking
  const handleConnect = useCallback(async (providerId: WearableProvider) => {
    setConnectingProvider(providerId);
    try {
      await connectWearable.mutateAsync(providerId);
    } catch (error) {
      // Error already handled by toast in mutation
      console.log('[WearableConnectionList] Connection failed:', error);
    } finally {
      setConnectingProvider(null);
    }
  }, [connectWearable]);

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
      {/* Wearable Providers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              onConnect={() => handleConnect(provider.id)}
              onDisconnect={() => connection && disconnectWearable.mutate(connection.id)}
              onSync={() => connection && syncWearable.mutate(provider.id)}
              isConnecting={connectingProvider === provider.id}
              isSyncing={syncWearable.isPending}
              disabled={provider.disabled}
              disabledMessage={provider.disabledMessage}
            />
          );
        })}
      </div>

      {/* Manual Entry Card */}
      <Card className="bg-card/50 border-dashed border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <PenLine className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-sm">{t('integrations.manualHealthData')}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('integrations.manualHealthDesc')}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowManualEntry(true)} className="shrink-0">
              {t('integrations.logData')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ManualHealthDataModal open={showManualEntry} onOpenChange={setShowManualEntry} />
    </div>
  );
};

export default WearableConnectionList;
