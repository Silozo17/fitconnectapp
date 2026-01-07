/**
 * Discipline Metric Card - Styled like HealthMetricCard
 */

import { Activity, Flame, Heart, Timer, Dumbbell, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComputedMetric, DisciplineTheme, MetricFormatter } from "@/config/disciplines/types";
import { MiniWeeklyChart } from "@/components/health/MiniWeeklyChart";

interface DisciplineMetricCardProps {
  metric: ComputedMetric;
  theme: DisciplineTheme;
  weeklyData?: { day: string; value: number }[];
  className?: string;
}

const formatterToIcon: Record<MetricFormatter, React.ComponentType<{ className?: string }>> = {
  sessions: Activity,
  rounds: Flame,
  min: Timer,
  km: Activity,
  bpm: Heart,
  kg: Dumbbell,
  kcal: Flame,
  weeks: Timer,
  pace: Activity,
  m: Activity,
  sets: Dumbbell,
  time: Timer,
};

// Map theme accent to MiniWeeklyChart color
function getChartColor(accent: string): string {
  if (accent.includes('red')) return 'red';
  if (accent.includes('orange')) return 'orange';
  if (accent.includes('amber')) return 'orange';
  if (accent.includes('green')) return 'green';
  if (accent.includes('blue')) return 'blue';
  if (accent.includes('cyan')) return 'cyan';
  if (accent.includes('purple') || accent.includes('violet')) return 'purple';
  if (accent.includes('teal')) return 'cyan';
  if (accent.includes('yellow')) return 'orange';
  return 'blue';
}

export function DisciplineMetricCard({
  metric,
  theme,
  weeklyData = [],
  className,
}: DisciplineMetricCardProps) {
  const Icon = formatterToIcon[metric.formatter] || Activity;
  const chartColor = getChartColor(theme.accent);
  
  const hasTrend = metric.trend && metric.trend.percent !== 0;
  const trendPositive = metric.trend?.direction === 'up';

  return (
    <div
      className={cn(
        "relative bg-gradient-to-br rounded-2xl p-4 border overflow-hidden",
        theme.gradient,
        "border-border/30",
        className
      )}
    >
      {/* Top accent line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r to-transparent",
        theme.accent.replace('text-', 'from-').replace('-400', '-400/60')
      )} />

      {/* Header: Icon + Label + Trend */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-xl", theme.bgAccent)}>
            <Icon className={cn("w-5 h-5", theme.accent)} />
          </div>
          <span className="text-sm text-muted-foreground">{metric.label}</span>
        </div>
        {hasTrend && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            trendPositive ? "text-green-500" : "text-red-500"
          )}>
            {trendPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(metric.trend!.percent)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-3">
        <span className="text-3xl font-bold text-foreground tracking-tight">
          {metric.formattedValue}
        </span>
      </div>

      {/* Mini weekly chart */}
      <MiniWeeklyChart data={weeklyData} color={chartColor} />
    </div>
  );
}
