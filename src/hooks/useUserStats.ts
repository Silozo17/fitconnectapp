import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserStats {
  workoutCount: number;
  habitStreak: number;
  progressEntries: number;
  progressPhotos: number;
  macroDays: number;
  xpTotal: number;
  leaderboardRank: number;
  challengesCompleted: number;
  isCoach: boolean;
  badgesEarned: number;
  currentLevel: number;
}

export function useUserStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async (): Promise<UserStats> => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Get client profile
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Check if user is a coach
      const { data: coachProfile } = await supabase
        .from('coach_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const clientId = clientProfile?.id;
      
      // Get workout count from XP transactions
      const { count: workoutCount } = await supabase
        .from('xp_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId || '')
        .eq('source', 'workout_logged');
      
      // Get longest habit streak
      const { data: habitStreaks } = await supabase
        .from('habit_streaks')
        .select('longest_streak')
        .eq('habit_id', clientId || '');
      
      const longestStreak = habitStreaks?.reduce((max, s) => Math.max(max, s.longest_streak || 0), 0) || 0;
      
      // Get progress entries count
      const { count: progressEntries } = await supabase
        .from('client_progress')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId || '');
      
      // Get progress photos count
      const { data: progressWithPhotos } = await supabase
        .from('client_progress')
        .select('photo_urls')
        .eq('client_id', clientId || '')
        .not('photo_urls', 'is', null);
      
      const progressPhotos = progressWithPhotos?.reduce((count, p) => {
        const urls = p.photo_urls as string[] | null;
        return count + (urls?.length || 0);
      }, 0) || 0;
      
      // Get XP data
      const { data: xpData } = await supabase
        .from('client_xp')
        .select('total_xp, current_level')
        .eq('client_id', clientId || '')
        .maybeSingle();
      
      // Get leaderboard rank
      const { data: allXp } = await supabase
        .from('client_xp')
        .select('client_id, total_xp')
        .order('total_xp', { ascending: false });
      
      const leaderboardRank = allXp?.findIndex(x => x.client_id === clientId) ?? -1;
      
      // Get completed challenges
      const { count: challengesCompleted } = await supabase
        .from('challenge_participants')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId || '')
        .eq('status', 'completed');
      
      // Get badges earned
      const { count: badgesEarned } = await supabase
        .from('client_badges')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId || '');
      
      return {
        workoutCount: workoutCount || 0,
        habitStreak: longestStreak,
        progressEntries: progressEntries || 0,
        progressPhotos,
        macroDays: 0, // TODO: implement macro tracking
        xpTotal: xpData?.total_xp || 0,
        leaderboardRank: leaderboardRank + 1, // 1-indexed
        challengesCompleted: challengesCompleted || 0,
        isCoach: !!coachProfile,
        badgesEarned: badgesEarned || 0,
        currentLevel: xpData?.current_level || 1,
      };
    },
    enabled: !!user?.id,
  });
}
