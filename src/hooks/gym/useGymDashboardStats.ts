import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { useDateRangeAnalytics, DatePreset, CompareMode } from "@/hooks/useDateRangeAnalytics";
import { startOfDay, endOfDay, startOfMonth, subMonths } from "date-fns";

export interface GymDashboardStats {
  activeMembers: number;
  lostMembers: number;
  newMembers: number;
  totalMrr: number;
  creditsBought: number;
  creditsSpent: number;
  todaysVisits: number;
  membershipBreakdown: { name: string; value: number; color?: string }[];
}

interface UseGymDashboardStatsOptions {
  dateRange: ReturnType<typeof useDateRangeAnalytics>;
  locationId?: string | null;
}

export function useGymDashboardStats({ dateRange, locationId }: UseGymDashboardStatsOptions) {
  const { gym } = useGym();
  
  const { start: currentStart, end: currentEnd } = dateRange.getDateFilter();
  const compFilter = dateRange.getComparisonFilter();
  
  return useQuery({
    queryKey: [
      "gym-dashboard-stats",
      gym?.id,
      locationId,
      currentStart,
      currentEnd,
      dateRange.compareMode,
    ],
    queryFn: async () => {
      if (!gym?.id) return null;
      
      // Fetch current period stats
      const current = await fetchPeriodStats(gym.id, currentStart, currentEnd, locationId);
      
      // Fetch comparison period stats if enabled
      let comparison: GymDashboardStats | null = null;
      if (compFilter) {
        comparison = await fetchPeriodStats(gym.id, compFilter.start, compFilter.end, locationId);
      }
      
      return { current, comparison };
    },
    enabled: !!gym?.id,
    staleTime: 5 * 60 * 1000,
  });
}

async function fetchPeriodStats(
  gymId: string,
  startDate: string,
  endDate: string,
  locationId?: string | null
): Promise<GymDashboardStats> {
  // Build location filter
  const locationFilter = locationId ? { location_id: locationId } : {};
  
  // Fetch all stats in parallel
  const [
    activeMembersResult,
    newMembersResult,
    lostMembersResult,
    mrrResult,
    creditsBoughtResult,
    creditsSpentResult,
    todaysVisitsResult,
    membershipBreakdownResult,
  ] = await Promise.all([
    // Active members (current count)
    supabase
      .from("gym_members")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .eq("status", "active"),
    
    // New members in period
    supabase
      .from("gym_members")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .gte("joined_at", startDate)
      .lte("joined_at", endDate),
    
    // Lost members (status changed to inactive/cancelled in period)
    supabase
      .from("gym_members")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .in("status", ["inactive", "cancelled"])
      .gte("updated_at", startDate)
      .lte("updated_at", endDate),
    
    // MRR from active memberships
    supabase
      .from("gym_memberships")
      .select(`
        id,
        plan:membership_plans(price_amount, billing_period)
      `)
      .eq("gym_id", gymId)
      .eq("status", "active"),
    
    // Credits bought in period
    supabase
      .from("gym_credit_transactions")
      .select("amount")
      .eq("gym_id", gymId)
      .eq("transaction_type", "purchase")
      .gte("created_at", startDate)
      .lte("created_at", endDate),
    
    // Credits spent in period
    supabase
      .from("gym_credit_transactions")
      .select("amount")
      .eq("gym_id", gymId)
      .eq("transaction_type", "spend")
      .gte("created_at", startDate)
      .lte("created_at", endDate),
    
    // Today's visits
    supabase
      .from("gym_check_ins")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .gte("checked_in_at", startOfDay(new Date()).toISOString())
      .lte("checked_in_at", endOfDay(new Date()).toISOString()),
    
    // Membership type breakdown
    supabase
      .from("gym_memberships")
      .select(`
        id,
        plan:membership_plans(name)
      `)
      .eq("gym_id", gymId)
      .eq("status", "active"),
  ]);
  
  // Calculate MRR (normalize to monthly)
  const memberships = mrrResult.data || [];
  const totalMrr = memberships.reduce((sum, m) => {
    const plan = m.plan as { price_amount?: number; billing_period?: string } | null;
    if (!plan?.price_amount) return sum;
    
    const monthlyAmount = plan.billing_period === 'yearly' 
      ? plan.price_amount / 12 
      : plan.billing_period === 'weekly'
      ? plan.price_amount * 4
      : plan.price_amount;
    
    return sum + monthlyAmount;
  }, 0);
  
  // Calculate credits
  const creditsBought = (creditsBoughtResult.data || []).reduce((sum, t) => sum + (t.amount || 0), 0);
  const creditsSpent = Math.abs((creditsSpentResult.data || []).reduce((sum, t) => sum + (t.amount || 0), 0));
  
  // Calculate membership breakdown
  const breakdownMap: Record<string, number> = {};
  const breakdownData = membershipBreakdownResult.data || [];
  breakdownData.forEach((m) => {
    const plan = m.plan as { name?: string } | null;
    const planName = plan?.name || 'Unknown';
    breakdownMap[planName] = (breakdownMap[planName] || 0) + 1;
  });
  
  const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];
  const membershipBreakdown = Object.entries(breakdownMap).map(([name, value], index) => ({
    name,
    value,
    color: colors[index % colors.length],
  }));
  
  return {
    activeMembers: activeMembersResult.count || 0,
    lostMembers: lostMembersResult.count || 0,
    newMembers: newMembersResult.count || 0,
    totalMrr,
    creditsBought,
    creditsSpent,
    todaysVisits: todaysVisitsResult.count || 0,
    membershipBreakdown,
  };
}

// Hook for today's check-ins with real-time data
export function useTodaysCheckIns(limit: number = 20) {
  const { gym } = useGym();
  
  return useQuery({
    queryKey: ["gym-todays-checkins", gym?.id, limit],
    queryFn: async () => {
      if (!gym?.id) return [];
      
      const today = new Date();
      const { data, error } = await supabase
        .from("gym_check_ins")
        .select(`
          id,
          checked_in_at,
          checked_out_at,
          check_in_method,
          member:gym_members!inner(
            id,
            first_name,
            last_name,
            avatar_url
          ),
          class_booking:gym_class_bookings(
            class_session:gym_class_sessions(
              class_type:gym_class_types(name)
            )
          )
        `)
        .eq("gym_id", gym.id)
        .gte("checked_in_at", startOfDay(today).toISOString())
        .lte("checked_in_at", endOfDay(today).toISOString())
        .order("checked_in_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!gym?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Hook for manager commission tracking
export function useManagerCommission(staffId?: string) {
  const { gym } = useGym();
  
  return useQuery({
    queryKey: ["manager-commission", gym?.id, staffId],
    queryFn: async () => {
      if (!gym?.id || !staffId) return null;
      
      // Get staff's commission rate
      const { data: staffData } = await supabase
        .from("gym_staff")
        .select("commission_rate")
        .eq("id", staffId)
        .single();
      
      const commissionRate = staffData?.commission_rate || 0;
      
      // Get signups by this staff member this month
      const monthStart = startOfMonth(new Date());
      const { data: signups, count } = await supabase
        .from("gym_memberships")
        .select(`
          id,
          plan:membership_plans(price_amount)
        `, { count: "exact" })
        .eq("gym_id", gym.id)
        .eq("signed_up_by", staffId)
        .gte("created_at", monthStart.toISOString());
      
      // Calculate commission
      const totalRevenue = (signups || []).reduce((sum, s) => {
        const plan = s.plan as { price_amount?: number } | null;
        return sum + (plan?.price_amount || 0);
      }, 0);
      
      const commissionEarned = Math.round(totalRevenue * (commissionRate / 100));
      
      return {
        signupsThisMonth: count || 0,
        commissionRate,
        totalRevenue,
        commissionEarned,
      };
    },
    enabled: !!gym?.id && !!staffId,
  });
}
