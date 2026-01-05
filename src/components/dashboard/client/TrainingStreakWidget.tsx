import { useMemo } from 'react';
import { AccentCard, AccentCardContent } from "@/components/ui/accent-card";
import { Badge } from "@/components/ui/badge";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
import { useTrainingLogs } from "@/hooks/useTrainingLogs";
import { Flame, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays, format, startOfDay, subDays } from "date-fns";

interface TrainingStreakWidgetProps {
  className?: string;
}

export function TrainingStreakWidget({ className }: TrainingStreakWidgetProps) {
  const { data: logs, isLoading } = useTrainingLogs();

  const streakData = useMemo(() => {
    if (!logs || logs.length === 0) return null;

    const trainingDays = new Set<string>();
    for (const log of logs) {
      const day = format(new Date(log.logged_at), 'yyyy-MM-dd');
      trainingDays.add(day);
    }

    let currentStreak = 0;
    let checkDate = startOfDay(new Date());
    
    const todayStr = format(checkDate, 'yyyy-MM-dd');
    if (!trainingDays.has(todayStr)) {
      checkDate = subDays(checkDate, 1);
    }

    while (true) {
      const dayStr = format(checkDate, 'yyyy-MM-dd');
      if (trainingDays.has(dayStr)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    const weekAgo = subDays(new Date(), 7);
    const weeklyCount = Array.from(trainingDays).filter(d => 
      new Date(d) >= weekAgo
    ).length;

    const trainedToday = trainingDays.has(format(new Date(), 'yyyy-MM-dd'));
    const trainedYesterday = trainingDays.has(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
    const atRisk = !trainedToday && trainedYesterday && currentStreak > 0;

    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDays = Array.from(trainingDays).sort();
    
    for (let i = 0; i < sortedDays.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDays[i - 1]);
        const currDate = new Date(sortedDays[i]);
        const diff = differenceInDays(currDate, prevDate);
        
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    const monthStart = new Date();
    monthStart.setDate(1);
    const monthlyCount = Array.from(trainingDays).filter(d => 
      new Date(d) >= monthStart
    ).length;

    return {
      currentStreak,
      longestStreak,
      weeklyCount,
      monthlyCount,
      atRisk,
      trainedToday,
    };
  }, [logs]);

  if (isLoading) {
    return (
      <AccentCard className={cn("rounded-2xl", className)}>
        <AccentCardContent className="p-5">
          <ShimmerSkeleton className="h-16 w-full" />
        </AccentCardContent>
      </AccentCard>
    );
  }

  if (!streakData) {
    return null;
  }

  const { currentStreak, longestStreak, weeklyCount, monthlyCount, atRisk, trainedToday } = streakData;

  return (
    <AccentCard className={cn("rounded-2xl", className)}>
      <AccentCardContent className="p-5 space-y-4">
        {/* Trained today badge */}
        {trainedToday && (
          <div className="flex justify-end">
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
              ✓ Trained today
            </Badge>
          </div>
        )}

        {/* Main streak display */}
        <div className="text-center py-4">
          <div className="text-5xl font-bold font-display text-primary">
            {currentStreak}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            day{currentStreak !== 1 ? 's' : ''} in a row
          </p>
        </div>

        {/* At risk warning */}
        {atRisk && (
          <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <p className="text-xs text-warning font-medium">
                Don't break your streak! Train today to keep it going.
              </p>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="text-lg font-bold text-foreground">{longestStreak}</div>
            <div className="text-xs text-muted-foreground">Best streak</div>
          </div>

          <div className="p-3 rounded-xl bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="text-lg font-bold text-foreground">{weeklyCount}</div>
            <div className="text-xs text-muted-foreground">This week</div>
          </div>

          <div className="p-3 rounded-xl bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-4 h-4 text-primary" />
            </div>
            <div className="text-lg font-bold text-foreground">{monthlyCount}</div>
            <div className="text-xs text-muted-foreground">This month</div>
          </div>
        </div>
      </AccentCardContent>
    </AccentCard>
  );
}
