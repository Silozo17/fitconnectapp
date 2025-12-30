import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
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

function TrendItem({ trend }: { trend: TrendData }) {
  const Icon = iconMap[trend.icon] || Footprints;

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
        <div className="p-2 rounded-xl bg-muted/50">
          <Icon className="h-4 w-4 text-muted-foreground" />
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
      <Card variant="elevated" className={cn("rounded-3xl", className)}>
        <CardContent className="p-5">
          <ShimmerSkeleton className="h-5 w-32 mb-4" />
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
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return null; // Don't show if no wearable data
  }

  return (
    <Card variant="elevated" className={cn("rounded-3xl", className)}>
      <CardContent className="p-5">
        <h3 className="font-semibold text-foreground mb-3">
          {t("client.trends.title", "Weekly Trends")}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t("client.trends.subtitle", "Compared to last week")}
        </p>
        <div>
          {trends.map((trend) => (
            <TrendItem key={trend.type} trend={trend} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default WearableTrendCard;
