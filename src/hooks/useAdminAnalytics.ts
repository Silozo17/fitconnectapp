import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDateRangeAnalytics } from './useDateRangeAnalytics';

export interface TierDistribution {
  tier: string;
  count: number;
}

export interface SessionTypeDistribution {
  type: 'online' | 'in_person';
  count: number;
}

export interface AdminAnalyticsData {
  // Core metrics
  totalClients: number;
  totalCoaches: number;
  totalSessions: number;
  totalMessages: number;
  
  // Monetisation metrics
  platformCommission: number;
  totalGMV: number;
  coachSubscriptionMRR: number;
  tierDistribution: TierDistribution[];
  
  // Engagement metrics
  averageRating: number;
  totalReviews: number;
  repeatBookingRate: number;
  sessionCompletionRate: number;
  
  // Operational metrics
  sessionNoShowRate: number;
  bookingConversionRate: number;
  connectionAcceptanceRate: number;
  verifiedCoachRate: number;
  onlineSessionsRate: number;
  sessionTypeDistribution: SessionTypeDistribution[];
}

export interface UserGrowthData {
  date: string;
  clients: number;
  coaches: number;
}

export interface SessionActivityData {
  date: string;
  scheduled: number;
  completed: number;
}

export interface UseAdminAnalyticsReturn {
  analytics: AdminAnalyticsData;
  comparison: AdminAnalyticsData | null;
  userGrowthData: UserGrowthData[];
  sessionData: SessionActivityData[];
  loading: boolean;
  refetch: () => Promise<void>;
  dateRange: ReturnType<typeof useDateRangeAnalytics>;
}

const defaultAnalytics: AdminAnalyticsData = {
  totalClients: 0,
  totalCoaches: 0,
  totalSessions: 0,
  totalMessages: 0,
  platformCommission: 0,
  totalGMV: 0,
  coachSubscriptionMRR: 0,
  tierDistribution: [],
  averageRating: 0,
  totalReviews: 0,
  repeatBookingRate: 0,
  sessionCompletionRate: 0,
  sessionNoShowRate: 0,
  bookingConversionRate: 0,
  connectionAcceptanceRate: 0,
  verifiedCoachRate: 0,
  onlineSessionsRate: 0,
  sessionTypeDistribution: [],
};

export function useAdminAnalytics(): UseAdminAnalyticsReturn {
  const [analytics, setAnalytics] = useState<AdminAnalyticsData>(defaultAnalytics);
  const [comparison, setComparison] = useState<AdminAnalyticsData | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [sessionData, setSessionData] = useState<SessionActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  const dateRange = useDateRangeAnalytics('30d', 'none');

  const fetchAnalyticsForPeriod = useCallback(async (start: string, end: string): Promise<AdminAnalyticsData> => {
    // Fetch core metrics
    const [clients, coaches, sessions, messages] = await Promise.all([
      supabase.from('client_profiles').select('id, created_at', { count: 'exact' }).gte('created_at', start).lte('created_at', end),
      supabase.from('coach_profiles').select('id, is_verified, subscription_tier, created_at', { count: 'exact' }).gte('created_at', start).lte('created_at', end),
      supabase.from('coaching_sessions').select('id, status, is_online, client_id, created_at', { count: 'exact' }).gte('created_at', start).lte('created_at', end),
      supabase.from('messages').select('id', { count: 'exact' }).gte('created_at', start).lte('created_at', end),
    ]);

    // Fetch monetisation metrics
    const [transactions, platformSubs, reviews, bookingRequests, connectionRequests] = await Promise.all([
      supabase.from('transactions').select('amount, commission_amount, status').eq('status', 'completed').gte('created_at', start).lte('created_at', end),
      supabase.from('platform_subscriptions').select('plan_id, status').eq('status', 'active'),
      supabase.from('reviews').select('rating').gte('created_at', start).lte('created_at', end),
      supabase.from('booking_requests').select('status').gte('created_at', start).lte('created_at', end),
      supabase.from('connection_requests').select('status').gte('created_at', start).lte('created_at', end),
    ]);

    // Calculate core metrics
    const totalClients = clients.count || 0;
    const totalCoaches = coaches.count || 0;
    const totalSessions = sessions.count || 0;
    const totalMessages = messages.count || 0;

    // Calculate monetisation metrics
    const transactionData = transactions.data || [];
    const platformCommission = transactionData.reduce((sum, t) => sum + (t.commission_amount || 0), 0);
    const totalGMV = transactionData.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // MRR from platform subscriptions (simplified - would need plan pricing join in production)
    const activeSubs = platformSubs.data?.length || 0;
    const coachSubscriptionMRR = activeSubs * 29; // Placeholder - should join with pricing

    // Tier distribution
    const coachData = coaches.data || [];
    const tierCounts: Record<string, number> = {};
    coachData.forEach(c => {
      const tier = c.subscription_tier || 'free';
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    });
    const tierDistribution: TierDistribution[] = Object.entries(tierCounts).map(([tier, count]) => ({ tier, count }));

    // Calculate engagement metrics
    const reviewData = reviews.data || [];
    const totalReviews = reviewData.length;
    const averageRating = totalReviews > 0 
      ? reviewData.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews 
      : 0;

    // Repeat booking rate (clients with 2+ sessions)
    const sessionsByClient: Record<string, number> = {};
    (sessions.data || []).forEach(s => {
      sessionsByClient[s.client_id] = (sessionsByClient[s.client_id] || 0) + 1;
    });
    const clientsWithMultipleSessions = Object.values(sessionsByClient).filter(c => c >= 2).length;
    const uniqueClients = Object.keys(sessionsByClient).length;
    const repeatBookingRate = uniqueClients > 0 ? (clientsWithMultipleSessions / uniqueClients) * 100 : 0;

    // Session completion rate
    const completedSessions = (sessions.data || []).filter(s => s.status === 'completed').length;
    const sessionCompletionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Calculate operational metrics
    const noShowSessions = (sessions.data || []).filter(s => s.status === 'no_show').length;
    const sessionNoShowRate = totalSessions > 0 ? (noShowSessions / totalSessions) * 100 : 0;

    // Booking conversion rate
    const bookingData = bookingRequests.data || [];
    const approvedBookings = bookingData.filter(b => b.status === 'approved').length;
    const bookingConversionRate = bookingData.length > 0 ? (approvedBookings / bookingData.length) * 100 : 0;

    // Connection acceptance rate
    const connectionData = connectionRequests.data || [];
    const acceptedConnections = connectionData.filter(c => c.status === 'accepted').length;
    const connectionAcceptanceRate = connectionData.length > 0 ? (acceptedConnections / connectionData.length) * 100 : 0;

    // Verified coach rate
    const verifiedCoaches = coachData.filter(c => c.is_verified).length;
    const verifiedCoachRate = coachData.length > 0 ? (verifiedCoaches / coachData.length) * 100 : 0;

    // Session type distribution
    const onlineSessions = (sessions.data || []).filter(s => s.is_online === true).length;
    const inPersonSessions = (sessions.data || []).filter(s => s.is_online === false).length;
    const onlineSessionsRate = totalSessions > 0 ? (onlineSessions / totalSessions) * 100 : 0;
    const sessionTypeDistribution: SessionTypeDistribution[] = [
      { type: 'online', count: onlineSessions },
      { type: 'in_person', count: inPersonSessions },
    ];

    return {
      totalClients,
      totalCoaches,
      totalSessions,
      totalMessages,
      platformCommission,
      totalGMV,
      coachSubscriptionMRR,
      tierDistribution,
      averageRating,
      totalReviews,
      repeatBookingRate,
      sessionCompletionRate,
      sessionNoShowRate,
      bookingConversionRate,
      connectionAcceptanceRate,
      verifiedCoachRate,
      onlineSessionsRate,
      sessionTypeDistribution,
    };
  }, []);

  const fetchChartData = useCallback(async (start: string, end: string) => {
    const [clients, coaches, sessions] = await Promise.all([
      supabase.from('client_profiles').select('created_at').gte('created_at', start).lte('created_at', end),
      supabase.from('coach_profiles').select('created_at').gte('created_at', start).lte('created_at', end),
      supabase.from('coaching_sessions').select('created_at, status').gte('created_at', start).lte('created_at', end),
    ]);

    // Calculate the actual number of days in the range
    const startDate = new Date(start);
    const endDate = new Date(end);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Determine aggregation level based on range length
    const aggregateByWeek = daysDiff > 31 && daysDiff <= 90;
    const aggregateByMonth = daysDiff > 90;

    const formatDateStr = (d: Date) => d.toISOString().split('T')[0];
    
    const formatLabel = (d: Date, isWeek = false, isMonth = false) => {
      if (isMonth) {
        return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
      if (isWeek) {
        const weekEnd = new Date(d);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { day: 'numeric' })}`;
      }
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isDateInRange = (dateStr: string, rangeStart: Date, rangeEnd: Date) => {
      const d = new Date(dateStr);
      return d >= rangeStart && d <= rangeEnd;
    };

    if (aggregateByMonth) {
      // Monthly aggregation for ranges > 90 days
      const months: { start: Date; end: Date; label: string }[] = [];
      let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      while (current <= endDate) {
        const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59);
        months.push({
          start: new Date(current),
          end: monthEnd > endDate ? endDate : monthEnd,
          label: formatLabel(current, false, true),
        });
        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      }

      const userGrowth: UserGrowthData[] = months.map(m => ({
        date: m.label,
        clients: (clients.data || []).filter(c => isDateInRange(c.created_at, m.start, m.end)).length,
        coaches: (coaches.data || []).filter(c => isDateInRange(c.created_at, m.start, m.end)).length,
      }));

      const sessionActivity: SessionActivityData[] = months.map(m => {
        const monthSessions = (sessions.data || []).filter(s => isDateInRange(s.created_at, m.start, m.end));
        return {
          date: m.label,
          scheduled: monthSessions.length,
          completed: monthSessions.filter(s => s.status === 'completed').length,
        };
      });

      return { userGrowth, sessionActivity };
    }

    if (aggregateByWeek) {
      // Weekly aggregation for ranges 32-90 days
      const weeks: { start: Date; end: Date; label: string }[] = [];
      let current = new Date(startDate);
      while (current <= endDate) {
        const weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59);
        weeks.push({
          start: new Date(current),
          end: weekEnd > endDate ? endDate : weekEnd,
          label: formatLabel(current, true, false),
        });
        current = new Date(current);
        current.setDate(current.getDate() + 7);
      }

      const userGrowth: UserGrowthData[] = weeks.map(w => ({
        date: w.label,
        clients: (clients.data || []).filter(c => isDateInRange(c.created_at, w.start, w.end)).length,
        coaches: (coaches.data || []).filter(c => isDateInRange(c.created_at, w.start, w.end)).length,
      }));

      const sessionActivity: SessionActivityData[] = weeks.map(w => {
        const weekSessions = (sessions.data || []).filter(s => isDateInRange(s.created_at, w.start, w.end));
        return {
          date: w.label,
          scheduled: weekSessions.length,
          completed: weekSessions.filter(s => s.status === 'completed').length,
        };
      });

      return { userGrowth, sessionActivity };
    }

    // Daily data points for ranges ≤ 31 days
    const days: Date[] = [];
    for (let i = 0; i < daysDiff; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    const userGrowth: UserGrowthData[] = days.map(d => {
      const dateStr = formatDateStr(d);
      return {
        date: formatLabel(d),
        clients: (clients.data || []).filter(c => c.created_at.startsWith(dateStr)).length,
        coaches: (coaches.data || []).filter(c => c.created_at.startsWith(dateStr)).length,
      };
    });

    const sessionActivity: SessionActivityData[] = days.map(d => {
      const dateStr = formatDateStr(d);
      const daySessions = (sessions.data || []).filter(s => s.created_at.startsWith(dateStr));
      return {
        date: formatLabel(d),
        scheduled: daySessions.length,
        completed: daySessions.filter(s => s.status === 'completed').length,
      };
    });

    return { userGrowth, sessionActivity };
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const { start, end } = dateRange.getDateFilter();
      const compFilter = dateRange.getComparisonFilter();

      // Fetch current period analytics
      const currentAnalytics = await fetchAnalyticsForPeriod(start, end);
      setAnalytics(currentAnalytics);

      // Fetch comparison period if enabled
      if (compFilter) {
        const comparisonAnalytics = await fetchAnalyticsForPeriod(compFilter.start, compFilter.end);
        setComparison(comparisonAnalytics);
      } else {
        setComparison(null);
      }

      // Fetch chart data
      const { userGrowth, sessionActivity } = await fetchChartData(start, end);
      setUserGrowthData(userGrowth);
      setSessionData(sessionActivity);
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, fetchAnalyticsForPeriod, fetchChartData]);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange.startDate, dateRange.endDate, dateRange.compareMode]);

  return {
    analytics,
    comparison,
    userGrowthData,
    sessionData,
    loading,
    refetch: fetchAnalytics,
    dateRange,
  };
}
