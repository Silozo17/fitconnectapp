import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { XPLeaderboardEntry } from '@/hooks/useGamification';

function useClientProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-client-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('client_profiles').select('id').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useWeeklyLeaderboard(limit = 20) {
  return useQuery({
    queryKey: ['weekly-leaderboard', limit],
    queryFn: async () => {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const { data: transactions, error } = await supabase.from('xp_transactions').select('client_id, amount').gte('created_at', weekStart.toISOString()).lte('created_at', weekEnd.toISOString());
      if (error) throw error;
      
      const xpByClient: Record<string, number> = {};
      transactions?.forEach(tx => { xpByClient[tx.client_id] = (xpByClient[tx.client_id] || 0) + tx.amount; });
      
      const topClientIds = Object.entries(xpByClient).sort(([, a], [, b]) => b - a).slice(0, limit).map(([id]) => id);
      if (topClientIds.length === 0) return [];
      
      const { data: clients } = await supabase.from('client_profiles').select('id, first_name, last_name, avatar_url').in('id', topClientIds);
      const { data: xpData } = await supabase.from('client_xp').select('client_id, current_level').in('client_id', topClientIds);
      
      const levelMap: Record<string, number> = {};
      xpData?.forEach(x => { levelMap[x.client_id] = x.current_level; });
      
      return topClientIds.map((clientId, index) => {
        const client = clients?.find(c => c.id === clientId);
        return { client_id: clientId, total_xp: xpByClient[clientId], current_level: levelMap[clientId] || 1, first_name: client?.first_name || null, last_name: client?.last_name || null, avatar_url: client?.avatar_url || null, rank: index + 1 };
      }) as XPLeaderboardEntry[];
    },
  });
}

export function useMonthlyLeaderboard(limit = 20) {
  return useQuery({
    queryKey: ['monthly-leaderboard', limit],
    queryFn: async () => {
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      
      const { data: transactions, error } = await supabase.from('xp_transactions').select('client_id, amount').gte('created_at', monthStart.toISOString()).lte('created_at', monthEnd.toISOString());
      if (error) throw error;
      
      const xpByClient: Record<string, number> = {};
      transactions?.forEach(tx => { xpByClient[tx.client_id] = (xpByClient[tx.client_id] || 0) + tx.amount; });
      
      const topClientIds = Object.entries(xpByClient).sort(([, a], [, b]) => b - a).slice(0, limit).map(([id]) => id);
      if (topClientIds.length === 0) return [];
      
      const { data: clients } = await supabase.from('client_profiles').select('id, first_name, last_name, avatar_url').in('id', topClientIds);
      const { data: xpData } = await supabase.from('client_xp').select('client_id, current_level').in('client_id', topClientIds);
      
      const levelMap: Record<string, number> = {};
      xpData?.forEach(x => { levelMap[x.client_id] = x.current_level; });
      
      return topClientIds.map((clientId, index) => {
        const client = clients?.find(c => c.id === clientId);
        return { client_id: clientId, total_xp: xpByClient[clientId], current_level: levelMap[clientId] || 1, first_name: client?.first_name || null, last_name: client?.last_name || null, avatar_url: client?.avatar_url || null, rank: index + 1 };
      }) as XPLeaderboardEntry[];
    },
  });
}

export function useAllTimeLeaderboard(limit = 20) {
  return useQuery({
    queryKey: ['all-time-leaderboard', limit],
    queryFn: async () => {
      const { data: xpData, error } = await supabase.from('client_xp').select('client_id, total_xp, current_level').order('total_xp', { ascending: false }).limit(limit);
      if (error) throw error;
      if (!xpData || xpData.length === 0) return [];
      
      const clientIds = xpData.map(x => x.client_id);
      const { data: clients } = await supabase.from('client_profiles').select('id, first_name, last_name, avatar_url').in('id', clientIds);
      
      return xpData.map((xp, index) => {
        const client = clients?.find(c => c.id === xp.client_id);
        return { client_id: xp.client_id, total_xp: xp.total_xp, current_level: xp.current_level, first_name: client?.first_name || null, last_name: client?.last_name || null, avatar_url: client?.avatar_url || null, rank: index + 1 };
      }) as XPLeaderboardEntry[];
    },
  });
}

export function useMyRank() {
  const { data: profile } = useClientProfile();
  
  return useQuery({
    queryKey: ['my-rank', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data: myXP } = await supabase.from('client_xp').select('total_xp').eq('client_id', profile.id).maybeSingle();
      if (!myXP) return { rank: null, total: 0 };
      
      const { count } = await supabase.from('client_xp').select('*', { count: 'exact', head: true }).gt('total_xp', myXP.total_xp);
      const { count: total } = await supabase.from('client_xp').select('*', { count: 'exact', head: true });
      
      return { rank: (count || 0) + 1, total: total || 0, xp: myXP.total_xp };
    },
    enabled: !!profile?.id,
  });
}
