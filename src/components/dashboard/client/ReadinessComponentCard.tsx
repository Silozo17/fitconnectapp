import { useReadinessScore } from "@/hooks/useReadinessScore";
import { Moon, Heart, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";

type ComponentType = "sleep" | "recovery" | "activity";

interface ReadinessComponentCardProps {
  type: ComponentType;
  className?: string;
}

const componentConfig = {
  sleep: {
    icon: Moon,
    label: "Sleep",
    colors: {
      bg: "from-purple-500/10 via-background to-indigo-600/5",
      border: "border-purple-500/30",
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400",
      accent: "from-purple-400/60 via-indigo-400/40 to-transparent",
    },
  },
  recovery: {
    icon: Heart,
    label: "Recovery",
    colors: {
      bg: "from-red-500/10 via-background to-pink-600/5",
      border: "border-red-500/30",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
      accent: "from-red-400/60 via-pink-400/40 to-transparent",
    },
  },
  activity: {
    icon: Activity,
    label: "Activity",
    colors: {
      bg: "from-green-500/10 via-background to-emerald-600/5",
      border: "border-green-500/30",
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
      accent: "from-green-400/60 via-emerald-400/40 to-transparent",
    },
  },
};

export function ReadinessComponentCard({ type, className }: ReadinessComponentCardProps) {
  const { readiness, isLoading, hasData } = useReadinessScore();
  const config = componentConfig[type];
  const Icon = config.icon;

  if (isLoading) {
    return (
      <div className={cn("relative overflow-hidden rounded-2xl p-4 border border-border/50 bg-gradient-to-br from-primary/5 via-background to-accent/5", className)}>
        <ShimmerSkeleton className="h-9 w-9 rounded-xl mb-3" />
        <ShimmerSkeleton className="h-3 w-12 mb-1" />
        <ShimmerSkeleton className="h-5 w-16" />
      </div>
    );
  }

  if (!hasData || !readiness) {
    return null;
  }

  const component = readiness.components[type];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 border",
        `bg-gradient-to-br ${config.colors.bg}`,
        config.colors.border,
        className
      )}
    >
      {/* Top accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", config.colors.accent)} />

      <div className={cn("p-2 rounded-xl w-fit", config.colors.iconBg)}>
        <Icon className={cn("h-4 w-4", config.colors.iconColor)} />
      </div>

      <div className="mt-3">
        <div className="text-xs text-muted-foreground capitalize mb-0.5">
          {config.label}
        </div>
        <div className="font-semibold text-foreground text-lg">
          {component.value !== null
            ? `${component.value}${component.unit}`
            : "—"}
        </div>
      </div>
    </div>
  );
}

export default ReadinessComponentCard;
