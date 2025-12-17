import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ClientXP {
  id: string;
  client_id: string;
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  created_at: string;
  updated_at: string;
}

export interface XPTransaction {
  id: string;
  client_id: string;
  amount: number;
  source: string;
  source_id: string | null;
  description: string;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  image_url?: string | null;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  xp_reward: number;
  criteria: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface ClientBadge {
  id: string;
  client_id: string;
  badge_id: string;
  earned_at: string;
  source_data: Record<string, any> | null;
  is_featured: boolean;
  badge?: Badge;
}

export interface XPLeaderboardEntry {
  client_id: string;
  total_xp: number;
  current_level: number;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  rank?: number;
  city?: string | null;
  county?: string | null;
  country?: string | null;
}

export const XP_ACTIONS = {
  HABIT_COMPLETION: { amount: 10, source: 'habit_completion', description: 'Completed a habit' },
  STREAK_3_DAY: { amount: 25, source: 'streak_bonus', description: '3-day streak bonus' },
  STREAK_7_DAY: { amount: 75, source: 'streak_bonus', description: '7-day streak bonus' },
  STREAK_14_DAY: { amount: 150, source: 'streak_bonus', description: '14-day streak bonus' },
  STREAK_30_DAY: { amount: 400, source: 'streak_bonus', description: '30-day streak bonus' },
  WORKOUT_LOGGED: { amount: 20, source: 'workout_logged', description: 'Logged a workout' },
  SESSION_COMPLETED: { amount: 50, source: 'session_completed', description: 'Completed coaching session' },
  PROGRESS_LOGGED: { amount: 15, source: 'progress_logged', description: 'Logged progress entry' },
  PHOTO_UPLOADED: { amount: 25, source: 'photo_uploaded', description: 'Uploaded progress photo' },
  GOAL_ACHIEVED: { amount: 200, source: 'goal_achieved', description: 'Achieved a fitness goal' },
  CHALLENGE_WON: { amount: 100, source: 'challenge_won', description: 'Won a challenge' },
  BADGE_EARNED: { amount: 0, source: 'badge_earned', description: 'Earned a badge' },
};

export const LEVEL_TITLES: Record<string, string> = {
  '1-5': 'Beginner',
  '6-10': 'Apprentice',
  '11-20': 'Warrior',
  '21-35': 'Champion',
  '36-50': 'Elite',
  '51+': 'Legend',
};

export function getLevelTitle(level: number): string {
  if (level <= 5) return 'Beginner';
  if (level <= 10) return 'Apprentice';
  if (level <= 20) return 'Warrior';
  if (level <= 35) return 'Champion';
  if (level <= 50) return 'Elite';
  return 'Legend';
}

export function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function calculateLevelFromXP(totalXP: number): { level: number; xpInLevel: number; xpForNextLevel: number } {
  let level = 1;
  let xpRemaining = totalXP;
  
  while (xpRemaining >= calculateXPForLevel(level)) {
    xpRemaining -= calculateXPForLevel(level);
    level++;
  }
  
  return {
    level,
    xpInLevel: xpRemaining,
    xpForNextLevel: calculateXPForLevel(level),
  };
}

export const RARITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: 'bg-muted', border: 'border-muted-foreground/30', text: 'text-muted-foreground' },
  uncommon: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-500' },
  rare: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-500' },
  epic: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-500' },
  legendary: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-500' },
};

// Helper hook to get client profile
function useClientProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-client-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useClientXP() {
  const { user } = useAuth();
  const { data: profile } = useClientProfile();
  
  return useQuery({
    queryKey: ['client-xp', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from('client_xp')
        .select('*')
        .eq('client_id', profile.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('client_xp')
          .insert({ client_id: profile.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newData as ClientXP;
      }
      
      return data as ClientXP;
    },
    enabled: !!user && !!profile?.id,
  });
}

export function useXPTransactions(limit = 20) {
  const { data: profile } = useClientProfile();
  
  return useQuery({
    queryKey: ['xp-transactions', profile?.id, limit],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as XPTransaction[];
    },
    enabled: !!profile?.id,
  });
}

export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data as Badge[];
    },
  });
}

export function useClientBadges() {
  const { data: profile } = useClientProfile();
  
  return useQuery({
    queryKey: ['client-badges', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('client_badges')
        .select(`*, badge:badges(*)`)
        .eq('client_id', profile.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data as (ClientBadge & { badge: Badge })[];
    },
    enabled: !!profile?.id,
  });
}

export function useAwardXP() {
  const queryClient = useQueryClient();
  const { data: profile } = useClientProfile();
  
  return useMutation({
    mutationFn: async ({ amount, source, description, sourceId }: { amount: number; source: string; description: string; sourceId?: string; }) => {
      if (!profile?.id) throw new Error('No client profile');
      
      await supabase.from('xp_transactions').insert({
        client_id: profile.id,
        amount,
        source,
        description,
        source_id: sourceId || null,
      });
      
      const { data: currentXP } = await supabase
        .from('client_xp')
        .select('*')
        .eq('client_id', profile.id)
        .maybeSingle();
      
      const newTotalXP = (currentXP?.total_xp || 0) + amount;
      const { level, xpForNextLevel } = calculateLevelFromXP(newTotalXP);
      
      if (currentXP) {
        await supabase.from('client_xp').update({ total_xp: newTotalXP, current_level: level, xp_to_next_level: xpForNextLevel }).eq('client_id', profile.id);
      } else {
        await supabase.from('client_xp').insert({ client_id: profile.id, total_xp: newTotalXP, current_level: level, xp_to_next_level: xpForNextLevel });
      }
      
      return { newTotalXP, level, leveledUp: level > (currentXP?.current_level || 1), previousLevel: currentXP?.current_level || 1 };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-xp'] });
      queryClient.invalidateQueries({ queryKey: ['xp-transactions'] });
      toast.success(`+${variables.amount} XP`, { description: variables.description });
      if (data.leveledUp) {
        toast.success(`Level Up! 🎉`, { description: `You've reached Level ${data.level} - ${getLevelTitle(data.level)}!`, duration: 5000 });
      }
    },
  });
}

export function useAwardBadge() {
  const queryClient = useQueryClient();
  const { data: profile } = useClientProfile();
  const awardXP = useAwardXP();
  
  return useMutation({
    mutationFn: async ({ badgeId, sourceData }: { badgeId: string; sourceData?: Record<string, any>; }) => {
      if (!profile?.id) throw new Error('No client profile');
      
      const { data: existing } = await supabase.from('client_badges').select('id').eq('client_id', profile.id).eq('badge_id', badgeId).maybeSingle();
      if (existing) return { alreadyEarned: true };
      
      const { data: badge } = await supabase.from('badges').select('*').eq('id', badgeId).single();
      await supabase.from('client_badges').insert({ client_id: profile.id, badge_id: badgeId, source_data: sourceData || null });
      
      return { badge: badge as Badge, alreadyEarned: false };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['client-badges'] });
      if (!data.alreadyEarned && data.badge) {
        toast.success(`Badge Earned! ${data.badge.icon}`, { description: `${data.badge.name} - ${data.badge.description}`, duration: 5000 });
        if (data.badge.xp_reward > 0) {
          awardXP.mutate({ amount: data.badge.xp_reward, source: 'badge_earned', description: `Earned "${data.badge.name}" badge`, sourceId: data.badge.id });
        }
      }
    },
  });
}
