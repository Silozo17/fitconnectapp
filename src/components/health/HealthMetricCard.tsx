import { useMemo } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniWeeklyChart } from "./MiniWeeklyChart";

interface HealthMetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit: string;
  color: "blue" | "orange" | "green" | "red" | "purple" | "cyan";
  weeklyData?: { day: string; value: number }[];
  trend?: number; // Percentage change
  showTrend?: boolean; // Whether to show trend indicator (default true)
  className?: string;
}

const colorStyles = {
  blue: {
    bg: "from-blue-500/10 to-blue-600/5",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    accent: "from-blue-400/60",
  },
  orange: {
    bg: "from-orange-500/10 to-orange-600/5",
    border: "border-orange-500/20",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
    accent: "from-orange-400/60",
  },
  green: {
    bg: "from-green-500/10 to-green-600/5",
    border: "border-green-500/20",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
    accent: "from-green-400/60",
  },
  red: {
    bg: "from-red-500/10 to-pink-600/5",
    border: "border-red-500/20",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    accent: "from-red-400/60",
  },
  purple: {
    bg: "from-purple-500/10 to-indigo-600/5",
    border: "border-purple-500/20",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    accent: "from-purple-400/60",
  },
  cyan: {
    bg: "from-cyan-500/10 to-cyan-600/5",
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    accent: "from-cyan-400/60",
  },
};

export const HealthMetricCard = ({
  icon: Icon,
  label,
  value,
  unit,
  color,
  weeklyData = [],
  trend,
  showTrend = true,
  className,
}: HealthMetricCardProps) => {
  const styles = colorStyles[color];
  
  const shouldShowTrend = showTrend && trend !== undefined && trend !== 0;
  const trendPositive = trend && trend > 0;

  return (
    <div
      className={cn(
        "relative bg-gradient-to-br rounded-2xl p-4 border overflow-hidden",
        styles.bg,
        styles.border,
        className
      )}
    >
      {/* Top accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r to-transparent", styles.accent)} />

      {/* Header: Icon + Label + Trend */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-xl", styles.iconBg)}>
            <Icon className={cn("w-5 h-5", styles.iconColor)} />
          </div>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        {shouldShowTrend && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            trendPositive ? "text-green-500" : "text-red-500"
          )}>
            {trendPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-3">
        <span className="text-3xl font-bold text-foreground tracking-tight">
          {value}
        </span>
        <span className="text-sm text-muted-foreground ml-1">{unit}</span>
      </div>

      {/* Mini weekly chart */}
      <MiniWeeklyChart data={weeklyData} color={color} />
    </div>
  );
};
