import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, TrendingDown, Clock, CheckCircle2, Edit } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import type { GoalAdherence } from "@/hooks/useGoalAdherence";

interface GoalAdherenceTimelineProps {
  adherence: GoalAdherence;
  onEdit?: () => void;
}

export function GoalAdherenceTimeline({ adherence, onEdit }: GoalAdherenceTimelineProps) {
  const { t } = useTranslation();
  const { goal } = adherence;

  const timeline = useMemo(() => {
    const startDate = goal.startDate;
    const targetDate = goal.targetDate ? goal.targetDate : addDays(startDate, 90);
    const today = new Date();
    
    const totalDays = differenceInDays(targetDate, startDate);
    const elapsedDays = differenceInDays(today, startDate);
    const remainingDays = differenceInDays(targetDate, today);
    
    const timeProgress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
    const valueProgress = adherence.progressPercent;
    
    // Calculate if ahead or behind
    const expectedProgress = timeProgress;
    const progressDifference = valueProgress - expectedProgress;
    const isAhead = progressDifference > 5;
    const isBehind = progressDifference < -5;
    
    // Projected completion
    const dailyRate = elapsedDays > 0 ? valueProgress / elapsedDays : 0;
    const daysToComplete = dailyRate > 0 ? (100 - valueProgress) / dailyRate : Infinity;
    const projectedEndDate = addDays(today, Math.ceil(daysToComplete));
    
    return {
      startDate,
      targetDate,
      today,
      totalDays,
      elapsedDays,
      remainingDays,
      timeProgress,
      valueProgress,
      progressDifference,
      isAhead,
      isBehind,
      projectedEndDate,
      dailyRate,
    };
  }, [goal, adherence]);

  const statusBadge = useMemo(() => {
    if (goal.status === 'completed') {
      return { label: t('goals.completed', 'Completed'), className: 'bg-success/20 text-success border-success/30' };
    }
    if (timeline.isAhead) {
      return { label: t('goals.aheadOfSchedule', 'Ahead'), className: 'bg-success/20 text-success border-success/30' };
    }
    if (timeline.isBehind) {
      return { label: t('goals.behindSchedule', 'Behind'), className: 'bg-warning/20 text-warning border-warning/30' };
    }
    return { label: t('goals.onTrack', 'On Track'), className: 'bg-primary/20 text-primary border-primary/30' };
  }, [goal.status, timeline, t]);

  return (
    <Card variant="glass">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-lg">{goal.title}</CardTitle>
            <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
          </div>
          {goal.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
          )}
        </div>
        {onEdit && (
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar with Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('goals.progress', 'Progress')}</span>
            <span className="font-medium text-foreground">{Math.round(timeline.valueProgress)}%</span>
          </div>
          <div className="relative">
            <Progress value={timeline.valueProgress} className="h-3" />
            {/* Time marker */}
            <div 
              className="absolute top-0 w-0.5 h-5 bg-foreground/50 -translate-y-1"
              style={{ left: `${timeline.timeProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{format(timeline.startDate, 'd MMM')}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeline.remainingDays > 0 
                ? t('goals.daysRemaining', '{{days}} days left', { days: timeline.remainingDays })
                : t('goals.overdue', 'Overdue')}
            </span>
            <span>{format(timeline.targetDate, 'd MMM')}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-medium text-foreground">
              {timeline.isAhead ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : timeline.isBehind ? (
                <TrendingDown className="w-4 h-4 text-warning" />
              ) : (
                <Target className="w-4 h-4 text-primary" />
              )}
              {Math.abs(Math.round(timeline.progressDifference))}%
            </div>
            <p className="text-xs text-muted-foreground">
              {timeline.isAhead ? t('goals.ahead', 'Ahead') : timeline.isBehind ? t('goals.behind', 'Behind') : t('goals.onTarget', 'On Target')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {adherence.weeklyProgressRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">{t('goals.weeklyRate', 'Weekly Rate')}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {goal.currentValue ?? '-'}{goal.targetUnit ? ` ${goal.targetUnit}` : ''}
            </p>
            <p className="text-xs text-muted-foreground">{t('goals.current', 'Current')}</p>
          </div>
        </div>

        {/* Projected End */}
        {goal.status !== 'completed' && timeline.dailyRate > 0 && (
          <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-secondary/50">
            <span className="text-muted-foreground">{t('goals.projectedCompletion', 'Projected Completion')}</span>
            <span className={`font-medium ${
              timeline.projectedEndDate <= timeline.targetDate ? 'text-success' : 'text-warning'
            }`}>
              {format(timeline.projectedEndDate, 'd MMM yyyy')}
            </span>
          </div>
        )}

        {goal.status === 'completed' && (
          <div className="flex items-center gap-2 text-success p-2 rounded-lg bg-success/10">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">{t('goals.goalCompleted', 'Goal Completed!')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}