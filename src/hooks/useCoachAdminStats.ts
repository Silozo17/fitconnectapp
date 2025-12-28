import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CoachAdminStats {
  subscription: {
    status: string;
    tier: string;
    isGifted?: boolean;
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

      // Fetch granted subscriptions (admin-gifted plans like founder)
      const grantedResult = await supabase
        .from("admin_granted_subscriptions")
        .select("tier, is_active")
        .eq("coach_id", coachId)
        .eq("is_active", true)
        .maybeSingle();

      // Fetch platform subscription (paid subscriptions)
      const subResult = await supabase
        .from("platform_subscriptions")
        .select("status, tier")
        .eq("coach_id", coachId)
        .order("created_at", { ascending: false })
        .limit(1);
      
      // Fetch coach profile for subscription_tier fallback
      const profileTierResult = await supabase
        .from("coach_profiles")
        .select("subscription_tier")
        .eq("id", coachId)
        .single();

      // Determine subscription in priority order: granted > platform > profile tier
      let subscription: { status: string; tier: string; isGifted?: boolean } | null = null;
      
      if (grantedResult.data?.is_active) {
        subscription = { 
          status: "active", 
          tier: String(grantedResult.data.tier || ""), 
          isGifted: true 
        };
      } else if ((subResult.data as any)?.[0]) {
        const subData = (subResult.data as any)[0];
        subscription = { 
          status: String(subData.status || ""), 
          tier: String(subData.tier || "") 
        };
      } else if ((profileTierResult.data as any)?.subscription_tier && 
                 (profileTierResult.data as any).subscription_tier !== "free") {
        subscription = { 
          status: "active", 
          tier: String((profileTierResult.data as any).subscription_tier || "") 
        };
      }

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
