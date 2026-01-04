import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Activity, Apple, PenLine, Watch, Info } from "lucide-react";
import WearableConnectionCard from "./WearableConnectionCard";
import { useWearables, WearableProvider } from "@/hooks/useWearables";
import ManualHealthDataModal from "./ManualHealthDataModal";
import HealthKitDisclosureModal from "./HealthKitDisclosureModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEnvironment } from "@/hooks/useEnvironment";

const WearableConnectionList = () => {
  const { t } = useTranslation('settings');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showHealthKitDisclosure, setShowHealthKitDisclosure] = useState(false);
  const [pendingHealthKitConnect, setPendingHealthKitConnect] = useState(false);
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
  // - Apple Health: ONLY visible on iOS native
  // - Health Connect: ONLY visible on Android native
  // - Fitbit/Garmin: REMOVED - users should connect these to their phone's health app
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

    // Apple Health: ONLY on iOS native
    if (isIOSNative) {
      allProviders.push({
        id: "apple_health" as WearableProvider,
        name: "Apple Health",
        icon: <Apple className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-pink-500 to-red-500",
        disabled: false,
      });
    }

    // Health Connect: ONLY on Android native
    if (isAndroidNative) {
      allProviders.push({
        id: "health_connect" as WearableProvider,
        name: "Health Connect",
        icon: <Activity className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-green-500 to-teal-500",
        disabled: false,
      });
    }

    // Fitbit and Garmin removed - users connect via their phone's health app

    return allProviders;
  }, [isDespia, isIOS, isAndroid]);

  // Handle connect with individual loading state tracking
  const handleConnect = useCallback(async (providerId: WearableProvider) => {
    // For Apple Health on iOS, show disclosure modal first (required by Apple Guideline 2.5.1)
    if (providerId === 'apple_health' && isDespia && isIOS) {
      setPendingHealthKitConnect(true);
      setShowHealthKitDisclosure(true);
      return;
    }
    
    // For other providers, connect directly
    await performConnect(providerId);
  }, [isDespia, isIOS]);

  // Actually perform the connection after disclosure is acknowledged
  const performConnect = useCallback(async (providerId: WearableProvider) => {
    setConnectingProvider(providerId);
    try {
      await connectWearable.mutateAsync(providerId);
    } catch (error) {
      // Error already handled by toast in mutation
      console.log('[WearableConnectionList] Connection failed:', error);
    } finally {
      setConnectingProvider(null);
      setPendingHealthKitConnect(false);
    }
  }, [connectWearable]);

  // Handle HealthKit disclosure modal continue action
  const handleHealthKitContinue = useCallback(() => {
    setShowHealthKitDisclosure(false);
    if (pendingHealthKitConnect) {
      performConnect('apple_health');
    }
  }, [pendingHealthKitConnect, performConnect]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="glass" className="h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  const isIOSNative = isDespia && isIOS;
  const isAndroidNative = isDespia && isAndroid;
  const isNativeApp = isIOSNative || isAndroidNative;

  return (
    <div className="space-y-4">
      {/* Supported Devices Info Card - only show on native apps */}
      {isNativeApp && (
        <Card variant="glass" className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Watch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">
                  {t('integrations.supportedDevices.title', 'Sync Your Wearable')}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {isIOSNative 
                    ? t('integrations.supportedDevices.iosDescription', 'Connect Apple Health to sync your fitness data. Any wearable that writes to Apple Health will automatically sync with FitConnect.')
                    : t('integrations.supportedDevices.androidDescription', 'Connect Health Connect to sync your fitness data. Any wearable that writes to Health Connect will automatically sync with FitConnect.')
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="font-medium text-foreground">{t('integrations.supportedDevices.supported', 'Supported devices')}:</span>{' '}
                  {isIOSNative
                    ? 'Apple Watch, Fitbit, Garmin, Huawei Watch, Samsung Watch, Oura Ring, WHOOP'
                    : 'Samsung Watch, Fitbit, Garmin, Huawei Watch, Xiaomi Mi Band, Oura Ring, WHOOP'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wearable Providers Grid */}
      {providers.length > 0 && (
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
      )}

      {/* Web fallback message */}
      {!isNativeApp && (
        <Card variant="glass" className="border-border">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Info className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">
                  {t('integrations.installAppTitle', 'Install the FitConnect App')}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t('integrations.installAppDescription', 'To sync your health data from wearables, install the FitConnect app on your iOS or Android device. The app connects to Apple Health or Health Connect, which automatically syncs data from your wearable devices.')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Entry Card */}
      <Card variant="glass" className="border-dashed">
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
      
      {/* HealthKit Disclosure Modal - required by Apple Guideline 2.5.1 */}
      <HealthKitDisclosureModal
        open={showHealthKitDisclosure}
        onOpenChange={(open) => {
          setShowHealthKitDisclosure(open);
          if (!open) setPendingHealthKitConnect(false);
        }}
        onContinue={handleHealthKitContinue}
        isLoading={connectingProvider === 'apple_health'}
      />
    </div>
  );
};

export default WearableConnectionList;
