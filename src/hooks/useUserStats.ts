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
  challengesJoined: number;
  challengesWon: number;
  isCoach: boolean;
  badgesEarned: number;
  currentLevel: number;
  goalsAchieved: number;
  // Wearable-based stats
  stepsTotal: number;
  caloriesTotal: number;
  distanceTotal: number;
  activeMinutesTotal: number;
  wearableWorkoutCount: number;
  sleepHoursTotal: number;
  devicesConnected: number;
  coachConnected: boolean;
}

export function useUserStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async (): Promise<UserStats> => {
      if (!user?.id) throw new Error('Not authenticated');
      
      try {
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
        
        // Return default stats if no client profile exists yet
        if (!clientId) {
          return {
            workoutCount: 0,
            habitStreak: 0,
            progressEntries: 0,
            progressPhotos: 0,
            macroDays: 0,
            xpTotal: 0,
            leaderboardRank: 0,
            challengesCompleted: 0,
            challengesJoined: 0,
            challengesWon: 0,
            isCoach: !!coachProfile,
            badgesEarned: 0,
            currentLevel: 1,
            goalsAchieved: 0,
            stepsTotal: 0,
            caloriesTotal: 0,
            distanceTotal: 0,
            activeMinutesTotal: 0,
            wearableWorkoutCount: 0,
            sleepHoursTotal: 0,
            devicesConnected: 0,
            coachConnected: false,
          };
        }
        
        // Get workout count from XP transactions
        const { count: workoutCount } = await supabase
          .from('xp_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientId)
          .eq('source', 'workout_logged');
        
        // Get longest habit streak
        const { data: habitStreaks } = await supabase
          .from('habit_streaks')
          .select('longest_streak')
          .eq('habit_id', clientId);
        
        const longestStreak = habitStreaks?.reduce((max, s) => Math.max(max, s.longest_streak || 0), 0) || 0;
        
        // Get progress entries count
        const { count: progressEntries } = await supabase
          .from('client_progress')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientId);
        
        // Get progress photos count
        const { data: progressWithPhotos } = await supabase
          .from('client_progress')
          .select('photo_urls')
          .eq('client_id', clientId)
          .not('photo_urls', 'is', null);
        
        const progressPhotos = progressWithPhotos?.reduce((count, p) => {
          const urls = p.photo_urls as string[] | null;
          return count + (urls?.length || 0);
        }, 0) || 0;
        
        // Get XP data
        const { data: xpData } = await supabase
          .from('client_xp')
          .select('total_xp, current_level')
          .eq('client_id', clientId)
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
          .eq('client_id', clientId)
          .eq('status', 'completed');
        
        // Get joined challenges (any status)
        const { count: challengesJoined } = await supabase
          .from('challenge_participants')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientId);

        // Get won challenges - fetch completed challenges and filter by end_date in JS
        // This avoids PostgREST syntax issues with filtering on joined tables
        let challengesWon = 0;
        try {
          const { data: completedChallenges } = await supabase
            .from('challenge_participants')
            .select('challenge_id, challenges!inner(end_date)')
            .eq('client_id', clientId)
            .eq('status', 'completed');
          
          const now = new Date().toISOString();
          challengesWon = completedChallenges?.filter(c => {
            const challenge = c.challenges as unknown as { end_date: string };
            return challenge?.end_date && challenge.end_date <= now;
          }).length || 0;
        } catch (err) {
          console.warn('Failed to fetch won challenges:', err);
        }
        
        // Get badges earned
        const { count: badgesEarned } = await supabase
          .from('client_badges')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientId);
        
        // Get goals achieved count from XP transactions
        const { count: goalsAchieved } = await supabase
          .from('xp_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientId)
          .eq('source', 'goal_achieved');
        
        // Get wearable data totals - initialize with defaults
        let stepsTotal = 0;
        let caloriesTotal = 0;
        let distanceTotal = 0;
        let activeMinutesTotal = 0;
        let wearableWorkoutCount = 0;
        let sleepHoursTotal = 0;
        let devicesConnected = 0;
        
        try {
          // Try to get wearable connections count
          const { count: wearableCount } = await supabase
            .from('wearable_connections')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', clientId)
            .eq('is_active', true);
          devicesConnected = wearableCount || 0;
        } catch {
          // Table might not exist, use default
        }
        
        // Check if connected to a coach
        const { count: coachConnectionCount } = await supabase
          .from('coach_clients')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientId)
          .eq('status', 'active');
        
        return {
          workoutCount: workoutCount || 0,
          habitStreak: longestStreak,
          progressEntries: progressEntries || 0,
          progressPhotos,
          macroDays: 0, // TODO: implement macro tracking
          xpTotal: xpData?.total_xp || 0,
          leaderboardRank: leaderboardRank + 1, // 1-indexed
          challengesCompleted: challengesCompleted || 0,
          challengesJoined: challengesJoined || 0,
          challengesWon,
          isCoach: !!coachProfile,
          badgesEarned: badgesEarned || 0,
          currentLevel: xpData?.current_level || 1,
          goalsAchieved: goalsAchieved || 0,
          stepsTotal,
          caloriesTotal,
          distanceTotal,
          activeMinutesTotal,
          wearableWorkoutCount,
          sleepHoursTotal,
          devicesConnected: devicesConnected || 0,
          coachConnected: (coachConnectionCount || 0) > 0,
        };
      } catch (error) {
        console.error('[useUserStats] Error fetching stats:', error);
        // Return default stats on error to prevent page crash
        return {
          workoutCount: 0,
          habitStreak: 0,
          progressEntries: 0,
          progressPhotos: 0,
          macroDays: 0,
          xpTotal: 0,
          leaderboardRank: 0,
          challengesCompleted: 0,
          challengesJoined: 0,
          challengesWon: 0,
          isCoach: false,
          badgesEarned: 0,
          currentLevel: 1,
          goalsAchieved: 0,
          stepsTotal: 0,
          caloriesTotal: 0,
          distanceTotal: 0,
          activeMinutesTotal: 0,
          wearableWorkoutCount: 0,
          sleepHoursTotal: 0,
          devicesConnected: 0,
          coachConnected: false,
        };
      }
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 30000, // 30 seconds
  });
}
