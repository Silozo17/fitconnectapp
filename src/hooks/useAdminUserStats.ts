import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminUserStats {
  xp: {
    total: number;
    level: number;
    toNextLevel: number;
  };
  leaderboardRank: number;
  totalUsers: number;
  badges: {
    id: string;
    name: string;
    icon: string;
    rarity: string;
    earnedAt: string;
    isFeatured: boolean;
  }[];
  challenges: {
    active: number;
    completed: number;
    recent: {
      id: string;
      title: string;
      status: string;
      progress: number;
      target: number;
      completedAt?: string;
    }[];
  };
  habitStreak: {
    current: number;
    longest: number;
    totalCompletions: number;
  };
  recentActivity: {
    id: string;
    source: string;
    amount: number;
    createdAt: string;
  }[];
}

export function useAdminUserStats(clientProfileId: string | undefined) {
  return useQuery({
    queryKey: ['admin-user-stats', clientProfileId],
    queryFn: async (): Promise<AdminUserStats> => {
      if (!clientProfileId) throw new Error('No client ID');

      // Fetch XP data
      const { data: xpData } = await supabase
        .from('client_xp')
        .select('total_xp, current_level, xp_to_next_level')
        .eq('client_id', clientProfileId)
        .maybeSingle();

      // Calculate leaderboard rank
      const { data: allXp } = await supabase
        .from('client_xp')
        .select('client_id, total_xp')
        .order('total_xp', { ascending: false });

      const rank = allXp?.findIndex(x => x.client_id === clientProfileId) ?? -1;

      // Fetch badges earned
      const { data: earnedBadges } = await supabase
        .from('client_badges')
        .select('*, badges(id, name, icon, rarity)')
        .eq('client_id', clientProfileId)
        .order('earned_at', { ascending: false });

      // Fetch challenge participation
      const { data: challenges } = await supabase
        .from('challenge_participants')
        .select('*, challenges(id, title, target_value)')
        .eq('client_id', clientProfileId)
        .order('joined_at', { ascending: false });

      const activeCount = challenges?.filter(c => c.status === 'active').length || 0;
      const completedCount = challenges?.filter(c => c.status === 'completed').length || 0;

      // Fetch habit streaks
      const { data: habitStreaks } = await supabase
        .from('habit_streaks')
        .select('current_streak, longest_streak, total_completions, habit_id')
        .in('habit_id', 
          (await supabase
            .from('client_habits')
            .select('id')
            .eq('client_id', clientProfileId)
          ).data?.map(h => h.id) || []
        );

      const currentStreak = habitStreaks?.reduce((max, s) => Math.max(max, s.current_streak || 0), 0) || 0;
      const longestStreak = habitStreaks?.reduce((max, s) => Math.max(max, s.longest_streak || 0), 0) || 0;
      const totalCompletions = habitStreaks?.reduce((sum, s) => sum + (s.total_completions || 0), 0) || 0;

      // Fetch recent XP transactions
      const { data: xpTransactions } = await supabase
        .from('xp_transactions')
        .select('id, source, amount, created_at')
        .eq('client_id', clientProfileId)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        xp: {
          total: xpData?.total_xp || 0,
          level: xpData?.current_level || 1,
          toNextLevel: xpData?.xp_to_next_level || 100,
        },
        leaderboardRank: rank + 1,
        totalUsers: allXp?.length || 0,
        badges: (earnedBadges || []).map(b => ({
          id: b.badge_id,
          name: (b.badges as any)?.name || 'Unknown',
          icon: (b.badges as any)?.icon || 'Trophy',
          rarity: (b.badges as any)?.rarity || 'common',
          earnedAt: b.earned_at,
          isFeatured: b.is_featured || false,
        })),
        challenges: {
          active: activeCount,
          completed: completedCount,
          recent: (challenges || []).slice(0, 5).map(c => ({
            id: c.challenge_id,
            title: (c.challenges as any)?.title || 'Unknown',
            status: c.status,
            progress: c.current_progress,
            target: (c.challenges as any)?.target_value || 0,
            completedAt: c.completed_at || undefined,
          })),
        },
        habitStreak: {
          current: currentStreak,
          longest: longestStreak,
          totalCompletions,
        },
        recentActivity: (xpTransactions || []).map(t => ({
          id: t.id,
          source: t.source,
          amount: t.amount,
          createdAt: t.created_at,
        })),
      };
    },
    enabled: !!clientProfileId,
  });
}
