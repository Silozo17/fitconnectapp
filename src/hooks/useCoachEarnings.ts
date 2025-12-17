import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

interface Transaction {
  id: string;
  client_name: string;
  type: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "refunded";
}

interface EarningsStats {
  revenue: number;
  revenueChange: number;
  sessions: number;
  sessionsChange: number;
  avgSession: number;
  pending: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
}

export const useCoachEarnings = (coachProfileId: string | null) => {
  // Fetch transactions from package purchases and subscriptions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["coach-transactions", coachProfileId],
    queryFn: async () => {
      if (!coachProfileId) return [];

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
        .order("current_period_start", { ascending: false });

      const txs: Transaction[] = [];

      // Map package purchases
      packages?.forEach((p) => {
        const client = p.client as any;
        txs.push({
          id: p.id,
          client_name: client ? `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Unknown" : "Unknown",
          type: (p.package as any)?.name || "Package Purchase",
          amount: p.amount_paid,
          date: p.purchased_at,
          status: p.status === "active" ? "completed" : p.status === "refunded" ? "refunded" : "pending",
        });
      });

      // Map subscriptions
      subscriptions?.forEach((s) => {
        const client = s.client as any;
        const plan = s.plan as any;
        txs.push({
          id: s.id,
          client_name: client ? `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Unknown" : "Unknown",
          type: plan?.name || "Subscription",
          amount: plan?.price || 0,
          date: s.current_period_start,
          status: s.status === "active" ? "completed" : s.status === "cancelled" ? "refunded" : "pending",
        });
      });

      return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: !!coachProfileId,
  });

  // Fetch sessions count
  const { data: sessionsData } = useQuery({
    queryKey: ["coach-sessions-count", coachProfileId],
    queryFn: async () => {
      if (!coachProfileId) return { current: 0, previous: 0 };

      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const prevMonthStart = startOfMonth(subMonths(now, 1));
      const prevMonthEnd = endOfMonth(subMonths(now, 1));

      const { count: currentCount } = await supabase
        .from("coaching_sessions")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", coachProfileId)
        .eq("status", "completed")
        .gte("scheduled_at", currentMonthStart.toISOString())
        .lte("scheduled_at", currentMonthEnd.toISOString());

      const { count: prevCount } = await supabase
        .from("coaching_sessions")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", coachProfileId)
        .eq("status", "completed")
        .gte("scheduled_at", prevMonthStart.toISOString())
        .lte("scheduled_at", prevMonthEnd.toISOString());

      return { current: currentCount || 0, previous: prevCount || 0 };
    },
    enabled: !!coachProfileId,
  });

  // Calculate stats
  const stats: EarningsStats = {
    revenue: transactions.filter(t => t.status === "completed").reduce((sum, t) => sum + t.amount, 0),
    revenueChange: 0,
    sessions: sessionsData?.current || 0,
    sessionsChange: sessionsData?.previous ? Math.round(((sessionsData.current - sessionsData.previous) / sessionsData.previous) * 100) : 0,
    avgSession: 0,
    pending: transactions.filter(t => t.status === "pending").reduce((sum, t) => sum + t.amount, 0),
  };

  if (stats.sessions > 0) {
    stats.avgSession = stats.revenue / stats.sessions;
  }

  // Calculate monthly data for chart (last 6 months)
  const monthlyData: MonthlyData[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const monthRevenue = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.status === "completed" && txDate >= monthStart && txDate <= monthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    monthlyData.push({
      month: format(monthDate, "MMM"),
      revenue: monthRevenue,
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
    queryKey: ["coach-profile-id", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("coach_profiles")
        .select("id, stripe_connect_onboarded")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });
};
