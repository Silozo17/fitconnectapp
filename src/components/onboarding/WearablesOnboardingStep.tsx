import { useEffect, useRef, useMemo } from "react";
import { Activity, Heart, Watch, CheckCircle, ExternalLink, Loader2, Apple, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  comingSoon: boolean;
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
  const providers: WearableProviderConfig[] = useMemo(() => {
    const isIOSNative = isDespia && isIOS;
    const isAndroidNative = isDespia && isAndroid;

    return [
      {
        id: "apple_health",
        nameKey: "integrations.wearables.appleHealth.name",
        descriptionKey: "integrations.wearables.appleHealth.description",
        icon: <Apple className="w-5 h-5 text-white" />,
        color: "bg-gradient-to-br from-pink-500 to-red-500",
        // Available on iOS native only
        comingSoon: !isIOSNative,
      },
      {
        id: "health_connect",
        nameKey: "integrations.wearables.healthConnect.name",
        descriptionKey: "integrations.wearables.healthConnect.description",
        icon: <Activity className="w-5 h-5 text-white" />,
        color: "bg-gradient-to-br from-green-500 to-teal-500",
        // Available on Android native only
        comingSoon: !isAndroidNative,
      },
      {
        id: "fitbit",
        nameKey: "integrations.wearables.fitbit.name",
        descriptionKey: "integrations.wearables.fitbit.description",
        icon: <Heart className="w-5 h-5 text-white" />,
        color: "bg-gradient-to-br from-teal-500 to-cyan-500",
        comingSoon: false,
      },
      {
        id: "garmin",
        nameKey: "integrations.wearables.garmin.name",
        descriptionKey: "integrations.wearables.garmin.description",
        icon: <Watch className="w-5 h-5 text-white" />,
        color: "bg-gradient-to-br from-blue-600 to-blue-800",
        comingSoon: true,
      },
    ];
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

      <div className="space-y-3">
        {providers.map((provider) => {
          const connection = getConnection(provider.id);
          const isConnected = !!connection;
          const isConnecting = connectWearable.isPending;

          return (
            <div
              key={provider.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                provider.comingSoon
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
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm">{t(provider.nameKey)}</p>
                      {provider.comingSoon && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {t('common.comingSoon')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{t(provider.descriptionKey)}</p>
                  </div>
                </div>
                {provider.comingSoon ? (
                  <Button variant="outline" size="sm" disabled>
                    {t('common.comingSoon')}
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

      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-xs sm:text-sm text-muted-foreground">
          <span className="text-foreground font-medium">Tip:</span> {t('integrations.wearables.syncHealthData')}
        </p>
      </div>
    </div>
  );
};

export default WearablesOnboardingStep;
