import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useHabitLogs, HabitLog } from "@/hooks/useHabits";
import { cn } from "@/lib/utils";

interface HabitCalendarHeatmapProps {
  habitId: string;
  habitName: string;
  days?: number;
}

const HabitCalendarHeatmap = ({ habitId, habitName, days = 90 }: HabitCalendarHeatmapProps) => {
  const { t } = useTranslation("client");
  const { data: logs = [] } = useHabitLogs(habitId, days);
  
  // Generate array of dates for the past X days
  const dateGrid = useMemo(() => {
    const grid: { date: string; completed: boolean; log?: HabitLog }[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const log = logs.find(l => l.logged_at === dateStr);
      
      grid.push({
        date: dateStr,
        completed: !!log,
        log,
      });
    }
    
    return grid;
  }, [logs, days]);
  
  // Calculate completion rate
  const completionRate = useMemo(() => {
    const completed = dateGrid.filter(d => d.completed).length;
    return Math.round((completed / dateGrid.length) * 100);
  }, [dateGrid]);
  
  // Group by weeks for display
  const weeks = useMemo(() => {
    const result: typeof dateGrid[] = [];
    for (let i = 0; i < dateGrid.length; i += 7) {
      result.push(dateGrid.slice(i, i + 7));
    }
    return result;
  }, [dateGrid]);
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{habitName}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {completionRate}% {t("habits.completionRate").toLowerCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day) => (
                  <Tooltip key={day.date}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "w-3 h-3 rounded-sm transition-colors cursor-pointer",
                          day.completed
                            ? "bg-primary hover:bg-primary/80"
                            : "bg-muted hover:bg-muted/80"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{formatDate(day.date)}</p>
                      <p className="text-xs text-muted-foreground">
                        {day.completed ? `✓ ${t("habits.completed")}` : t("habits.notCompleted")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </TooltipProvider>
        
        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <span>{t("habits.notCompleted")}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span>{t("habits.completed")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitCalendarHeatmap;
