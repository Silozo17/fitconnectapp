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

    // Generate date buckets for last 14 days
    const endDate = new Date(end);
    const days: Date[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(endDate);
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const formatLabel = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const userGrowth: UserGrowthData[] = days.map(d => {
      const dateStr = formatDate(d);
      return {
        date: formatLabel(d),
        clients: (clients.data || []).filter(c => c.created_at.startsWith(dateStr)).length,
        coaches: (coaches.data || []).filter(c => c.created_at.startsWith(dateStr)).length,
      };
    });

    const sessionActivity: SessionActivityData[] = days.map(d => {
      const dateStr = formatDate(d);
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
