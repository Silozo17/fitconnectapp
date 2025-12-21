import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCelebration } from '@/contexts/CelebrationContext';

/**
 * Listens for challenge completion notifications and triggers celebration overlay.
 * Should be used within a component wrapped by CelebrationProvider.
 */
export function useChallengeCompletionListener() {
  const { user } = useAuth();
  const { showChallengeComplete } = useCelebration();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('challenge-completion-listener')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as {
            type: string;
            title: string;
            message: string;
            data?: {
              challenge_id?: string;
              challenge_title?: string;
              xp_earned?: number;
              badge?: {
                id: string;
                name: string;
                image_url?: string;
                rarity: string;
              };
              avatar?: {
                id: string;
                name: string;
                image_url?: string;
                rarity: string;
              };
            };
          };

          // Check if this is a challenge completion notification
          if (notification.type === 'challenge_completed' && notification.data) {
            showChallengeComplete({
              challengeTitle: notification.data.challenge_title || notification.title,
              xpEarned: notification.data.xp_earned,
              badge: notification.data.badge
                ? {
                    name: notification.data.badge.name,
                    imageUrl: notification.data.badge.image_url,
                    rarity: notification.data.badge.rarity,
                  }
                : undefined,
              avatar: notification.data.avatar
                ? {
                    name: notification.data.avatar.name,
                    imageUrl: notification.data.avatar.image_url,
                    rarity: notification.data.avatar.rarity,
                  }
                : undefined,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, showChallengeComplete]);
}
