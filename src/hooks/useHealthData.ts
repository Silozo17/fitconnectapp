import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, startOfDay } from "date-fns";
import { useMemo, useEffect } from "react";

export type HealthDataType = "steps" | "heart_rate" | "sleep" | "calories" | "distance" | "active_minutes";

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

interface UseHealthDataOptions {
  dataType?: HealthDataType;
  startDate?: Date;
  endDate?: Date;
  clientId?: string; // For coaches viewing client data
}

// Helper to get highest priority entry from a list of entries for the same type/date
const getHighestPriorityEntry = (entries: HealthDataPoint[]): HealthDataPoint | undefined => {
  if (entries.length === 0) return undefined;
  if (entries.length === 1) return entries[0];

  // Sort by priority (lower index = higher priority)
  return entries.sort((a, b) => {
    const priorityA = SOURCE_PRIORITY.indexOf(a.source);
    const priorityB = SOURCE_PRIORITY.indexOf(b.source);
    // If source not in list, give it lowest priority (99)
    return (priorityA === -1 ? 99 : priorityA) - (priorityB === -1 ? 99 : priorityB);
  })[0];
};

export const useHealthData = (options: UseHealthDataOptions = {}) => {
  const { user } = useAuth();
  
  // Memoize default dates to prevent query key instability
  const defaultStartDate = useMemo(() => startOfDay(subDays(new Date(), 7)), []);
  const defaultEndDate = useMemo(() => startOfDay(new Date()), []);
  
  const {
    dataType,
    startDate = defaultStartDate,
    endDate = defaultEndDate,
    clientId,
  } = options;

  // Use stable date strings for query key
  const startDateKey = format(startDate, "yyyy-MM-dd");
  const endDateKey = format(endDate, "yyyy-MM-dd");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["health-data", user?.id, clientId, dataType, startDateKey, endDateKey],
    queryFn: async () => {
      let targetClientId = clientId;

      // If no clientId provided, get current user's client profile
      if (!targetClientId) {
        console.log('[useHealthData] No clientId provided, fetching client profile for user:', user?.id);
        const { data: clientProfile, error: profileError } = await supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user!.id)
          .single();

        if (profileError) {
          console.error('[useHealthData] Error fetching client profile:', profileError);
          return [];
        }

        if (!clientProfile) {
          console.log('[useHealthData] No client profile found');
          return [];
        }
        targetClientId = clientProfile.id;
        console.log('[useHealthData] Found client profile:', targetClientId);
      }

      const startDateStr = format(startDate, "yyyy-MM-dd");
      const endDateStr = format(endDate, "yyyy-MM-dd");
      
      console.log('[useHealthData] Fetching health data:', {
        clientId: targetClientId,
        dataType,
        startDate: startDateStr,
        endDate: endDateStr,
      });

      let query = supabase
        .from("health_data_sync")
        .select("*")
        .eq("client_id", targetClientId)
        .gte("recorded_at", startDateStr)
        .lte("recorded_at", endDateStr)
        .order("recorded_at", { ascending: true });

      if (dataType) {
        query = query.eq("data_type", dataType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[useHealthData] Error fetching health data:', error);
        throw error;
      }

      console.log('[useHealthData] Fetched data:', data?.length || 0, 'records');
      if (data && data.length > 0) {
        console.log('[useHealthData] Sample data:', data.slice(0, 3));
      }

      return data as HealthDataPoint[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes - prevents unnecessary refetches
  });

  // Memoize today's date string
  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  
  // Filter today's data with improved date comparison
  const todayData = useMemo(() => {
    return data?.filter((d) => {
      // Handle both string dates and full ISO timestamps
      const recordedDate = typeof d.recorded_at === 'string' 
        ? d.recorded_at.split('T')[0]  // Extract date part from ISO string
        : format(new Date(d.recorded_at), "yyyy-MM-dd");
      return recordedDate === todayStr;
    });
  }, [data, todayStr]);

  // Debug logging in useEffect to avoid console spam during renders
  useEffect(() => {
    if (!isLoading) {
      console.log('[useHealthData] Query key:', ["health-data", user?.id, clientId, dataType, startDateKey, endDateKey]);
      console.log('[useHealthData] Today string:', todayStr);
      console.log('[useHealthData] Total data points:', data?.length ?? 0);
      console.log('[useHealthData] Today data points:', todayData?.length ?? 0);
      if (todayData && todayData.length > 0) {
        console.log('[useHealthData] Today data sample:', todayData.slice(0, 3));
      } else if (data && data.length > 0) {
        console.log('[useHealthData] Data dates available:', [...new Set(data.map(d => d.recorded_at))]);
      }
    }
  }, [data, todayData, isLoading, user?.id, clientId, dataType, startDateKey, endDateKey, todayStr]);

  // Get today's value using priority-based selection for multi-device deduplication
  const getTodayValue = (type: HealthDataType) => {
    const entriesForType = todayData?.filter((d) => d.data_type === type) ?? [];
    const highestPriorityEntry = getHighestPriorityEntry(entriesForType);
    return highestPriorityEntry?.value ?? 0;
  };

  // Get the source of today's data for a type
  const getTodaySource = (type: HealthDataType) => {
    const entriesForType = todayData?.filter((d) => d.data_type === type) ?? [];
    const highestPriorityEntry = getHighestPriorityEntry(entriesForType);
    return highestPriorityEntry?.source ?? null;
  };

  // Get data grouped by type with deduplication per date
  const getDataByType = (type: HealthDataType) => {
    const typeData = data?.filter((d) => d.data_type === type) ?? [];
    
    // Group by date and take highest priority for each date
    const byDate = new Map<string, HealthDataPoint[]>();
    for (const entry of typeData) {
      const existing = byDate.get(entry.recorded_at) || [];
      existing.push(entry);
      byDate.set(entry.recorded_at, existing);
    }

    // Return deduplicated data (one entry per date)
    const deduplicated: HealthDataPoint[] = [];
    for (const entries of byDate.values()) {
      const best = getHighestPriorityEntry(entries);
      if (best) deduplicated.push(best);
    }

    return deduplicated.sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
  };

  // Calculate averages using deduplicated data
  const getAverage = (type: HealthDataType) => {
    const typeData = getDataByType(type);
    if (typeData.length === 0) return 0;
    return typeData.reduce((sum, d) => sum + d.value, 0) / typeData.length;
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    todayData,
    getTodayValue,
    getTodaySource,
    getDataByType,
    getAverage,
  };
};
