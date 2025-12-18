import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ChallengeReward {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface Challenge {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  challenge_type: string;
  target_value: number;
  target_unit: string;
  start_date: string;
  end_date: string;
  xp_reward: number;
  badge_reward_id: string | null;
  avatar_reward_id: string | null;
  reward_type: 'badge' | 'avatar' | null;
  visibility: string;
  max_participants: number | null;
  is_active: boolean;
  created_at: string;
  participant_count?: number;
  my_participation?: ChallengeParticipant;
  // Reward data (joined)
  avatar_reward?: ChallengeReward | null;
  badge_reward?: ChallengeReward | null;
  // Verification fields
  requires_verification: boolean;
  data_source: 'wearable_only' | 'verified_only' | 'any';
  wearable_data_type: string | null;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  client_id: string;
  current_progress: number;
  status: 'active' | 'completed' | 'failed' | 'withdrawn';
  joined_at: string;
  completed_at: string | null;
  challenge?: Challenge;
  // New verification fields
  verified_progress: number;
  unverified_progress: number;
  last_wearable_sync_at: string | null;
}

// Wearable data types for challenges
export const WEARABLE_DATA_TYPES = [
  { value: 'steps', label: 'Steps', unit: 'steps' },
  { value: 'calories', label: 'Calories Burned', unit: 'kcal' },
  { value: 'active_minutes', label: 'Active Minutes', unit: 'minutes' },
  { value: 'sleep', label: 'Sleep Hours', unit: 'hours' },
  { value: 'distance', label: 'Distance', unit: 'km' },
  { value: 'heart_rate', label: 'Avg Heart Rate', unit: 'bpm' },
];

export const CHALLENGE_TYPES = [
  // Manual challenge types
  { value: 'habit_streak', label: 'Habit Streak', unit: 'days', description: 'Maintain a streak for X days', wearableRequired: false },
  { value: 'workout_count', label: 'Workout Count', unit: 'workouts', description: 'Complete X workouts', wearableRequired: false },
  { value: 'xp_race', label: 'XP Race', unit: 'XP', description: 'Earn the most XP', wearableRequired: false },
  { value: 'progress_logs', label: 'Progress Logs', unit: 'entries', description: 'Log X progress entries', wearableRequired: false },
  { value: 'habit_completions', label: 'Habit Completions', unit: 'completions', description: 'Complete X habit check-ins', wearableRequired: false },
  // Wearable-verified challenge types
  { value: 'steps_total', label: 'Step Challenge', unit: 'steps', description: 'Walk X total steps', wearableRequired: true, dataType: 'steps' },
  { value: 'active_minutes_total', label: 'Active Minutes', unit: 'minutes', description: 'X minutes of activity', wearableRequired: true, dataType: 'active_minutes' },
  { value: 'calories_burned', label: 'Calorie Burn', unit: 'kcal', description: 'Burn X calories', wearableRequired: true, dataType: 'calories' },
  { value: 'sleep_challenge', label: 'Sleep Challenge', unit: 'hours', description: 'Average X hours sleep', wearableRequired: true, dataType: 'sleep' },
  { value: 'distance_challenge', label: 'Distance Challenge', unit: 'km', description: 'Travel X kilometers', wearableRequired: true, dataType: 'distance' },
];

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

function useCoachProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-coach-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('coach_profiles').select('id').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useAvailableChallenges() {
  const { data: profile } = useClientProfile();
  
  return useQuery({
    queryKey: ['available-challenges'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          avatar_reward:avatar_reward_id(id, name, description, image_url, rarity),
          badge_reward:badge_reward_id(id, name, description, image_url, rarity)
        `)
        .eq('is_active', true)
        .eq('visibility', 'public')
        .gte('end_date', today)
        .order('start_date', { ascending: true });
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      const challengeIds = data.map(c => c.id);
      
      // Guard against empty array for .in() query
      const { data: participantCounts } = challengeIds.length > 0
        ? await supabase.from('challenge_participants').select('challenge_id').in('challenge_id', challengeIds)
        : { data: [] };
      
      const counts: Record<string, number> = {};
      participantCounts?.forEach(p => { counts[p.challenge_id] = (counts[p.challenge_id] || 0) + 1; });
      
      let myParticipations: Record<string, ChallengeParticipant> = {};
      if (profile?.id && challengeIds.length > 0) {
        const { data: myData } = await supabase.from('challenge_participants').select('*').eq('client_id', profile.id).in('challenge_id', challengeIds);
        myData?.forEach(p => { myParticipations[p.challenge_id] = p as ChallengeParticipant; });
      }
      
      return data.map(c => ({ 
        ...c, 
        participant_count: counts[c.id] || 0, 
        my_participation: myParticipations[c.id],
        avatar_reward: c.avatar_reward as ChallengeReward | null,
        badge_reward: c.badge_reward as ChallengeReward | null,
      })) as Challenge[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMyChallenges() {
  const { data: profile } = useClientProfile();
  
  return useQuery({
    queryKey: ['my-challenges', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase.from('challenge_participants').select(`*, challenge:challenges(*)`).eq('client_id', profile.id).order('joined_at', { ascending: false });
      if (error) throw error;
      return data as (ChallengeParticipant & { challenge: Challenge })[];
    },
    enabled: !!profile?.id,
  });
}

export function useChallengeLeaderboard(challengeId: string | undefined) {
  return useQuery({
    queryKey: ['challenge-leaderboard', challengeId],
    queryFn: async () => {
      if (!challengeId) return [];
      const { data, error } = await supabase.from('challenge_participants').select(`*, client:client_id(id, first_name, last_name, avatar_url)`).eq('challenge_id', challengeId).order('current_progress', { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!challengeId,
  });
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  const { data: profile } = useClientProfile();
  
  return useMutation({
    mutationFn: async (challengeId: string) => {
      if (!profile?.id) throw new Error('No client profile');
      
      const { data: existing } = await supabase.from('challenge_participants').select('id').eq('challenge_id', challengeId).eq('client_id', profile.id).maybeSingle();
      if (existing) throw new Error('Already joined this challenge');
      
      const { data, error } = await supabase.from('challenge_participants').insert({ challenge_id: challengeId, client_id: profile.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['my-challenges'] });
      toast.success('Challenge joined!', { description: 'Good luck on your challenge!' });
    },
    onError: (error: Error) => {
      toast.error('Failed to join challenge', { description: error.message });
    },
  });
}

export function useUpdateChallengeProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ participantId, progress }: { participantId: string; progress: number; }) => {
      const { data, error } = await supabase.from('challenge_participants').update({ current_progress: progress }).eq('id', participantId).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge-leaderboard'] });
    },
  });
}

export function useWithdrawChallenge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (participantId: string) => {
      const { error } = await supabase.from('challenge_participants').update({ status: 'withdrawn' }).eq('id', participantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['my-challenges'] });
      toast.success('Withdrawn from challenge');
    },
  });
}

export function useCreateChallenge() {
  const queryClient = useQueryClient();
  const { data: profile } = useCoachProfile();
  
  return useMutation({
    mutationFn: async (challenge: { title: string; description?: string; challenge_type: string; target_value: number; target_unit: string; start_date: string; end_date: string; xp_reward: number; visibility: string; max_participants?: number; target_audience?: string; }) => {
      if (!profile?.id) throw new Error('No coach profile');
      const { data, error } = await supabase.from('challenges').insert({ ...challenge, created_by: profile.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['available-challenges'] });
      
      // Send notifications for new public challenges
      if (data && data.visibility === 'public' && data.is_active) {
        try {
          await supabase.functions.invoke('notify-new-challenge', {
            body: {
              challenge_id: data.id,
              title: data.title,
              description: data.description,
              target_audience: data.target_audience || 'clients',
              xp_reward: data.xp_reward,
              visibility: data.visibility,
            },
          });
        } catch (error) {
          console.error('Failed to send challenge notifications:', error);
        }
      }
      
      toast.success('Challenge created!');
    },
  });
}
