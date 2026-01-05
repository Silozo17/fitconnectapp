import { useState, useEffect, useRef } from "react";
import { useReadinessScore } from "@/hooks/useReadinessScore";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Battery, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";

interface ReadinessScoreCardProps {
  className?: string;
}

const readinessExplanation = {
  title: "Readiness Score",
  description: "A daily score (0-100) based on your sleep quality, heart rate, and recent activity. Higher scores suggest you're ready for intense training.",
  goodRange: "70-100 is optimal for high-intensity workouts",
  howToImprove: "Prioritize 7-9 hours of sleep and allow rest after intense training days.",
};

// Returns gradient class based on score range
const getProgressGradient = (score: number) => {
  if (score < 34) return "from-red-500 to-red-400";
  if (score < 67) return "from-orange-500 to-yellow-400";
  return "from-green-500 to-emerald-400";
};

// Returns background gradient for card based on score
const getCardGradient = (score: number) => {
  if (score < 34) return "from-red-500/10 via-background to-red-600/5";
  if (score < 67) return "from-orange-500/10 via-background to-yellow-600/5";
  return "from-green-500/10 via-background to-emerald-600/5";
};

// Returns border color based on score
const getBorderColor = (score: number) => {
  if (score < 34) return "border-red-500/30";
  if (score < 67) return "border-orange-500/30";
  return "border-green-500/30";
};

// Returns accent line gradient based on score
const getAccentGradient = (score: number) => {
  if (score < 34) return "from-red-400/60 via-red-500/40 to-transparent";
  if (score < 67) return "from-orange-400/60 via-yellow-400/40 to-transparent";
  return "from-green-400/60 via-emerald-400/40 to-transparent";
};

export function ReadinessScoreCard({ className }: ReadinessScoreCardProps) {
  const { readiness, isLoading, hasData } = useReadinessScore();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Animate progress bar on first view
  useEffect(() => {
    if (!readiness || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          // Animate from 0 to actual score over 1 second
          const duration = 1000;
          const startTime = performance.now();
          const targetScore = readiness.score;

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.round(targetScore * easeOut));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [readiness, hasAnimated]);

  if (isLoading) {
    return (
      <div className={cn("relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-5 border border-border/50", className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShimmerSkeleton className="h-12 w-12 rounded-2xl" />
            <ShimmerSkeleton className="h-5 w-32" />
          </div>
          <ShimmerSkeleton className="h-8 w-12" />
        </div>
        <ShimmerSkeleton className="h-4 w-full rounded-full" />
      </div>
    );
  }

  if (!hasData || !readiness) {
    return null;
  }

  const score = hasAnimated ? displayValue : 0;

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 border",
        `bg-gradient-to-br ${getCardGradient(readiness.score)}`,
        getBorderColor(readiness.score),
        className
      )}
    >
      {/* Top accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", getAccentGradient(readiness.score))} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-2xl",
            readiness.score < 34 ? "bg-red-500/15" :
            readiness.score < 67 ? "bg-orange-500/15" : "bg-green-500/15"
          )}>
            <Battery className={cn(
              "h-5 w-5",
              readiness.score < 34 ? "text-red-400" :
              readiness.score < 67 ? "text-orange-400" : "text-green-400"
            )} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground">Readiness</span>
            <InfoTooltip explanation={readinessExplanation} side="top" />
          </div>
        </div>
        <div className={cn(
          "text-3xl font-bold",
          readiness.score < 34 ? "text-red-400" :
          readiness.score < 67 ? "text-orange-400" : "text-green-400"
        )}>
          {score}
        </div>
      </div>

      {/* Progress bar with gradient */}
      <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out",
            getProgressGradient(readiness.score)
          )}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Recommendation */}
      <div className="flex items-start gap-2 mt-4 bg-muted/30 rounded-xl p-3">
        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          {readiness.recommendation}
        </p>
      </div>
    </div>
  );
}

export default ReadinessScoreCard;
