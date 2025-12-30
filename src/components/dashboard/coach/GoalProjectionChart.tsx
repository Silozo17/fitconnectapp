import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, Area, ComposedChart } from "recharts";
import { format, addDays, differenceInDays } from "date-fns";
import type { GoalAdherence } from "@/hooks/useGoalAdherence";

interface GoalProjectionChartProps {
  adherence: GoalAdherence;
  progressHistory?: { date: string; value: number }[];
}

export function GoalProjectionChart({ adherence, progressHistory = [] }: GoalProjectionChartProps) {
  const { t } = useTranslation();
  const { goal } = adherence;

  const chartData = useMemo(() => {
    const startDate = goal.startDate;
    const targetDate = goal.targetDate ? goal.targetDate : addDays(startDate, 90);
    const startValue = goal.startValue ?? 0;
    const targetValue = goal.targetValue ?? 100;
    const totalDays = differenceInDays(targetDate, startDate);
    
    const data: Array<{
      date: string;
      actual?: number;
      projected?: number;
      target: number;
      upperBound?: number;
      lowerBound?: number;
    }> = [];

    // Generate points for the chart
    const numPoints = Math.min(totalDays, 30);
    const interval = Math.max(1, Math.floor(totalDays / numPoints));

    for (let i = 0; i <= totalDays; i += interval) {
      const currentDate = addDays(startDate, i);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const displayDate = format(currentDate, 'd MMM');
      
      // Calculate target line (linear progression)
      const targetProgress = startValue + ((targetValue - startValue) * (i / totalDays));
      
      // Find actual value from history
      const historyEntry = progressHistory.find(h => h.date === dateStr);
      
      // Calculate projected value (based on current trend)
      const today = new Date();
      const elapsedDays = differenceInDays(today, startDate);
      const currentValue = goal.currentValue ?? startValue;
      const dailyRate = elapsedDays > 0 ? (currentValue - startValue) / elapsedDays : 0;
      
      const projectedValue = currentDate > today 
        ? startValue + (dailyRate * i)
        : undefined;
      
      // Confidence bounds (±10% of projected)
      const upperBound = projectedValue ? projectedValue * 1.1 : undefined;
      const lowerBound = projectedValue ? projectedValue * 0.9 : undefined;

      data.push({
        date: displayDate,
        actual: historyEntry?.value ?? (currentDate <= today ? currentValue : undefined),
        projected: projectedValue,
        target: targetProgress,
        upperBound,
        lowerBound,
      });
    }

    return data;
  }, [goal, progressHistory]);

  const chartConfig = {
    actual: { label: t('goals.actual', 'Actual'), color: "hsl(var(--primary))" },
    projected: { label: t('goals.projected', 'Projected'), color: "hsl(var(--accent))" },
    target: { label: t('goals.target', 'Target'), color: "hsl(var(--success))" },
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">{t('goals.progressProjection', 'Progress Projection')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] sm:h-[280px] w-full">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            
            {/* Confidence interval area */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill="url(#confidenceGradient)"
              fillOpacity={1}
            />
            
            {/* Target line (dashed) */}
            <Line
              type="monotone"
              dataKey="target"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
            
            {/* Projected line (dashed) */}
            <Line
              type="monotone"
              dataKey="projected"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
            />
            
            {/* Actual progress line (solid) */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
              connectNulls
            />
          </ComposedChart>
        </ChartContainer>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-primary rounded" />
            <span className="text-muted-foreground">{t('goals.actual', 'Actual')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-accent rounded" style={{ borderStyle: 'dashed' }} />
            <span className="text-muted-foreground">{t('goals.projected', 'Projected')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-success rounded" style={{ borderStyle: 'dashed' }} />
            <span className="text-muted-foreground">{t('goals.targetLine', 'Target')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}