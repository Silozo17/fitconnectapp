import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  addMonths, 
  format,
  differenceInMonths
} from "date-fns";
import { isFeatureEnabled } from "@/lib/coach-feature-flags";
import { normalizeTier, SUBSCRIPTION_TIERS } from "@/lib/stripe-config";

export interface MonthlyRevenue {
  month: string;
  monthDate: Date;
  subscriptionRevenue: number;
  packageRevenue: number;
  sessionRevenue: number;
  totalRevenue: number;
  isProjected: boolean;
}

export interface RevenueMetrics {
  currentMRR: number;
  projectedARR: number;
  avgRevenuePerClient: number;
  revenueGrowthRate: number; // Month over month %
  churnRate: number;
  retentionRate: number;
}

export interface RevenueForecastData {
  metrics: RevenueMetrics;
  monthlyData: MonthlyRevenue[]; // 6 historical + 12 projected
  revenueBreakdown: {
    subscriptions: number;
    packages: number;
    sessions: number;
  };
  projectionConfidence: "high" | "medium" | "low";
}

export function useRevenueForecasting() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["revenue-forecasting", user?.id],
    queryFn: async (): Promise<RevenueForecastData | null> => {
      if (!user?.id || !isFeatureEnabled("REVENUE_FORECASTING")) return null;

      // Get coach profile first (needed for subsequent queries)
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id, subscription_tier, currency")
        .eq("user_id", user.id)
        .single();

      if (!coachProfile) return null;

      const tier = normalizeTier(coachProfile.subscription_tier);
      const commissionRate = SUBSCRIPTION_TIERS[tier].commissionPercent / 100;
      const now = new Date();
      const sixMonthsAgo = startOfMonth(subMonths(now, 6));

      // Fetch all data in parallel for performance
      const [
        { data: activeSubscriptions },
        { data: packages },
        { data: subscriptionPayments },
        { data: paidSessions },
        { count: activeClients }
      ] = await Promise.all([
        // Active subscriptions for MRR
        supabase
          .from("client_subscriptions")
          .select(`
            id,
            status,
            current_period_start,
            plan:coach_subscription_plans(price)
          `)
          .eq("coach_id", coachProfile.id)
          .eq("status", "active"),
        
        // Historical package purchases
        supabase
          .from("client_package_purchases")
          .select("amount_paid, purchased_at, status")
          .eq("coach_id", coachProfile.id)
          .gte("purchased_at", sixMonthsAgo.toISOString())
          .eq("status", "active"),
        
        // Subscription payments history
        supabase
          .from("client_subscriptions")
          .select(`
            current_period_start,
            status,
            created_at,
            cancelled_at,
            plan:coach_subscription_plans(price)
          `)
          .eq("coach_id", coachProfile.id)
          .gte("current_period_start", sixMonthsAgo.toISOString()),
        
        // Paid sessions (booking requests with payment)
        supabase
          .from("booking_requests")
          .select("amount_paid, requested_at, status")
          .eq("coach_id", coachProfile.id)
          .gte("requested_at", sixMonthsAgo.toISOString())
          .in("status", ["confirmed", "completed"]),
        
        // Active clients for ARPC
        supabase
          .from("coach_clients")
          .select("*", { count: "exact", head: true })
          .eq("coach_id", coachProfile.id)
          .eq("status", "active")
      ]);

      // Calculate current MRR
      const currentMRR = (activeSubscriptions || []).reduce((sum, sub) => {
        const plan = sub.plan as { price?: number } | null;
        const gross = plan?.price || 0;
        return sum + (gross * (1 - commissionRate));
      }, 0);

      // Calculate historical monthly data
      const historicalMonths: MonthlyRevenue[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);

        // Subscription revenue for this month
        const monthSubRevenue = (subscriptionPayments || [])
          .filter(s => {
            const date = new Date(s.current_period_start);
            return date >= monthStart && date <= monthEnd && s.status === "active";
          })
          .reduce((sum, s) => {
            const plan = s.plan as { price?: number } | null;
            return sum + ((plan?.price || 0) * (1 - commissionRate));
          }, 0);

        // Package revenue for this month
        const monthPkgRevenue = (packages || [])
          .filter(p => {
            const date = new Date(p.purchased_at);
            return date >= monthStart && date <= monthEnd;
          })
          .reduce((sum, p) => sum + (p.amount_paid * (1 - commissionRate)), 0);

        // Session revenue for this month
        const monthSessionRevenue = (paidSessions || [])
          .filter(s => {
            const date = new Date(s.requested_at);
            return date >= monthStart && date <= monthEnd;
          })
          .reduce((sum, s) => sum + ((s.amount_paid || 0) * (1 - commissionRate)), 0);

        historicalMonths.push({
          month: format(monthDate, "MMM yyyy"),
          monthDate,
          subscriptionRevenue: monthSubRevenue,
          packageRevenue: monthPkgRevenue,
          sessionRevenue: monthSessionRevenue,
          totalRevenue: monthSubRevenue + monthPkgRevenue + monthSessionRevenue,
          isProjected: false,
        });
      }

      // Calculate growth rate from historical data
      const recentMonths = historicalMonths.slice(-3);
      const avgMonthlyRevenue = recentMonths.reduce((sum, m) => sum + m.totalRevenue, 0) / 3;
      const prevMonths = historicalMonths.slice(-6, -3);
      const prevAvgRevenue = prevMonths.reduce((sum, m) => sum + m.totalRevenue, 0) / 3;
      
      const growthRate = prevAvgRevenue > 0 
        ? ((avgMonthlyRevenue - prevAvgRevenue) / prevAvgRevenue)
        : 0;

      // Calculate churn rate (simplified: cancelled subs / total subs)
      const totalSubs = subscriptionPayments?.length || 0;
      const cancelledSubs = subscriptionPayments?.filter(s => s.cancelled_at)?.length || 0;
      const churnRate = totalSubs > 0 ? cancelledSubs / totalSubs : 0;
      const retentionRate = 1 - churnRate;

      const avgRevenuePerClient = activeClients && activeClients > 0
        ? avgMonthlyRevenue / activeClients
        : 0;

      // Project future 12 months
      const projectedMonths: MonthlyRevenue[] = [];
      let projectedMRR = currentMRR;
      const avgPkgRevenue = historicalMonths.reduce((sum, m) => sum + m.packageRevenue, 0) / 6;
      const avgSessionRevenue = historicalMonths.reduce((sum, m) => sum + m.sessionRevenue, 0) / 6;

      for (let i = 1; i <= 12; i++) {
        const monthDate = addMonths(now, i);
        
        // Apply growth rate to MRR (compounding)
        projectedMRR = projectedMRR * (1 + growthRate / 12);
        
        // Apply retention to one-off revenue (decay slightly)
        const projectedPkgRevenue = avgPkgRevenue * Math.pow(retentionRate, i / 12);
        const projectedSessionRevenue = avgSessionRevenue * Math.pow(retentionRate, i / 12);

        projectedMonths.push({
          month: format(monthDate, "MMM yyyy"),
          monthDate,
          subscriptionRevenue: projectedMRR,
          packageRevenue: projectedPkgRevenue,
          sessionRevenue: projectedSessionRevenue,
          totalRevenue: projectedMRR + projectedPkgRevenue + projectedSessionRevenue,
          isProjected: true,
        });
      }

      // Calculate revenue breakdown (current month)
      const currentMonth = historicalMonths[historicalMonths.length - 1];
      const totalCurrent = currentMonth.totalRevenue || 1;
      
      // Determine projection confidence
      const dataMonthsWithRevenue = historicalMonths.filter(m => m.totalRevenue > 0).length;
      let projectionConfidence: "high" | "medium" | "low";
      if (dataMonthsWithRevenue >= 5) projectionConfidence = "high";
      else if (dataMonthsWithRevenue >= 3) projectionConfidence = "medium";
      else projectionConfidence = "low";

      return {
        metrics: {
          currentMRR,
          projectedARR: currentMRR * 12,
          avgRevenuePerClient,
          revenueGrowthRate: growthRate * 100,
          churnRate: churnRate * 100,
          retentionRate: retentionRate * 100,
        },
        monthlyData: [...historicalMonths, ...projectedMonths],
        revenueBreakdown: {
          subscriptions: currentMonth.subscriptionRevenue,
          packages: currentMonth.packageRevenue,
          sessions: currentMonth.sessionRevenue,
        },
        projectionConfidence,
      };
    },
    enabled: !!user?.id && isFeatureEnabled("REVENUE_FORECASTING"),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}
