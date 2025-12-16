import { Activity, Heart, Watch, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWearables, WearableProvider } from "@/hooks/useWearables";

interface WearablesOnboardingStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

const WEARABLE_PROVIDERS: {
  id: WearableProvider;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: "google_fit",
    name: "Google Fit",
    description: "Steps, heart rate, workouts",
    icon: <Activity className="w-5 h-5 text-white" />,
    color: "bg-gradient-to-br from-blue-500 to-green-500",
  },
  {
    id: "fitbit",
    name: "Fitbit",
    description: "Activity, sleep, heart rate",
    icon: <Heart className="w-5 h-5 text-white" />,
    color: "bg-gradient-to-br from-teal-500 to-cyan-500",
  },
  {
    id: "garmin",
    name: "Garmin",
    description: "Workouts, GPS, performance",
    icon: <Watch className="w-5 h-5 text-white" />,
    color: "bg-gradient-to-br from-blue-600 to-blue-800",
  },
];

const WearablesOnboardingStep = ({ onComplete, onSkip }: WearablesOnboardingStepProps) => {
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
            Connect your devices
          </h2>
          <p className="text-muted-foreground">Loading your connections...</p>
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
          Connect your fitness devices
        </h2>
        <p className="text-muted-foreground">
          Sync your health data to track progress and share insights with your coaches.
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
                isConnected
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
                    <p className="font-medium text-foreground">{provider.name}</p>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  </div>
                </div>
                {isConnected ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Connected</span>
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
                        Connect
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
          <strong className="text-foreground">Why connect?</strong> Your health data helps coaches create better, 
          personalized plans. All data is private and only shared with coaches you choose to work with.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onSkip} className="flex-1">
          Set up later
        </Button>
        <Button 
          onClick={onComplete} 
          className="flex-1 bg-primary text-primary-foreground"
        >
          {hasAnyConnection ? "Continue" : "Skip for now"}
        </Button>
      </div>
    </div>
  );
};

export default WearablesOnboardingStep;
