import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useDropoffStats() {
  const { user } = useAuth();

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

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dropoff-stats", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return null;

      // Get total active clients being monitored
      const { count: totalClients } = await supabase
        .from("coach_clients")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", coachProfile.id)
        .eq("status", "active");

      // Get at-risk clients count
      const { count: atRiskCount } = await supabase
        .from("client_automation_status")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", coachProfile.id)
        .eq("is_at_risk", true);

      // Get messages sent this month via automation
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: messagesSent } = await supabase
        .from("automation_logs")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", coachProfile.id)
        .eq("automation_type", "dropoff_rescue")
        .eq("action_type", "stage1_message")
        .gte("created_at", startOfMonth.toISOString());

      return {
        totalClients: totalClients || 0,
        atRiskCount: atRiskCount || 0,
        messagesSentThisMonth: messagesSent || 0,
      };
    },
    enabled: !!coachProfile,
  });

  return { stats, isLoading };
}
