import { useMemo } from 'react';
import { AccentCard, AccentCardContent } from "@/components/ui/accent-card";
import { Badge } from "@/components/ui/badge";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
import { useTrainingLogs } from "@/hooks/useTrainingLogs";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { startOfWeek, subWeeks, isWithinInterval, endOfWeek } from "date-fns";

interface WeeklyVolumeWidgetProps {
  className?: string;
}

export function WeeklyVolumeWidget({ className }: WeeklyVolumeWidgetProps) {
  const { data: logs, isLoading } = useTrainingLogs();

  const volumeData = useMemo(() => {
    if (!logs || logs.length === 0) return null;

    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = subWeeks(thisWeekStart, 1);
    const lastWeekEnd = subWeeks(thisWeekEnd, 1);

    let thisWeekVolume = 0;
    let lastWeekVolume = 0;
    let thisWeekSets = 0;
    let thisWeekReps = 0;

    for (const log of logs) {
      const logDate = new Date(log.logged_at);
      const isThisWeek = isWithinInterval(logDate, { start: thisWeekStart, end: thisWeekEnd });
      const isLastWeek = isWithinInterval(logDate, { start: lastWeekStart, end: lastWeekEnd });

      if (!log.exercises) continue;

      for (const exercise of log.exercises) {
        if (!exercise.sets) continue;

        for (const set of exercise.sets) {
          if (set.is_warmup || !set.weight_kg || !set.reps) continue;

          const setVolume = set.weight_kg * set.reps;

          if (isThisWeek) {
            thisWeekVolume += setVolume;
            thisWeekSets++;
            thisWeekReps += set.reps;
          } else if (isLastWeek) {
            lastWeekVolume += setVolume;
          }
        }
      }
    }

    let changePercent = 0;
    let trend: 'up' | 'down' | 'same' = 'same';
    
    if (lastWeekVolume > 0) {
      changePercent = Math.round(((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100);
      if (changePercent > 5) trend = 'up';
      else if (changePercent < -5) trend = 'down';
    }

    return {
      thisWeekVolume: Math.round(thisWeekVolume),
      lastWeekVolume: Math.round(lastWeekVolume),
      changePercent,
      trend,
      thisWeekSets,
      thisWeekReps,
    };
  }, [logs]);

  if (isLoading) {
    return (
      <AccentCard className={cn("rounded-2xl", className)}>
        <AccentCardContent className="p-5">
          <ShimmerSkeleton className="h-12 w-32" />
        </AccentCardContent>
      </AccentCard>
    );
  }

  if (!volumeData || volumeData.thisWeekVolume === 0) {
    return null;
  }

  const { thisWeekVolume, changePercent, trend, thisWeekSets, thisWeekReps } = volumeData;

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return vol.toString();
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <AccentCard className={cn("rounded-2xl", className)}>
      <AccentCardContent className="p-5 space-y-4">
        {/* Trend badge */}
        {trend !== 'same' && (
          <div className="flex justify-end">
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                trend === 'up' ? "bg-success/10 text-success border-success/20" :
                "bg-destructive/10 text-destructive border-destructive/20"
              )}
            >
              <TrendIcon className="w-3 h-3 mr-1" />
              {Math.abs(changePercent)}%
            </Badge>
          </div>
        )}

        {/* Main volume display */}
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground font-display">
            {formatVolume(thisWeekVolume)}
          </span>
          <span className="text-lg text-muted-foreground">kg</span>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="text-lg font-bold text-foreground">{thisWeekSets}</div>
            <div className="text-xs text-muted-foreground">Total sets</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="text-lg font-bold text-foreground">{thisWeekReps}</div>
            <div className="text-xs text-muted-foreground">Total reps</div>
          </div>
        </div>

        {/* Week over week comparison */}
        <div className="flex items-center gap-2 text-sm">
          <TrendIcon className={cn("w-4 h-4", trendColor)} />
          <span className="text-muted-foreground">
            {trend === 'up' ? `+${changePercent}% from last week` :
             trend === 'down' ? `${changePercent}% from last week` :
             'Same as last week'}
          </span>
        </div>
      </AccentCardContent>
    </AccentCard>
  );
}
