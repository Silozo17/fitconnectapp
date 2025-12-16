import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLogAdminAction } from './useAuditLog';
import type { Avatar } from './useAvatars';

export interface UserAvatarWithDetails {
  id: string;
  user_id: string;
  avatar_id: string;
  unlocked_at: string;
  unlock_source: string;
  avatar: Avatar;
}

// Fetch all avatars for admin view (including inactive)
export function useAllAvatars() {
  return useQuery({
    queryKey: ['admin-avatars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('avatars')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data as Avatar[];
    },
  });
}

// Fetch a specific user's unlocked avatars (admin view)
export function useUserAvatars(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin-user-avatars', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_avatars')
        .select('*, avatar:avatars(*)')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data as UserAvatarWithDetails[];
    },
    enabled: !!userId,
  });
}

// Fetch user's selected avatar ID from profile
export function useUserSelectedAvatar(userId: string | undefined, profileType: 'client' | 'coach') {
  return useQuery({
    queryKey: ['admin-user-selected-avatar', userId, profileType],
    queryFn: async () => {
      if (!userId) return null;
      
      const table = profileType === 'client' ? 'client_profiles' : 'coach_profiles';
      const { data, error } = await supabase
        .from(table)
        .select('selected_avatar_id, avatar:avatars(*)')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// Admin grants avatar to user
export function useGrantAvatar() {
  const queryClient = useQueryClient();
  const logAction = useLogAdminAction();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      avatarId, 
      reason 
    }: { 
      userId: string; 
      avatarId: string; 
      reason?: string;
    }) => {
      const { data, error } = await supabase
        .from('user_avatars')
        .insert({
          user_id: userId,
          avatar_id: avatarId,
          unlock_source: 'admin_grant',
        })
        .select('*, avatar:avatars(*)')
        .single();
      
      if (error) {
        if (error.message.includes('duplicate')) {
          throw new Error('User already has this avatar');
        }
        throw error;
      }
      
      return { data, reason };
    },
    onSuccess: ({ data, reason }, { userId, avatarId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-avatars', userId] });
      
      logAction.mutate({
        action: 'GRANT_AVATAR',
        entityType: 'user_avatars',
        entityId: data.id,
        newValues: { 
          user_id: userId, 
          avatar_id: avatarId, 
          avatar_name: data.avatar?.name,
          reason 
        },
      });
      
      toast.success(`Avatar "${data.avatar?.name}" granted successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to grant avatar');
    },
  });
}

// Admin revokes avatar from user
export function useRevokeAvatar() {
  const queryClient = useQueryClient();
  const logAction = useLogAdminAction();
  
  return useMutation({
    mutationFn: async ({ 
      userAvatarId, 
      userId,
      avatarName,
      reason 
    }: { 
      userAvatarId: string; 
      userId: string;
      avatarName: string;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from('user_avatars')
        .delete()
        .eq('id', userAvatarId);
      
      if (error) throw error;
      
      return { userAvatarId, userId, avatarName, reason };
    },
    onSuccess: ({ userAvatarId, userId, avatarName, reason }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-avatars', userId] });
      
      logAction.mutate({
        action: 'REVOKE_AVATAR',
        entityType: 'user_avatars',
        entityId: userAvatarId,
        oldValues: { 
          user_id: userId, 
          avatar_name: avatarName,
          reason 
        },
      });
      
      toast.success(`Avatar "${avatarName}" revoked`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke avatar');
    },
  });
}
