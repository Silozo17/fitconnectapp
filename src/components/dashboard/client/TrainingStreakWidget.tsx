import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
import { useTrainingLogs } from "@/hooks/useTrainingLogs";
import { Flame, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays, format, startOfDay, subDays, isToday, isYesterday } from "date-fns";

interface TrainingStreakWidgetProps {
  className?: string;
}

export function TrainingStreakWidget({ className }: TrainingStreakWidgetProps) {
  const { data: logs, isLoading } = useTrainingLogs();

  const streakData = useMemo(() => {
    if (!logs || logs.length === 0) return null;

    // Get unique training days
    const trainingDays = new Set<string>();
    for (const log of logs) {
      const day = format(new Date(log.logged_at), 'yyyy-MM-dd');
      trainingDays.add(day);
    }

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = startOfDay(new Date());
    
    // If no workout today, start checking from yesterday
    const todayStr = format(checkDate, 'yyyy-MM-dd');
    if (!trainingDays.has(todayStr)) {
      checkDate = subDays(checkDate, 1);
    }

    // Count consecutive days
    while (true) {
      const dayStr = format(checkDate, 'yyyy-MM-dd');
      if (trainingDays.has(dayStr)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    // Calculate weekly training count (last 7 days)
    const weekAgo = subDays(new Date(), 7);
    const weeklyCount = Array.from(trainingDays).filter(d => 
      new Date(d) >= weekAgo
    ).length;

    // Check if at risk of breaking streak (no workout today and had one yesterday)
    const trainedToday = trainingDays.has(format(new Date(), 'yyyy-MM-dd'));
    const trainedYesterday = trainingDays.has(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
    const atRisk = !trainedToday && trainedYesterday && currentStreak > 0;

    // Calculate longest streak
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

    // Total workouts this month
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
      <Card variant="elevated" className={cn("rounded-3xl", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <ShimmerSkeleton className="h-10 w-10 rounded-2xl" />
            <ShimmerSkeleton className="h-5 w-28" />
          </div>
        </CardHeader>
        <CardContent>
          <ShimmerSkeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!streakData) {
    return null;
  }

  const { currentStreak, longestStreak, weeklyCount, monthlyCount, atRisk, trainedToday } = streakData;

  return (
    <Card variant="elevated" className={cn("rounded-3xl overflow-hidden", className)}>
      {/* Gradient accent - flame colors for streaks */}
      <div className={cn(
        "h-1 bg-gradient-to-r",
        currentStreak >= 7 ? "from-orange-500 via-red-500 to-orange-500" :
        currentStreak >= 3 ? "from-amber-500 via-orange-500 to-amber-500" :
        "from-zinc-400 via-zinc-500 to-zinc-400"
      )} />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-xl",
              currentStreak >= 7 ? "bg-orange-500/10" :
              currentStreak >= 3 ? "bg-amber-500/10" :
              "bg-muted"
            )}>
              <Flame className={cn(
                "w-4 h-4",
                currentStreak >= 7 ? "text-orange-500" :
                currentStreak >= 3 ? "text-amber-500" :
                "text-muted-foreground"
              )} />
            </div>
            Training Streak
          </CardTitle>
          {trainedToday && (
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
              ✓ Trained today
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main streak display */}
        <div className="text-center py-4">
          <div className={cn(
            "text-5xl font-bold font-display",
            currentStreak >= 7 ? "text-orange-500" :
            currentStreak >= 3 ? "text-amber-500" :
            "text-foreground"
          )}>
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
              <Calendar className="w-4 h-4 text-accent" />
            </div>
            <div className="text-lg font-bold text-foreground">{weeklyCount}</div>
            <div className="text-xs text-muted-foreground">This week</div>
          </div>

          <div className="p-3 rounded-xl bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-4 h-4 text-success" />
            </div>
            <div className="text-lg font-bold text-foreground">{monthlyCount}</div>
            <div className="text-xs text-muted-foreground">This month</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
