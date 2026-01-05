import { useTranslation } from "react-i18next";
import { AccentCard, AccentCardContent } from "@/components/ui/accent-card";
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
      <AccentCard className={cn("rounded-2xl", className)}>
        <AccentCardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <ShimmerSkeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <ShimmerSkeleton className="h-5 w-32" />
              <ShimmerSkeleton className="h-3 w-24" />
            </div>
          </div>
          <ShimmerSkeleton className="h-3 w-full rounded-full" />
        </AccentCardContent>
      </AccentCard>
    );
  }

  if (!hasData || !readiness) {
    return null;
  }

  const componentIcons = {
    sleep: Moon,
    recovery: Heart,
    activity: Activity,
  };

  return (
    <AccentCard className={cn("rounded-2xl", className)}>
      <AccentCardContent className="p-5">
        {/* Header with score */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/15">
              <Battery className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground capitalize flex items-center gap-1.5">
                {readiness.level} readiness
                <InfoTooltip explanation={readinessExplanation} side="top" />
              </p>
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
      </AccentCardContent>
    </AccentCard>
  );
}

export default ReadinessWidget;
