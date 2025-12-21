import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths, format } from "date-fns";
import { SUBSCRIPTION_TIERS, normalizeTier, TierKey } from "@/lib/stripe-config";
import { toast } from "sonner";

interface Transaction {
  id: string;
  client_name: string;
  type: string;
  amount: number;
  netAmount: number;
  commission: number;
  date: string;
  status: "completed" | "pending" | "refunded";
}

interface EarningsStats {
  grossRevenue: number;
  netRevenue: number;
  commissionPaid: number;
  commissionRate: number;
  revenueChange: number;
  sessions: number;
  sessionsChange: number;
  avgSession: number;
  pending: number;
  tier: TierKey;
}

interface MonthlyData {
  month: string;
  grossRevenue: number;
  netRevenue: number;
}

type PeriodType = "week" | "month" | "quarter" | "year";

const getDateRangeForPeriod = (period: PeriodType) => {
  const now = new Date();
  switch (period) {
    case "week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "quarter":
      return { start: startOfQuarter(now), end: endOfQuarter(now) };
    case "year":
      return { start: startOfYear(now), end: endOfYear(now) };
  }
};

export const useCoachEarnings = (coachProfileId: string | null, period: PeriodType = "month") => {
  const { data: coachTier } = useQuery({
    queryKey: ["coach-subscription-tier", coachProfileId],
    queryFn: async () => {
      if (!coachProfileId) return "free" as TierKey;
      
      const { data } = await supabase
        .from("coach_profiles")
        .select("subscription_tier")
        .eq("id", coachProfileId)
        .maybeSingle();
      
      return normalizeTier(data?.subscription_tier);
    },
    enabled: !!coachProfileId,
  });

  const commissionRate = SUBSCRIPTION_TIERS[coachTier || "free"].commissionPercent / 100;

  // Fetch transactions from package purchases and subscriptions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["coach-transactions", coachProfileId, period],
    queryFn: async () => {
      if (!coachProfileId) return [];

      const { start, end } = getDateRangeForPeriod(period);

      // Fetch package purchases
      const { data: packages } = await supabase
        .from("client_package_purchases")
        .select(`
          id,
          amount_paid,
          purchased_at,
          status,
          client:client_profiles(first_name, last_name),
          package:coach_packages(name)
        `)
        .eq("coach_id", coachProfileId)
        .gte("purchased_at", start.toISOString())
        .lte("purchased_at", end.toISOString())
        .order("purchased_at", { ascending: false });

      // Fetch subscription payments
      const { data: subscriptions } = await supabase
        .from("client_subscriptions")
        .select(`
          id,
          current_period_start,
          status,
          client:client_profiles(first_name, last_name),
          plan:coach_subscription_plans(name, price)
        `)
        .eq("coach_id", coachProfileId)
        .gte("current_period_start", start.toISOString())
        .lte("current_period_start", end.toISOString())
        .order("current_period_start", { ascending: false });

      const txs: Transaction[] = [];

      // Map package purchases with commission calculation
      packages?.forEach((p) => {
        const client = p.client as any;
        const grossAmount = p.amount_paid;
        const commission = grossAmount * commissionRate;
        const netAmount = grossAmount - commission;
        
        txs.push({
          id: p.id,
          client_name: client ? `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Unknown" : "Unknown",
          type: (p.package as any)?.name || "Package Purchase",
          amount: grossAmount,
          netAmount,
          commission,
          date: p.purchased_at,
          status: p.status === "active" ? "completed" : p.status === "refunded" ? "refunded" : "pending",
        });
      });

      // Map subscriptions with commission calculation
      subscriptions?.forEach((s) => {
        const client = s.client as any;
        const plan = s.plan as any;
        const grossAmount = plan?.price || 0;
        const commission = grossAmount * commissionRate;
        const netAmount = grossAmount - commission;
        
        txs.push({
          id: s.id,
          client_name: client ? `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Unknown" : "Unknown",
          type: plan?.name || "Subscription",
          amount: grossAmount,
          netAmount,
          commission,
          date: s.current_period_start,
          status: s.status === "active" ? "completed" : s.status === "cancelled" ? "refunded" : "pending",
        });
      });

      return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: !!coachProfileId,
  });

  // Fetch sessions count for selected period
  const { data: sessionsData } = useQuery({
    queryKey: ["coach-sessions-count", coachProfileId, period],
    queryFn: async () => {
      if (!coachProfileId) return { current: 0, previous: 0 };

      const { start, end } = getDateRangeForPeriod(period);
      const periodLength = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - periodLength);
      const prevEnd = new Date(end.getTime() - periodLength);

      const { count: currentCount } = await supabase
        .from("coaching_sessions")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", coachProfileId)
        .eq("status", "completed")
        .gte("scheduled_at", start.toISOString())
        .lte("scheduled_at", end.toISOString());

      const { count: prevCount } = await supabase
        .from("coaching_sessions")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", coachProfileId)
        .eq("status", "completed")
        .gte("scheduled_at", prevStart.toISOString())
        .lte("scheduled_at", prevEnd.toISOString());

      return { current: currentCount || 0, previous: prevCount || 0 };
    },
    enabled: !!coachProfileId,
  });

  // Calculate stats with NET earnings
  const completedTxs = transactions.filter(t => t.status === "completed");
  const grossRevenue = completedTxs.reduce((sum, t) => sum + t.amount, 0);
  const netRevenue = completedTxs.reduce((sum, t) => sum + t.netAmount, 0);
  const commissionPaid = completedTxs.reduce((sum, t) => sum + t.commission, 0);
  
  const stats: EarningsStats = {
    grossRevenue,
    netRevenue,
    commissionPaid,
    commissionRate: commissionRate * 100,
    revenueChange: 0,
    sessions: sessionsData?.current || 0,
    sessionsChange: sessionsData?.previous ? Math.round(((sessionsData.current - sessionsData.previous) / sessionsData.previous) * 100) : 0,
    avgSession: 0,
    pending: transactions.filter(t => t.status === "pending").reduce((sum, t) => sum + t.netAmount, 0),
    tier: coachTier || "free",
  };

  if (stats.sessions > 0) {
    stats.avgSession = netRevenue / stats.sessions;
  }

  // Fetch 6-month transactions for chart (independent of selected period)
  const { data: sixMonthTransactions = [] } = useQuery({
    queryKey: ["coach-transactions-6month", coachProfileId],
    queryFn: async () => {
      if (!coachProfileId) return [];

      const sixMonthsAgo = subMonths(new Date(), 6);
      const now = new Date();

      // Fetch package purchases for 6 months
      const { data: packages } = await supabase
        .from("client_package_purchases")
        .select(`
          id,
          amount_paid,
          purchased_at,
          status
        `)
        .eq("coach_id", coachProfileId)
        .gte("purchased_at", startOfMonth(sixMonthsAgo).toISOString())
        .lte("purchased_at", now.toISOString());

      // Fetch subscription payments for 6 months
      const { data: subscriptions } = await supabase
        .from("client_subscriptions")
        .select(`
          id,
          current_period_start,
          status,
          plan:coach_subscription_plans(price)
        `)
        .eq("coach_id", coachProfileId)
        .gte("current_period_start", startOfMonth(sixMonthsAgo).toISOString())
        .lte("current_period_start", now.toISOString());

      const txs: Array<{ date: string; amount: number; netAmount: number; status: string }> = [];

      packages?.forEach((p) => {
        const grossAmount = p.amount_paid;
        const commission = grossAmount * commissionRate;
        txs.push({
          date: p.purchased_at,
          amount: grossAmount,
          netAmount: grossAmount - commission,
          status: p.status === "active" ? "completed" : p.status === "refunded" ? "refunded" : "pending",
        });
      });

      subscriptions?.forEach((s) => {
        const plan = s.plan as { price?: number } | null;
        const grossAmount = plan?.price || 0;
        const commission = grossAmount * commissionRate;
        txs.push({
          date: s.current_period_start,
          amount: grossAmount,
          netAmount: grossAmount - commission,
          status: s.status === "active" ? "completed" : s.status === "cancelled" ? "refunded" : "pending",
        });
      });

      return txs;
    },
    enabled: !!coachProfileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Calculate monthly data for chart (last 6 months)
  const monthlyData: MonthlyData[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const monthTxs = sixMonthTransactions.filter(t => {
      const txDate = new Date(t.date);
      return t.status === "completed" && txDate >= monthStart && txDate <= monthEnd;
    });

    monthlyData.push({
      month: format(monthDate, "MMM"),
      grossRevenue: monthTxs.reduce((sum, t) => sum + t.amount, 0),
      netRevenue: monthTxs.reduce((sum, t) => sum + t.netAmount, 0),
    });
  }

  return {
    transactions,
    stats,
    monthlyData,
    isLoading: transactionsLoading,
  };
};

export const useCoachProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-profile-earnings", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("coach_profiles")
        .select("id, stripe_connect_id, stripe_connect_onboarded, subscription_tier, currency")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });
};

export const useStripeExpressLogin = () => {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("stripe-express-login");
      
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      
      return data.url as string;
    },
    onSuccess: (url) => {
      window.open(url, "_blank");
    },
    onError: (error) => {
      toast.error("Failed to open Stripe Dashboard", {
        description: error.message,
      });
    },
  });
};
