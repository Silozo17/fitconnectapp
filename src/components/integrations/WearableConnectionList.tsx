import { useState, useMemo } from "react";
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
  // Apple Health: available on iOS native, coming soon elsewhere
  // Health Connect: available on Android native, coming soon elsewhere
  const providers = useMemo(() => {
    const isIOSNative = isDespia && isIOS;
    const isAndroidNative = isDespia && isAndroid;

    return [
      {
        id: "apple_health" as WearableProvider,
        name: "Apple Health",
        icon: <Apple className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-pink-500 to-red-500",
        // Available on iOS native, coming soon on web/Android
        comingSoon: !isIOSNative,
        description: isIOSNative 
          ? t('integrations.syncWithAppleHealth', 'Sync your health data from Apple Health')
          : t('integrations.requiresIOSApp', 'Requires the FitConnect iOS app'),
      },
      {
        id: "health_connect" as WearableProvider,
        name: "Health Connect",
        icon: <Activity className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-green-500 to-teal-500",
        // Available on Android native, coming soon on web/iOS
        comingSoon: !isAndroidNative,
        description: isAndroidNative
          ? t('integrations.syncWithHealthConnect', 'Sync your health data from Health Connect')
          : t('integrations.requiresAndroidApp', 'Requires the FitConnect Android app'),
      },
      {
        id: "fitbit" as WearableProvider,
        name: "Fitbit",
        icon: <Heart className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-teal-500 to-cyan-500",
        comingSoon: false,
        description: undefined,
      },
      {
        id: "garmin" as WearableProvider,
        name: "Garmin",
        icon: <Watch className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-blue-600 to-blue-800",
        comingSoon: true,
        description: t('integrations.awaitingDeveloperAccess'),
      },
    ];
  }, [isDespia, isIOS, isAndroid, t]);

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
