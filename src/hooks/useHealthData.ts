import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, startOfDay } from "date-fns";
import { useMemo, useEffect, useRef, useCallback } from "react";
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
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  
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
          return [];
        }
        targetClientId = clientProfile.id;
      }

      const startDateStr = format(startDate, "yyyy-MM-dd");
      const endDateStr = format(endDate, "yyyy-MM-dd");

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

      return data as HealthDataPoint[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes - prevents unnecessary refetches
  });

  // Get target client ID for realtime subscription
  const targetClientIdRef = useRef<string | null>(null);
  
  // Update targetClientIdRef when we have data
  useEffect(() => {
    if (clientId) {
      targetClientIdRef.current = clientId;
    } else if (user) {
      supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            targetClientIdRef.current = data.id;
          }
        });
    }
  }, [clientId, user]);

  // Realtime subscription for live updates
  useEffect(() => {
    if (!user) return;

    // Small delay to ensure targetClientIdRef is set
    const setupChannel = setTimeout(() => {
      const currentClientId = targetClientIdRef.current;
      if (!currentClientId) return;

      // Clean up existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase
        .channel(`health-data-${currentClientId}`)
        .on(
          'postgres_changes',
          {
            event: '*', // INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'health_data_sync',
            filter: `client_id=eq.${currentClientId}`
          },
          () => {
            // Refetch data on any change
            refetch();
          }
        )
        .subscribe();

      channelRef.current = channel;
    }, 500);

    return () => {
      clearTimeout(setupChannel);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, refetch]);

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

  // Get today's value using priority-based selection for multi-device deduplication
  const getTodayValue = useCallback((type: HealthDataType) => {
    const entriesForType = todayData?.filter((d) => d.data_type === type) ?? [];
    const highestPriorityEntry = getHighestPriorityEntry(entriesForType);
    return highestPriorityEntry?.value ?? 0;
  }, [todayData]);

  // Get the source of today's data for a type
  const getTodaySource = useCallback((type: HealthDataType) => {
    const entriesForType = todayData?.filter((d) => d.data_type === type) ?? [];
    const highestPriorityEntry = getHighestPriorityEntry(entriesForType);
    return highestPriorityEntry?.source ?? null;
  }, [todayData]);

  // Get data grouped by type with deduplication per date
  const getDataByType = useCallback((type: HealthDataType) => {
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
  }, [data]);

  // Calculate averages using deduplicated data
  const getAverage = useCallback((type: HealthDataType) => {
    const typeData = getDataByType(type);
    if (typeData.length === 0) return 0;
    return typeData.reduce((sum, d) => sum + d.value, 0) / typeData.length;
  }, [getDataByType]);

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
