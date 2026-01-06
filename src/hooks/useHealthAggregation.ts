import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, startOfDay, differenceInDays, isWithinInterval } from "date-fns";
import { useMemo, useCallback, useEffect } from "react";
import type { CoreHealthDataType } from "@/types/health";

// Re-export for backward compatibility
export type HealthDataType = CoreHealthDataType;

// Priority order for data sources - higher priority sources take precedence
const SOURCE_PRIORITY = ['apple_health', 'health_connect', 'fitbit', 'garmin', 'manual'];

interface HealthDataPoint {
  id: string;
  client_id: string;
  data_type: HealthDataType;
  recorded_at: string;
  value: number;
  unit: string;
  source: string;
}

interface UseHealthAggregationOptions {
  clientId?: string;
  days?: number; // How many days of data to fetch (default: 30)
}

// Helper to get highest priority entry from a list of entries for the same type/date
const getHighestPriorityEntry = (entries: HealthDataPoint[]): HealthDataPoint | undefined => {
  if (entries.length === 0) return undefined;
  if (entries.length === 1) return entries[0];

  return entries.sort((a, b) => {
    const priorityA = SOURCE_PRIORITY.indexOf(a.source);
    const priorityB = SOURCE_PRIORITY.indexOf(b.source);
    return (priorityA === -1 ? 99 : priorityA) - (priorityB === -1 ? 99 : priorityB);
  })[0];
};

export const useHealthAggregation = (options: UseHealthAggregationOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { clientId, days = 30 } = options;

  // Fetch data for the specified period - calculate fresh each render to ensure midnight reset
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const startDateKey = format(startOfDay(subDays(new Date(), days)), "yyyy-MM-dd");
  const endDateKey = todayKey;

  const queryKey = ["health-aggregation", user?.id, clientId, days, startDateKey, endDateKey];

  const { data: rawData, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      let targetClientId = clientId;

      if (!targetClientId) {
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user!.id)
          .single();

        if (!clientProfile) return [];
        targetClientId = clientProfile.id;
      }

      const { data, error } = await supabase
        .from("health_data_sync")
        .select("*")
        .eq("client_id", targetClientId)
        .gte("recorded_at", startDateKey)
        .lte("recorded_at", endDateKey)
        .order("recorded_at", { ascending: true });

      if (error) throw error;
      return data as HealthDataPoint[];
    },
    enabled: !!user,
    staleTime: 1000 * 60, // Reduce to 1 minute for fresher readiness data
    refetchOnMount: true, // Always refetch when component mounts
  });

  // Subscribe to realtime updates on health_data_sync table
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('health-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'health_data_sync',
        },
        () => {
          // Invalidate and refetch when new health data arrives
          queryClient.invalidateQueries({ queryKey: ["health-aggregation"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Deduplicate data by date and type (highest priority source wins)
  const deduplicatedData = useMemo(() => {
    if (!rawData) return [];

    const byDateAndType = new Map<string, HealthDataPoint[]>();
    
    for (const entry of rawData) {
      const key = `${entry.recorded_at}_${entry.data_type}`;
      const existing = byDateAndType.get(key) || [];
      existing.push(entry);
      byDateAndType.set(key, existing);
    }

    const result: HealthDataPoint[] = [];
    for (const entries of byDateAndType.values()) {
      const best = getHighestPriorityEntry(entries);
      if (best) result.push(best);
    }

    return result.sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
  }, [rawData]);

  // Get total for a specific type over a date range
  const getTotalForPeriod = useCallback((
    type: HealthDataType,
    periodDays: number
  ): number => {
    const periodStart = subDays(new Date(), periodDays);
    const periodEnd = new Date();

    const filtered = deduplicatedData.filter(d => {
      if (d.data_type !== type) return false;
      const recordedDate = new Date(d.recorded_at);
      return isWithinInterval(recordedDate, { start: periodStart, end: periodEnd });
    });

    return filtered.reduce((sum, d) => sum + d.value, 0);
  }, [deduplicatedData]);

  // Get weekly total
  const getWeeklyTotal = useCallback((type: HealthDataType) => {
    return getTotalForPeriod(type, 7);
  }, [getTotalForPeriod]);

  // Get monthly total
  const getMonthlyTotal = useCallback((type: HealthDataType) => {
    return getTotalForPeriod(type, 30);
  }, [getTotalForPeriod]);

  // Get all-time total (based on fetched data)
  const getAllTimeTotal = useCallback((type: HealthDataType) => {
    const filtered = deduplicatedData.filter(d => d.data_type === type);
    return filtered.reduce((sum, d) => sum + d.value, 0);
  }, [deduplicatedData]);

  // Calculate streak for a type (consecutive days meeting a minimum value)
  const getStreak = useCallback((
    type: HealthDataType,
    minValue: number
  ): number => {
    // Get all entries for this type, sorted by date descending
    const typeData = deduplicatedData
      .filter(d => d.data_type === type && d.value >= minValue)
      .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));

    if (typeData.length === 0) return 0;

    // Create a set of dates that meet the criteria
    const meetsDates = new Set(typeData.map(d => d.recorded_at.split('T')[0]));

    // Count consecutive days starting from today or yesterday
    let streak = 0;
    let currentDate = new Date();
    const todayStr = format(currentDate, "yyyy-MM-dd");
    const yesterdayStr = format(subDays(currentDate, 1), "yyyy-MM-dd");

    // Start from today if it's in the set, otherwise try yesterday
    if (meetsDates.has(todayStr)) {
      streak = 1;
      currentDate = subDays(currentDate, 1);
    } else if (meetsDates.has(yesterdayStr)) {
      streak = 1;
      currentDate = subDays(currentDate, 2);
    } else {
      return 0;
    }

    // Count consecutive previous days
    while (streak < days) {
      const checkDate = format(currentDate, "yyyy-MM-dd");
      if (meetsDates.has(checkDate)) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }

    return streak;
  }, [deduplicatedData, days]);

  // Get daily averages
  const getDailyAverage = useCallback((type: HealthDataType, periodDays: number = 7): number => {
    const total = getTotalForPeriod(type, periodDays);
    return total / periodDays;
  }, [getTotalForPeriod]);

  // Get data by day for charts
  const getDailyData = useCallback((type: HealthDataType): Array<{ date: string; value: number }> => {
    const typeData = deduplicatedData.filter(d => d.data_type === type);
    
    // Create a map for quick lookup
    const dataByDate = new Map<string, number>();
    for (const entry of typeData) {
      const dateStr = entry.recorded_at.split('T')[0];
      dataByDate.set(dateStr, entry.value);
    }

    // Generate array for all days in the period
    const result: Array<{ date: string; value: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      result.push({
        date,
        value: dataByDate.get(date) || 0,
      });
    }

    return result;
  }, [deduplicatedData, days]);

  // Get streak summary for common thresholds
  const getStreakSummary = useCallback(() => {
    return {
      steps_5k: getStreak('steps', 5000),
      steps_10k: getStreak('steps', 10000),
      calories_300: getStreak('calories', 300),
      calories_500: getStreak('calories', 500),
      active_minutes_30: getStreak('active_minutes', 30),
      active_minutes_60: getStreak('active_minutes', 60),
      sleep_7h: getStreak('sleep', 420), // 7 hours in minutes
      sleep_8h: getStreak('sleep', 480), // 8 hours in minutes
    };
  }, [getStreak]);

  return {
    data: deduplicatedData,
    rawData,
    isLoading,
    error,
    refetch,
    // Totals
    getWeeklyTotal,
    getMonthlyTotal,
    getAllTimeTotal,
    getTotalForPeriod,
    // Streaks
    getStreak,
    getStreakSummary,
    // Averages
    getDailyAverage,
    // Chart data
    getDailyData,
  };
};
