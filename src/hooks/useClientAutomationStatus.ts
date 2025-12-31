import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ClientAutomationStatus {
  id: string;
  coach_id: string;
  client_id: string;
  is_at_risk: boolean;
  risk_stage: number;
  last_soft_checkin_at: string | null;
  last_coach_alert_at: string | null;
  last_recovery_attempt_at: string | null;
  muted_until: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export function useClientAutomationStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: coachProfile } = useQuery({
    queryKey: ["coach-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: atRiskClients = [], isLoading } = useQuery({
    queryKey: ["at-risk-clients", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data, error } = await supabase
        .from("client_automation_status")
        .select(`
          *,
          client:client_profiles!client_automation_status_client_id_fkey(first_name, last_name, avatar_url)
        `)
        .eq("coach_id", coachProfile.id)
        .eq("is_at_risk", true)
        .order("risk_stage", { ascending: false });
      if (error) throw error;
      return data as ClientAutomationStatus[];
    },
    enabled: !!coachProfile,
  });

  const muteClientMutation = useMutation({
    mutationFn: async ({ clientId, days }: { clientId: string; days: number }) => {
      if (!coachProfile) throw new Error("No coach profile");

      const mutedUntil = new Date();
      mutedUntil.setDate(mutedUntil.getDate() + days);

      const { error } = await supabase
        .from("client_automation_status")
        .upsert({
          coach_id: coachProfile.id,
          client_id: clientId,
          muted_until: mutedUntil.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "coach_id,client_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Client muted from automations");
      queryClient.invalidateQueries({ queryKey: ["at-risk-clients"] });
    },
    onError: () => toast.error("Failed to mute client"),
  });

  const unmuteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      if (!coachProfile) throw new Error("No coach profile");

      const { error } = await supabase
        .from("client_automation_status")
        .update({ muted_until: null, updated_at: new Date().toISOString() })
        .eq("coach_id", coachProfile.id)
        .eq("client_id", clientId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Client unmuted");
      queryClient.invalidateQueries({ queryKey: ["at-risk-clients"] });
    },
  });

  const dismissRiskMutation = useMutation({
    mutationFn: async (clientId: string) => {
      if (!coachProfile) throw new Error("No coach profile");

      const { error } = await supabase
        .from("client_automation_status")
        .update({
          is_at_risk: false,
          risk_stage: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("coach_id", coachProfile.id)
        .eq("client_id", clientId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Risk dismissed");
      queryClient.invalidateQueries({ queryKey: ["at-risk-clients"] });
    },
  });

  return {
    atRiskClients,
    isLoading,
    muteClient: (clientId: string, days: number) => muteClientMutation.mutate({ clientId, days }),
    unmuteClient: unmuteClientMutation.mutate,
    dismissRisk: dismissRiskMutation.mutate,
  };
}
