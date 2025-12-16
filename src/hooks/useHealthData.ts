import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays } from "date-fns";

export type HealthDataType = "steps" | "heart_rate" | "sleep" | "calories" | "distance" | "active_minutes";

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
  const todayData = data?.filter(
    (d) => d.recorded_at === format(new Date(), "yyyy-MM-dd")
  );

  const getTodayValue = (type: HealthDataType) => {
    const entry = todayData?.find((d) => d.data_type === type);
    return entry?.value ?? 0;
  };

  // Get data grouped by type
  const getDataByType = (type: HealthDataType) => {
    return data?.filter((d) => d.data_type === type) ?? [];
  };

  // Calculate averages
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
    getDataByType,
    getAverage,
  };
};
