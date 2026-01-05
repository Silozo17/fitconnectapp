import { useTranslation } from "react-i18next";
import { useWearableTrends, TrendData } from "@/hooks/useWearableTrends";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Footprints,
  Timer,
  Moon,
  Flame,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";

interface WearableTrendCardProps {
  className?: string;
}

const iconMap: Record<string, React.ElementType> = {
  Footprints,
  Timer,
  Moon,
  Flame,
  Heart,
};

// Color mapping for each trend type
const colorMap: Record<string, { bg: string; text: string }> = {
  steps: { bg: "bg-blue-500/20", text: "text-blue-400" },
  active_minutes: { bg: "bg-green-500/20", text: "text-green-400" },
  sleep: { bg: "bg-purple-500/20", text: "text-purple-400" },
  calories: { bg: "bg-orange-500/20", text: "text-orange-400" },
  heart_rate: { bg: "bg-red-500/20", text: "text-red-400" },
};

function TrendItem({ trend }: { trend: TrendData }) {
  const Icon = iconMap[trend.icon] || Footprints;
  const colors = colorMap[trend.type] || { bg: "bg-muted/50", text: "text-muted-foreground" };

  const TrendIcon =
    trend.trend === "up"
      ? TrendingUp
      : trend.trend === "down"
      ? TrendingDown
      : Minus;

  const trendColor = trend.isPositive
    ? "text-green-500"
    : trend.trend === "stable"
    ? "text-muted-foreground"
    : "text-amber-500";

  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-xl", colors.bg)}>
          <Icon className={cn("h-4 w-4", colors.text)} />
        </div>
        <div>
          <div className="font-medium text-foreground text-sm">
            {trend.label}
          </div>
          <div className="text-xs text-muted-foreground">
            {trend.currentWeekAvg.toLocaleString()}
            {trend.unit && ` ${trend.unit}`} avg
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <TrendIcon className={cn("h-4 w-4", trendColor)} />
        <span className={cn("text-sm font-medium", trendColor)}>
          {trend.trend === "stable"
            ? "Stable"
            : `${trend.percentChange > 0 ? "+" : ""}${trend.percentChange}%`}
        </span>
      </div>
    </div>
  );
}

export function WearableTrendCard({ className }: WearableTrendCardProps) {
  const { t } = useTranslation("dashboard");
  const { trends, isLoading, hasData } = useWearableTrends();

  if (isLoading) {
    return (
      <div className={cn("relative bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-5 border border-border/50", className)}>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <ShimmerSkeleton className="h-9 w-9 rounded-xl" />
                <div className="space-y-1">
                  <ShimmerSkeleton className="h-4 w-24" />
                  <ShimmerSkeleton className="h-3 w-16" />
                </div>
              </div>
              <ShimmerSkeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasData) {
    return null; // Don't show if no wearable data
  }

  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-5 border border-border/50", className)}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-accent/40 to-transparent" />

      <p className="text-xs text-muted-foreground mb-3">
        {t("client.trends.subtitle", "Compared to last week")}
      </p>
      <div>
        {trends.map((trend) => (
          <TrendItem key={trend.type} trend={trend} />
        ))}
      </div>
    </div>
  );
}

export default WearableTrendCard;
