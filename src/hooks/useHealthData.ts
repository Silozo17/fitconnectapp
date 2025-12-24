import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays } from "date-fns";

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
  const {
    dataType,
    startDate = subDays(new Date(), 7),
    endDate = new Date(),
    clientId,
  } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: ["health-data", user?.id, clientId, dataType, startDate, endDate],
    queryFn: async () => {
      let targetClientId = clientId;

      // If no clientId provided, get current user's client profile
      if (!targetClientId) {
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user!.id)
          .single();

        if (!clientProfile) return [];
        targetClientId = clientProfile.id;
      }

      let query = supabase
        .from("health_data_sync")
        .select("*")
        .eq("client_id", targetClientId)
        .gte("recorded_at", format(startDate, "yyyy-MM-dd"))
        .lte("recorded_at", format(endDate, "yyyy-MM-dd"))
        .order("recorded_at", { ascending: true });

      if (dataType) {
        query = query.eq("data_type", dataType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as HealthDataPoint[];
    },
    enabled: !!user,
  });

  // Get today's summary
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayData = data?.filter((d) => d.recorded_at === todayStr);

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
    todayData,
    getTodayValue,
    getTodaySource,
    getDataByType,
    getAverage,
  };
};
