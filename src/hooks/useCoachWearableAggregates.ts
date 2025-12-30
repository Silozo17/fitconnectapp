import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subDays } from "date-fns";

export function useCoachWearableAggregates() {
  const { user } = useAuth();

  const { data: coachProfile } = useQuery({
    queryKey: ["coach-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("coach_profiles").select("id").eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["coach-wearable-aggregates", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return { clients: [], aggregates: {}, alerts: [] };

      const { data: clients } = await supabase
        .from("coach_clients")
        .select(`client_id, client:client_profiles!coach_clients_client_id_fkey(id, first_name, last_name, avatar_url)`)
        .eq("coach_id", coachProfile.id)
        .eq("status", "active");

      const clientIds = clients?.map((c) => c.client_id) || [];
      if (!clientIds.length) return { clients: [], aggregates: {}, alerts: [] };

      const weekAgo = subDays(new Date(), 7).toISOString();
      const { data: healthData } = await supabase
        .from("health_data_sync")
        .select("*")
        .in("client_id", clientIds)
        .gte("synced_at", weekAgo);

      const clientsWithData = clients?.map((c) => ({
        ...c.client,
        healthData: healthData?.filter((h) => h.client_id === c.client_id) || [],
      })) || [];

      const stepsData = healthData?.filter((h) => h.data_type === "steps") || [];
      const heartData = healthData?.filter((h) => h.data_type === "heart_rate") || [];
      const sleepData = healthData?.filter((h) => h.data_type === "sleep") || [];
      const caloriesData = healthData?.filter((h) => h.data_type === "calories") || [];

      const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

      const aggregates = {
        avgSteps: avg(stepsData.map((d) => Number(d.value) || 0)),
        avgHeartRate: avg(heartData.map((d) => Number(d.value) || 0)),
        avgSleep: avg(sleepData.map((d) => Number(d.value) || 0)),
        avgCalories: avg(caloriesData.map((d) => Number(d.value) || 0)),
        connectedClients: clientsWithData.filter((c) => c.healthData.length > 0).length,
      };

      const alerts: { client_id: string; type: string; message: string }[] = [];
      clientsWithData.forEach((client) => {
        const recentSteps = client.healthData.filter((h: any) => h.data_type === "steps");
        if (recentSteps.length === 0 || recentSteps.every((s: any) => Number(s.value) < 2000)) {
          alerts.push({ client_id: client.id, type: "low_activity", message: "Low activity detected" });
        }
      });

      return { clients: clientsWithData, aggregates, alerts };
    },
    enabled: !!coachProfile,
  });

  return {
    clientsWithData: data?.clients || [],
    aggregates: data?.aggregates || {},
    alerts: data?.alerts || [],
    isLoading,
    refetch,
    isRefetching,
  };
}
