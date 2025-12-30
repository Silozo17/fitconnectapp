import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInMonths } from "date-fns";
import { isFeatureEnabled } from "@/lib/coach-feature-flags";
import { normalizeTier, SUBSCRIPTION_TIERS } from "@/lib/stripe-config";

export type LTVTier = "high" | "medium" | "low";

export interface ClientLTVData {
  clientId: string;
  clientName: string;
  avatarUrl: string | null;
  historicalLTV: number; // Total revenue from client
  projectedLTV: number; // Historical + predicted future
  monthsAsClient: number;
  avgMonthlyRevenue: number;
  ltvTier: LTVTier;
  riskAdjustedLTV: number; // LTV adjusted for churn probability
  revenueBreakdown: {
    subscriptions: number;
    packages: number;
    sessions: number;
  };
}

export interface LTVSummary {
  totalHistoricalLTV: number;
  totalProjectedLTV: number;
  avgClientLTV: number;
  topClients: ClientLTVData[];
  ltvDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

function getLTVTier(ltv: number, avgLTV: number): LTVTier {
  if (ltv >= avgLTV * 1.5) return "high";
  if (ltv >= avgLTV * 0.5) return "medium";
  return "low";
}

export function useClientLTV() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-ltv", user?.id],
    queryFn: async (): Promise<LTVSummary | null> => {
      if (!user?.id || !isFeatureEnabled("CLIENT_LTV")) return null;

      // Get coach profile
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id, subscription_tier")
        .eq("user_id", user.id)
        .single();

      if (!coachProfile) return null;

      const tier = normalizeTier(coachProfile.subscription_tier);
      const commissionRate = SUBSCRIPTION_TIERS[tier].commissionPercent / 100;

      // Get all clients (active and past)
      const { data: clients } = await supabase
        .from("coach_clients")
        .select(`
          client_id,
          created_at,
          status,
          client_profiles!coach_clients_client_id_fkey (
            id,
            first_name,
            last_name,
            username,
            avatar_url
          )
        `)
        .eq("coach_id", coachProfile.id);

      if (!clients || clients.length === 0) return null;

      const now = new Date();

      const ltvPromises = clients.map(async (client) => {
        const profile = client.client_profiles;
        if (!profile) return null;

        const cId = client.client_id;
        const startDate = new Date(client.created_at);
        const monthsAsClient = Math.max(1, differenceInMonths(now, startDate));

        // Fetch subscription payments
        const { data: subscriptions } = await supabase
          .from("client_subscriptions")
          .select(`
            current_period_start,
            status,
            plan:coach_subscription_plans(price)
          `)
          .eq("coach_id", coachProfile.id)
          .eq("client_id", cId);

        const subscriptionRevenue = (subscriptions || []).reduce((sum, s) => {
          const plan = s.plan as { price?: number } | null;
          return sum + ((plan?.price || 0) * (1 - commissionRate));
        }, 0);

        // Fetch package purchases
        const { data: packages } = await supabase
          .from("client_package_purchases")
          .select("amount_paid, status")
          .eq("coach_id", coachProfile.id)
          .eq("client_id", cId)
          .eq("status", "active");

        const packageRevenue = (packages || []).reduce((sum, p) => 
          sum + (p.amount_paid * (1 - commissionRate)), 0);

        // Fetch paid sessions
        const { data: sessions } = await supabase
          .from("booking_requests")
          .select("amount_paid, status")
          .eq("coach_id", coachProfile.id)
          .eq("client_id", cId)
          .in("status", ["confirmed", "completed"]);

        const sessionRevenue = (sessions || []).reduce((sum, s) => 
          sum + ((s.amount_paid || 0) * (1 - commissionRate)), 0);

        const historicalLTV = subscriptionRevenue + packageRevenue + sessionRevenue;
        const avgMonthlyRevenue = historicalLTV / monthsAsClient;

        // Get risk score for risk-adjusted projection
        const { data: engagementScore } = await supabase
          .from("client_engagement_scores")
          .select("overall_score")
          .eq("client_id", cId)
          .eq("coach_id", coachProfile.id)
          .maybeSingle();

        // Risk adjustment: higher engagement = higher projected future value
        const engagementFactor = engagementScore?.overall_score 
          ? engagementScore.overall_score / 100 
          : 0.5;
        
        // Project 12 more months, adjusted for risk
        const projectedFutureMonths = client.status === "active" ? 12 : 0;
        const projectedFutureRevenue = avgMonthlyRevenue * projectedFutureMonths * engagementFactor;
        const projectedLTV = historicalLTV + projectedFutureRevenue;
        const riskAdjustedLTV = historicalLTV + (projectedFutureRevenue * engagementFactor);

        const clientName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(" ") || profile.username;

        return {
          clientId: cId,
          clientName,
          avatarUrl: profile.avatar_url,
          historicalLTV,
          projectedLTV,
          monthsAsClient,
          avgMonthlyRevenue,
          ltvTier: "medium" as LTVTier, // Will be calculated after we have avg
          riskAdjustedLTV,
          revenueBreakdown: {
            subscriptions: subscriptionRevenue,
            packages: packageRevenue,
            sessions: sessionRevenue,
          },
        };
      });

      const results = (await Promise.all(ltvPromises))
        .filter((r): r is ClientLTVData => r !== null);

      if (results.length === 0) return null;

      // Calculate averages and assign tiers
      const totalHistoricalLTV = results.reduce((sum, c) => sum + c.historicalLTV, 0);
      const totalProjectedLTV = results.reduce((sum, c) => sum + c.projectedLTV, 0);
      const avgClientLTV = totalHistoricalLTV / results.length;

      // Assign tiers based on average
      results.forEach(client => {
        client.ltvTier = getLTVTier(client.historicalLTV, avgClientLTV);
      });

      // Sort by projected LTV descending
      results.sort((a, b) => b.projectedLTV - a.projectedLTV);

      // Count distribution
      const ltvDistribution = {
        high: results.filter(c => c.ltvTier === "high").length,
        medium: results.filter(c => c.ltvTier === "medium").length,
        low: results.filter(c => c.ltvTier === "low").length,
      };

      return {
        totalHistoricalLTV,
        totalProjectedLTV,
        avgClientLTV,
        topClients: results.slice(0, 5),
        ltvDistribution,
      };
    },
    enabled: !!user?.id && isFeatureEnabled("CLIENT_LTV"),
    staleTime: 15 * 60 * 1000,
  });
}
