import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange } from "react-day-picker";

export function useClientComparison(selectedClientIds: string[], dateRange?: DateRange) {
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

  const { data: clients = [] } = useQuery({
    queryKey: ["coach-clients-for-comparison", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data } = await supabase
        .from("coach_clients")
        .select(`client:client_profiles!coach_clients_client_id_fkey(id, first_name, last_name, avatar_url)`)
        .eq("coach_id", coachProfile.id)
        .eq("status", "active");
      return data?.map((c) => c.client) || [];
    },
    enabled: !!coachProfile,
  });

  const { data: comparisonData = [], isLoading } = useQuery({
    queryKey: ["client-comparison-data", selectedClientIds, dateRange],
    queryFn: async () => {
      if (selectedClientIds.length < 2) return [];
      
      const { data: progressData } = await supabase
        .from("client_progress")
        .select("*")
        .in("client_id", selectedClientIds)
        .gte("recorded_at", dateRange?.from?.toISOString() || "")
        .lte("recorded_at", dateRange?.to?.toISOString() || new Date().toISOString())
        .order("recorded_at", { ascending: true });

      return selectedClientIds.map((clientId) => {
        const client = clients.find((c: any) => c.id === clientId);
        const clientProgress = progressData?.filter((p) => p.client_id === clientId) || [];
        const weights = clientProgress.filter((p) => p.weight_kg).map((p) => ({ date: p.recorded_at, value: p.weight_kg }));
        
        return {
          clientId,
          clientName: client ? `${client.first_name || ""} ${client.last_name || ""}`.trim() : "Unknown",
          weightData: weights,
          startWeight: weights[0]?.value || null,
          endWeight: weights[weights.length - 1]?.value || null,
          weightChange: weights.length >= 2 ? (weights[weights.length - 1].value! - weights[0].value!) : null,
        };
      });
    },
    enabled: selectedClientIds.length >= 2 && !!dateRange,
  });

  return { comparisonData, isLoading, availableClients: clients };
}
