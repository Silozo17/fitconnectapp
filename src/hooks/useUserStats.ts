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
  totalLeaderboardUsers: number;
  // Location-based ranking
  localRank: number;
  localTotal: number;
  localArea: string | null; // city or county name
  localType: 'city' | 'county' | 'global'; // which level the rank is for
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

const defaultStats: UserStats = {
  workoutCount: 0,
  habitStreak: 0,
  progressEntries: 0,
  progressPhotos: 0,
  macroDays: 0,
  xpTotal: 0,
  leaderboardRank: 0,
  totalLeaderboardUsers: 0,
  localRank: 0,
  localTotal: 0,
  localArea: null,
  localType: 'global',
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

export function useUserStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async (): Promise<UserStats> => {
      if (!user?.id) throw new Error('Not authenticated');
      
      try {
        // BATCH 1: Get profiles in parallel (including location for local ranking)
        const [clientProfileResult, coachProfileResult] = await Promise.all([
          supabase
            .from('client_profiles')
            .select('id, city, county, leaderboard_visible')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('coach_profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);
        
        const clientId = clientProfileResult.data?.id;
        const clientCity = clientProfileResult.data?.city;
        const clientCounty = clientProfileResult.data?.county;
        const isCoach = !!coachProfileResult.data;
        
        // Return default stats if no client profile exists yet
        if (!clientId) {
          return { ...defaultStats, isCoach };
        }
        
        // BATCH 2: All stat queries in parallel
        const [
          workoutCountResult,
          habitStreaksResult,
          progressEntriesResult,
          progressPhotosResult,
          xpDataResult,
          leaderboardRankResult,
          totalLeaderboardResult,
          challengesCompletedResult,
          challengesJoinedResult,
          completedChallengesResult,
          badgesEarnedResult,
          goalsAchievedResult,
          wearableCountResult,
          coachConnectionResult,
          wearableDataResult,
        ] = await Promise.all([
          // Workout count from XP transactions
          supabase
            .from('xp_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', clientId)
            .eq('source', 'workout_logged'),
          
          // Longest habit streak
          supabase
            .from('habit_streaks')
            .select('longest_streak')
            .eq('habit_id', clientId),
          
          // Progress entries count
          supabase
            .from('client_progress')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', clientId),
          
          // Progress photos
          supabase
            .from('client_progress')
            .select('photo_urls')
            .eq('client_id', clientId)
            .not('photo_urls', 'is', null),
          
          // XP data
          supabase
            .from('client_xp')
            .select('total_xp, current_level')
            .eq('client_id', clientId)
            .maybeSingle(),
          
          // Leaderboard rank via RPC (optimized server-side calculation)
          supabase.rpc('get_client_leaderboard_rank', { client_id_param: clientId }),
          
          // Total leaderboard users (visible profiles with XP)
          supabase
            .from('client_profiles')
            .select('id', { count: 'exact', head: true })
            .eq('leaderboard_visible', true),
          
          // Completed challenges
          supabase
            .from('challenge_participants')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', clientId)
            .eq('status', 'completed'),
          
          // Joined challenges
          supabase
            .from('challenge_participants')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', clientId),
          
          // Won challenges data
          supabase
            .from('challenge_participants')
            .select('challenge_id, challenges!inner(end_date)')
            .eq('client_id', clientId)
            .eq('status', 'completed'),
          
          // Badges earned
          supabase
            .from('client_badges')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', clientId),
          
          // Goals achieved
          supabase
            .from('xp_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', clientId)
            .eq('source', 'goal_achieved'),
          
          // Wearable connections
          supabase
            .from('wearable_connections')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', clientId)
            .eq('is_active', true),
          
          // Coach connection
          supabase
            .from('coach_clients')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', clientId)
            .eq('status', 'active'),
          
          // Wearable health data for achievements
          supabase
            .from('health_data_sync')
            .select('data_type, value')
            .eq('client_id', clientId),
        ]);
        
        // BATCH 3: Location-based ranking (only if city or county is set)
        let localRank = 0;
        let localTotal = 0;
        let localArea: string | null = null;
        let localType: 'city' | 'county' | 'global' = 'global';

        // Prioritize city ranking first, then county, then fall back to global
        if (clientCity) {
          // Step 1: Get all visible profiles in the same city
          const { data: cityProfiles } = await supabase
            .from('client_profiles')
            .select('id')
            .eq('leaderboard_visible', true)
            .eq('city', clientCity);
          
          if (cityProfiles && cityProfiles.length > 0) {
            // Step 2: Get XP for all those profiles
            const profileIds = cityProfiles.map(p => p.id);
            const { data: xpData } = await supabase
              .from('client_xp')
              .select('client_id, total_xp')
              .in('client_id', profileIds);
            
            // Step 3: Merge and sort
            const xpMap = new Map(xpData?.map(x => [x.client_id, x.total_xp || 0]) || []);
            const sorted = cityProfiles
              .map(p => ({ id: p.id, xp: xpMap.get(p.id) || 0 }))
              .sort((a, b) => b.xp - a.xp);
            
            const userIndex = sorted.findIndex(p => p.id === clientId);
            if (userIndex !== -1) {
              localRank = userIndex + 1;
              localTotal = sorted.length;
              localArea = clientCity;
              localType = 'city';
            }
          }
        }

        // If no city rank found, try county
        if (localRank === 0 && clientCounty) {
          const { data: countyProfiles } = await supabase
            .from('client_profiles')
            .select('id')
            .eq('leaderboard_visible', true)
            .eq('county', clientCounty);
          
          if (countyProfiles && countyProfiles.length > 0) {
            const profileIds = countyProfiles.map(p => p.id);
            const { data: xpData } = await supabase
              .from('client_xp')
              .select('client_id, total_xp')
              .in('client_id', profileIds);
            
            const xpMap = new Map(xpData?.map(x => [x.client_id, x.total_xp || 0]) || []);
            const sorted = countyProfiles
              .map(p => ({ id: p.id, xp: xpMap.get(p.id) || 0 }))
              .sort((a, b) => b.xp - a.xp);
            
            const userIndex = sorted.findIndex(p => p.id === clientId);
            if (userIndex !== -1) {
              localRank = userIndex + 1;
              localTotal = sorted.length;
              localArea = clientCounty;
              localType = 'county';
            }
          }
        }
        
        // Fallback to global if no local rank
        if (localRank === 0) {
          localRank = leaderboardRankResult.data || 0;
          localTotal = totalLeaderboardResult.count || 0;
          localArea = null;
          localType = 'global';
        }
        
        // Process results
        const longestStreak = habitStreaksResult.data?.reduce(
          (max, s) => Math.max(max, s.longest_streak || 0), 0
        ) || 0;
        
        const progressPhotos = progressPhotosResult.data?.reduce((count, p) => {
          const urls = p.photo_urls as string[] | null;
          return count + (urls?.length || 0);
        }, 0) || 0;
        
        // Calculate won challenges
        const now = new Date().toISOString();
        const challengesWon = completedChallengesResult.data?.filter(c => {
          const challenge = c.challenges as unknown as { end_date: string };
          return challenge?.end_date && challenge.end_date <= now;
        }).length || 0;
        
        // Aggregate wearable data by type
        const wearableData = wearableDataResult.data || [];
        const wearableTotals = wearableData.reduce((acc, row) => {
          const type = row.data_type;
          const value = row.value || 0;
          
          switch (type) {
            case 'steps':
              acc.steps += value;
              break;
            case 'calories':
            case 'active_calories':
              acc.calories += value;
              break;
            case 'distance':
            case 'distance_walking':
            case 'distance_cycling':
            case 'distance_swimming':
              acc.distance += value;
              break;
            case 'active_minutes':
            case 'exercise_time':
              acc.activeMinutes += value;
              break;
            case 'sleep':
            case 'sleep_duration':
              acc.sleepMinutes += value;
              break;
          }
          return acc;
        }, { steps: 0, calories: 0, distance: 0, activeMinutes: 0, sleepMinutes: 0 });
        
        return {
          workoutCount: workoutCountResult.count || 0,
          habitStreak: longestStreak,
          progressEntries: progressEntriesResult.count || 0,
          progressPhotos,
          macroDays: 0, // TODO: implement macro tracking
          xpTotal: xpDataResult.data?.total_xp || 0,
          leaderboardRank: leaderboardRankResult.data || 0,
          totalLeaderboardUsers: totalLeaderboardResult.count || 0,
          localRank,
          localTotal,
          localArea,
          localType,
          challengesCompleted: challengesCompletedResult.count || 0,
          challengesJoined: challengesJoinedResult.count || 0,
          challengesWon,
          isCoach,
          badgesEarned: badgesEarnedResult.count || 0,
          currentLevel: xpDataResult.data?.current_level || 1,
          goalsAchieved: goalsAchievedResult.count || 0,
          stepsTotal: wearableTotals.steps,
          caloriesTotal: wearableTotals.calories,
          distanceTotal: wearableTotals.distance,
          activeMinutesTotal: wearableTotals.activeMinutes,
          wearableWorkoutCount: 0, // TODO: track workout-specific entries
          sleepHoursTotal: Math.round(wearableTotals.sleepMinutes / 60),
          devicesConnected: wearableCountResult.count || 0,
          coachConnected: (coachConnectionResult.count || 0) > 0,
        };
      } catch (error) {
        console.error('[useUserStats] Error fetching stats:', error);
        return defaultStats;
      }
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 60000, // 1 minute - increased from 30s
  });
}
