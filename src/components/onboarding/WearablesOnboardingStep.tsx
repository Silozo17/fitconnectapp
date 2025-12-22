import { Activity, Heart, Watch, CheckCircle, ExternalLink, Loader2, Apple, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWearables, WearableProvider } from "@/hooks/useWearables";

interface WearablesOnboardingStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

const WEARABLE_PROVIDERS: {
  id: WearableProvider;
  nameKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  color: string;
  comingSoon?: boolean;
}[] = [
  {
    id: "apple_health",
    nameKey: "integrations.wearables.appleHealth.name",
    descriptionKey: "integrations.wearables.appleHealth.description",
    icon: <Apple className="w-5 h-5 text-white" />,
    color: "bg-gradient-to-br from-pink-500 to-red-500",
    comingSoon: true,
  },
  {
    id: "health_connect",
    nameKey: "integrations.wearables.healthConnect.name",
    descriptionKey: "integrations.wearables.healthConnect.description",
    icon: <Activity className="w-5 h-5 text-white" />,
    color: "bg-gradient-to-br from-green-500 to-teal-500",
    comingSoon: true,
  },
  {
    id: "fitbit",
    nameKey: "integrations.wearables.fitbit.name",
    descriptionKey: "integrations.wearables.fitbit.description",
    icon: <Heart className="w-5 h-5 text-white" />,
    color: "bg-gradient-to-br from-teal-500 to-cyan-500",
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

const WearablesOnboardingStep = ({ onComplete, onSkip }: WearablesOnboardingStepProps) => {
  const { t } = useTranslation('common');
  const {
    connections,
    isLoading,
    connectWearable,
    getConnection,
  } = useWearables();

  const hasAnyConnection = (connections?.length || 0) > 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            {t('onboardingIntegrations.wearables.title')}
          </h2>
          <p className="text-muted-foreground">{t('loading.default')}</p>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          {t('onboardingIntegrations.wearables.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('onboardingIntegrations.wearables.subtitle')}
        </p>
      </div>

      <div className="space-y-3">
        {WEARABLE_PROVIDERS.map((provider) => {
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
                      <p className="font-medium text-foreground">{t(provider.nameKey)}</p>
                      {provider.comingSoon && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {t('common.comingSoon')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{t(provider.descriptionKey)}</p>
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
                      // Store return info in sessionStorage
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

      <div className="p-4 rounded-xl bg-secondary">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('integrations.wearables.syncHealthData')}</strong>
        </p>
      </div>

      <Button 
        onClick={hasAnyConnection ? onComplete : onSkip} 
        className="w-full bg-primary text-primary-foreground"
      >
        {hasAnyConnection ? t('onboardingIntegrations.wearables.continueButton') : t('onboardingIntegrations.wearables.skipButton')}
      </Button>
    </div>
  );
};

export default WearablesOnboardingStep;
