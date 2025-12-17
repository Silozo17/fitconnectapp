import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CoachAdminStats {
  subscription: {
    status: string;
    tier: string;
  } | null;
  activeClients: number;
  totalCommissionPaid: number;
  verificationStatus: string;
}

export function useCoachAdminStats(coachId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ["coach-admin-stats", coachId],
    queryFn: async (): Promise<CoachAdminStats> => {
      if (!coachId || !userId) {
        return {
          subscription: null,
          activeClients: 0,
          totalCommissionPaid: 0,
          verificationStatus: "not_submitted",
        };
      }

      // Fetch platform subscription
      // @ts-expect-error - Supabase type instantiation too deep
      const subResult = await supabase
        .from("platform_subscriptions")
        .select("status, tier")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);
      
      const subData = (subResult.data as any)?.[0];
      const subscription = subData ? { 
        status: String(subData.status || ""), 
        tier: String(subData.tier || "") 
      } : null;

      // Fetch active client count
      const clientsResult = await supabase
        .from("coach_clients")
        .select("id", { count: "exact", head: true })
        .eq("coach_id", coachId)
        .eq("status", "active");

      // Fetch total commission paid (sum from transactions)
      const transResult = await supabase
        .from("transactions")
        .select("commission_amount")
        .eq("coach_id", coachId)
        .eq("status", "completed");

      const totalCommissionPaid = (transResult.data as any)?.reduce(
        (sum: number, t: any) => sum + (Number(t.commission_amount) || 0),
        0
      ) || 0;

      // Fetch verification status from coach profile
      const profileResult = await supabase
        .from("coach_profiles")
        .select("verification_status")
        .eq("id", coachId)
        .single();

      return {
        subscription,
        activeClients: clientsResult.count || 0,
        totalCommissionPaid,
        verificationStatus: (profileResult.data as any)?.verification_status || "not_submitted",
      };
    },
    enabled: !!coachId && !!userId,
  });
}
