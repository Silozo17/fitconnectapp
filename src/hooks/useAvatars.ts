import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Avatar {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  category: 'free' | 'challenge_unlock' | 'coach_exclusive';
  unlock_type: string | null;
  unlock_threshold: number | null;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  sort_order: number;
  is_active: boolean;
}

export interface UserAvatar {
  id: string;
  user_id: string;
  avatar_id: string;
  unlocked_at: string;
  unlock_source: string;
}

// Fetch all active avatars
export function useAvatars() {
  return useQuery({
    queryKey: ['avatars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('avatars')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as Avatar[];
    },
  });
}

// Fetch user's unlocked avatars
export function useUnlockedAvatars() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['unlocked-avatars', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_avatars')
        .select('*, avatar:avatars(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as (UserAvatar & { avatar: Avatar })[];
    },
    enabled: !!user?.id,
  });
}

// Get user's selected avatar
export function useSelectedAvatar(profileType: 'client' | 'coach') {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['selected-avatar', user?.id, profileType],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const table = profileType === 'client' ? 'client_profiles' : 'coach_profiles';
      const { data, error } = await supabase
        .from(table)
        .select('selected_avatar_id, avatar:avatars(*)')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data?.avatar as Avatar | null;
    },
    enabled: !!user?.id,
  });
}

// Select an avatar
export function useSelectAvatar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ avatarId, profileType }: { avatarId: string | null; profileType: 'client' | 'coach' }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const table = profileType === 'client' ? 'client_profiles' : 'coach_profiles';
      const { error } = await supabase
        .from(table)
        .update({ selected_avatar_id: avatarId })
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: (_, { profileType }) => {
      queryClient.invalidateQueries({ queryKey: ['selected-avatar'] });
      queryClient.invalidateQueries({ queryKey: [profileType === 'client' ? 'client-profile' : 'coach-profile'] });
      toast.success('Avatar updated!');
    },
    onError: (error) => {
      toast.error('Failed to update avatar');
      console.error(error);
    },
  });
}

// Unlock an avatar for user
export function useUnlockAvatar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ avatarId, source }: { avatarId: string; source: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_avatars')
        .insert({
          user_id: user.id,
          avatar_id: avatarId,
          unlock_source: source,
        });
      
      if (error && !error.message.includes('duplicate')) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unlocked-avatars'] });
    },
  });
}

// Check and unlock avatars based on user stats
export function useCheckAvatarUnlocks() {
  const { user } = useAuth();
  const unlockAvatar = useUnlockAvatar();
  const { data: avatars } = useAvatars();
  const { data: unlockedAvatars } = useUnlockedAvatars();
  
  return useMutation({
    mutationFn: async (stats: {
      workoutCount?: number;
      habitStreak?: number;
      progressEntries?: number;
      progressPhotos?: number;
      macroDays?: number;
      xpTotal?: number;
      leaderboardRank?: number;
      challengesCompleted?: number;
      isCoach?: boolean;
    }) => {
      if (!user?.id || !avatars) return [];
      
      const unlockedIds = new Set(unlockedAvatars?.map(ua => ua.avatar_id) || []);
      const newUnlocks: Avatar[] = [];
      
      for (const avatar of avatars) {
        if (unlockedIds.has(avatar.id)) continue;
        if (avatar.category === 'free') {
          // Auto-unlock free avatars
          await unlockAvatar.mutateAsync({ avatarId: avatar.id, source: 'default' });
          newUnlocks.push(avatar);
          continue;
        }
        
        let shouldUnlock = false;
        
        switch (avatar.unlock_type) {
          case 'workout_count':
            shouldUnlock = (stats.workoutCount || 0) >= (avatar.unlock_threshold || 0);
            break;
          case 'habit_streak':
            shouldUnlock = (stats.habitStreak || 0) >= (avatar.unlock_threshold || 0);
            break;
          case 'progress_entries':
            shouldUnlock = (stats.progressEntries || 0) >= (avatar.unlock_threshold || 0);
            break;
          case 'progress_photos':
            shouldUnlock = (stats.progressPhotos || 0) >= (avatar.unlock_threshold || 0);
            break;
          case 'macro_days':
            shouldUnlock = (stats.macroDays || 0) >= (avatar.unlock_threshold || 0);
            break;
          case 'xp_total':
            shouldUnlock = (stats.xpTotal || 0) >= (avatar.unlock_threshold || 0);
            break;
          case 'leaderboard_rank':
            shouldUnlock = (stats.leaderboardRank || 999) <= (avatar.unlock_threshold || 0);
            break;
          case 'challenges_completed':
            shouldUnlock = (stats.challengesCompleted || 0) >= (avatar.unlock_threshold || 0);
            break;
          case 'coach_role':
            shouldUnlock = stats.isCoach === true;
            break;
        }
        
        if (shouldUnlock) {
          await unlockAvatar.mutateAsync({ 
            avatarId: avatar.id, 
            source: avatar.unlock_type === 'coach_role' ? 'coach_role' : 'stat_unlock' 
          });
          newUnlocks.push(avatar);
        }
      }
      
      return newUnlocks;
    },
    onSuccess: (newUnlocks) => {
      newUnlocks.forEach(avatar => {
        toast.success(`🎉 Avatar Unlocked: ${avatar.name}!`, {
          description: avatar.description,
        });
      });
    },
  });
}

// Get avatar image URL from storage (handles Title_Case filenames)
export function getAvatarImageUrl(slug: string): string {
  // Convert slug to Title_Case (e.g., "strongman_bear" → "Strongman_Bear")
  const filename = slug
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('_');
  
  const { data } = supabase.storage.from('avatars').getPublicUrl(`${filename}.png`);
  return data.publicUrl;
}
