import { useMemo } from 'react';
import { useHealthAggregation } from './useHealthAggregation';
import { subDays, format } from 'date-fns';

export interface TrendData {
  type: string;
  label: string;
  icon: string;
  currentWeekAvg: number;
  previousWeekAvg: number;
  percentChange: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  isPositive: boolean; // Is the trend direction good for the user?
}

/**
 * Calculates week-over-week trends for wearable metrics.
 */
export function useWearableTrends() {
  const { data, isLoading } = useHealthAggregation({ days: 14 });

  const trends = useMemo((): TrendData[] => {
    if (!data || data.length === 0) return [];

    const today = new Date();
    const oneWeekAgo = subDays(today, 7);
    const twoWeeksAgo = subDays(today, 14);

    const getWeekAverage = (type: string, startDate: Date, endDate: Date): number => {
      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');
      
      const weekData = data.filter(d => 
        d.data_type === type && 
        d.recorded_at >= startStr && 
        d.recorded_at <= endStr
      );
      
      if (weekData.length === 0) return 0;
      return weekData.reduce((sum, d) => sum + d.value, 0) / weekData.length;
    };

    const metricsConfig = [
      { type: 'steps', label: 'Steps', icon: 'Footprints', unit: '', positiveUp: true },
      { type: 'active_minutes', label: 'Active Minutes', icon: 'Timer', unit: 'min', positiveUp: true },
      { type: 'sleep', label: 'Sleep', icon: 'Moon', unit: 'hrs', positiveUp: true, divideBy: 60 },
      { type: 'calories', label: 'Calories Burned', icon: 'Flame', unit: 'kcal', positiveUp: true },
      { type: 'heart_rate', label: 'Avg Heart Rate', icon: 'Heart', unit: 'bpm', positiveUp: false },
    ];

    const result: TrendData[] = [];

    for (const metric of metricsConfig) {
      const currentWeekAvg = getWeekAverage(metric.type, oneWeekAgo, today);
      const previousWeekAvg = getWeekAverage(metric.type, twoWeeksAgo, oneWeekAgo);

      // Skip metrics with no data
      if (currentWeekAvg === 0 && previousWeekAvg === 0) continue;

      let percentChange = 0;
      if (previousWeekAvg > 0) {
        percentChange = ((currentWeekAvg - previousWeekAvg) / previousWeekAvg) * 100;
      }

      let trend: 'up' | 'down' | 'stable';
      if (Math.abs(percentChange) < 3) {
        trend = 'stable';
      } else if (percentChange > 0) {
        trend = 'up';
      } else {
        trend = 'down';
      }

      // Determine if the trend is positive for the user
      const isPositive = trend === 'stable' || 
        (metric.positiveUp && trend === 'up') || 
        (!metric.positiveUp && trend === 'down');

      let displayCurrentAvg = currentWeekAvg;
      let displayPreviousAvg = previousWeekAvg;
      if (metric.divideBy) {
        displayCurrentAvg = currentWeekAvg / metric.divideBy;
        displayPreviousAvg = previousWeekAvg / metric.divideBy;
      }

      result.push({
        type: metric.type,
        label: metric.label,
        icon: metric.icon,
        currentWeekAvg: Math.round(displayCurrentAvg * 10) / 10,
        previousWeekAvg: Math.round(displayPreviousAvg * 10) / 10,
        percentChange: Math.round(percentChange),
        trend,
        unit: metric.unit,
        isPositive,
      });
    }

    return result;
  }, [data]);

  return {
    trends,
    isLoading,
    hasData: trends.length > 0,
  };
}
