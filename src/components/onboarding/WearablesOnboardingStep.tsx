import { useEffect, useRef, useMemo } from "react";
import { Activity, CheckCircle, ExternalLink, Loader2, Apple, Smartphone, Watch } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useWearables, WearableProvider } from "@/hooks/useWearables";
import { useEnvironment } from "@/hooks/useEnvironment";

interface WearablesOnboardingStepProps {
  /** Called to indicate state changes - parent controls footer */
  onStateChange?: (state: { hasAnyConnection: boolean; isLoading: boolean }) => void;
}

interface WearableProviderConfig {
  id: WearableProvider;
  nameKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  color: string;
  disabled: boolean;
  disabledMessage?: string;
}

export function useWearablesState() {
  const { connections, isLoading, connectWearable, getConnection } = useWearables();
  const hasAnyConnection = (connections?.length || 0) > 0;
  return { connections, isLoading, hasAnyConnection, connectWearable, getConnection };
}

const WearablesOnboardingStep = ({ onStateChange }: WearablesOnboardingStepProps) => {
  const { t } = useTranslation('common');
  const { isDespia, isIOS, isAndroid } = useEnvironment();
  const { connections, isLoading, connectWearable, getConnection } = useWearables();

  const hasAnyConnection = (connections?.length || 0) > 0;

  // Platform-aware provider configuration
  // Apple Health: ONLY visible on iOS native
  // Health Connect: ONLY visible on Android native
  // Fitbit/Garmin: REMOVED - users should connect to their phone's health app
  const providers: WearableProviderConfig[] = useMemo(() => {
    const isIOSNative = isDespia && isIOS;
    const isAndroidNative = isDespia && isAndroid;

    const allProviders: WearableProviderConfig[] = [];

    // Apple Health: Only on iOS native
    if (isIOSNative) {
      allProviders.push({
        id: "apple_health",
        nameKey: "integrations.wearables.appleHealth.name",
        descriptionKey: "integrations.wearables.appleHealth.description",
        icon: <Apple className="w-5 h-5 text-white" />,
        color: "bg-gradient-to-br from-pink-500 to-red-500",
        disabled: false,
      });
    }

    // Health Connect: Only on Android native
    if (isAndroidNative) {
      allProviders.push({
        id: "health_connect",
        nameKey: "integrations.wearables.healthConnect.name",
        descriptionKey: "integrations.wearables.healthConnect.description",
        icon: <Activity className="w-5 h-5 text-white" />,
        color: "bg-gradient-to-br from-green-500 to-teal-500",
        disabled: false,
      });
    }

    // Fitbit and Garmin removed - users connect via their phone's health app

    return allProviders;
  }, [isDespia, isIOS, isAndroid]);

  // Track previous state to avoid unnecessary calls
  const prevStateRef = useRef<{ hasAnyConnection: boolean; isLoading: boolean }>({ hasAnyConnection: false, isLoading: true });

  // Notify parent of state changes - MUST be in useEffect to avoid render-loop freezes
  useEffect(() => {
    if (
      prevStateRef.current.hasAnyConnection !== hasAnyConnection ||
      prevStateRef.current.isLoading !== isLoading
    ) {
      prevStateRef.current = { hasAnyConnection, isLoading };
      onStateChange?.({ hasAnyConnection, isLoading });
    }
  }, [hasAnyConnection, isLoading, onStateChange]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
            {t('onboardingIntegrations.wearables.title')}
          </h2>
          <p className="text-muted-foreground text-sm">{t('loading.default')}</p>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="mb-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          {t('onboardingIntegrations.wearables.title')}
        </h2>
        <p className="text-muted-foreground text-sm mt-1.5">
          {t('onboardingIntegrations.wearables.subtitle')}
        </p>
      </div>

      {/* Supported devices info */}
      <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Watch className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm mb-1">
              {t('integrations.supportedDevices.title', 'Sync Your Wearable')}
            </p>
            <p className="text-xs text-muted-foreground">
              {isDespia && isIOS
                ? t('integrations.supportedDevices.iosDescription', 'Connect Apple Health to sync your fitness data. Any wearable that writes to Apple Health will automatically sync with FitConnect.')
                : isDespia && isAndroid
                ? t('integrations.supportedDevices.androidDescription', 'Connect Health Connect to sync your fitness data. Any wearable that writes to Health Connect will automatically sync with FitConnect.')
                : t('integrations.supportedDevices.webDescription', 'Install the FitConnect app on your phone to sync wearable data via Apple Health (iOS) or Health Connect (Android).')
              }
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="font-medium text-foreground">{t('integrations.supportedDevices.supported', 'Supported devices')}:</span>{' '}
              {isDespia && isIOS
                ? 'Apple Watch, Fitbit, Garmin, Huawei Watch, Samsung Watch, Oura Ring, WHOOP'
                : 'Samsung Watch, Fitbit, Garmin, Huawei Watch, Xiaomi Mi Band, Oura Ring, WHOOP'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Provider connection cards - only show on native */}
      {providers.length > 0 && (
        <div className="space-y-3">
          {providers.map((provider) => {
            const connection = getConnection(provider.id);
            const isConnected = !!connection;
            const isConnecting = connectWearable.isPending;

            return (
              <div
                key={provider.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  provider.disabled
                    ? "border-border/50 bg-muted/30 opacity-75"
                    : isConnected
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${provider.color} flex items-center justify-center`}>
                      {provider.icon}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{t(provider.nameKey)}</p>
                      <p className="text-xs text-muted-foreground">
                        {provider.disabledMessage || t(provider.descriptionKey)}
                      </p>
                    </div>
                  </div>
                  {provider.disabled ? (
                    <Button variant="outline" size="sm" disabled>
                      <Smartphone className="w-4 h-4 mr-1" />
                      {t('integrations.installApp', 'Install App')}
                    </Button>
                  ) : isConnected ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{t('integrations.connected')}</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        sessionStorage.setItem("onboarding_return", "client");
                        connectWearable.mutate(provider.id);
                      }}
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
      )}

      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-xs sm:text-sm text-muted-foreground">
          <span className="text-foreground font-medium">Tip:</span> {t('integrations.wearables.syncHealthData')}
        </p>
      </div>
    </div>
  );
};

export default WearablesOnboardingStep;
