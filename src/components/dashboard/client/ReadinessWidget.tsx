import { useTranslation } from "react-i18next";
import { useReadinessScore } from "@/hooks/useReadinessScore";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Progress } from "@/components/ui/progress";
import { Battery, Moon, Heart, Activity, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";

interface ReadinessWidgetProps {
  className?: string;
}

const readinessExplanation = {
  title: "Readiness Score",
  description: "A daily score (0-100) based on your sleep quality, heart rate, and recent activity. Higher scores suggest you're ready for intense training.",
  goodRange: "70-100 is optimal for high-intensity workouts",
  howToImprove: "Prioritize 7-9 hours of sleep and allow rest after intense training days.",
};

export function ReadinessWidget({ className }: ReadinessWidgetProps) {
  const { t } = useTranslation("dashboard");
  const { readiness, isLoading, hasData } = useReadinessScore();

  if (isLoading) {
    return (
      <div className={cn("relative bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-5 border border-border/50", className)}>
        <div className="flex items-center gap-3 mb-4">
          <ShimmerSkeleton className="h-12 w-12 rounded-2xl" />
          <div className="space-y-2">
            <ShimmerSkeleton className="h-5 w-32" />
            <ShimmerSkeleton className="h-3 w-24" />
          </div>
        </div>
        <ShimmerSkeleton className="h-3 w-full rounded-full" />
      </div>
    );
  }

  if (!hasData || !readiness) {
    return (
      <div className={cn("relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-5 border border-border/50", className)}>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-accent/40 to-transparent" />
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-muted/50">
            <Battery className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Daily Readiness</h3>
            <p className="text-xs text-muted-foreground">Waiting for today's data</p>
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <Sparkles className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Sync your wearable to see your readiness score
          </p>
        </div>
      </div>
    );
  }

  const componentIcons = {
    sleep: Moon,
    recovery: Heart,
    activity: Activity,
  };

  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-5 border border-border/50", className)}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-accent/40 to-transparent" />

      {/* Score display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/15">
            <Battery className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-center gap-1.5">
            <InfoTooltip explanation={readinessExplanation} side="top" />
          </div>
        </div>
        <div className={cn("text-3xl font-bold", readiness.color)}>
          {readiness.score}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <Progress
          value={readiness.score}
          className="h-2.5"
        />
      </div>

      {/* Component breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {(Object.entries(readiness.components) as [keyof typeof componentIcons, typeof readiness.components.sleep][]).map(
          ([key, component]) => {
            const Icon = componentIcons[key];
            return (
              <div
                key={key}
                className="bg-muted/50 rounded-xl p-3 text-center"
              >
                <Icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                <div className="text-xs text-muted-foreground capitalize mb-0.5">
                  {key}
                </div>
                <div className="font-semibold text-foreground text-sm">
                  {component.value !== null
                    ? `${component.value}${component.unit}`
                    : "—"}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Recommendation */}
      <div className="flex items-start gap-2 bg-muted/30 rounded-xl p-3">
        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          {readiness.recommendation}
        </p>
      </div>
    </div>
  );
}

// Export readiness level for use in section description
export function useReadinessLevel() {
  const { readiness, hasData } = useReadinessScore();
  if (!hasData || !readiness) return null;
  return `${readiness.level.charAt(0).toUpperCase() + readiness.level.slice(1)} Readiness`;
}

export default ReadinessWidget;
