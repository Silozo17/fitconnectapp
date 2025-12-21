import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CelebrationOverlay, CelebrationData, CelebrationType } from '@/components/gamification/CelebrationOverlay';

interface BadgeReward {
  name: string;
  imageUrl?: string;
  rarity: string;
}

interface AvatarReward {
  name: string;
  imageUrl?: string;
  rarity: string;
}

interface CelebrationContextValue {
  showChallengeComplete: (data: {
    challengeTitle: string;
    xpEarned?: number;
    badge?: BadgeReward;
    avatar?: AvatarReward;
  }) => void;
  showLevelUp: (newLevel: number, xpEarned?: number) => void;
  showBadgeEarned: (badge: BadgeReward, xpEarned?: number) => void;
  showAvatarUnlocked: (avatar: AvatarReward) => void;
  closeCelebration: () => void;
}

const CelebrationContext = createContext<CelebrationContextValue | undefined>(undefined);

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }
  return context;
}

interface CelebrationProviderProps {
  children: ReactNode;
}

export function CelebrationProvider({ children }: CelebrationProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null);

  const closeCelebration = useCallback(() => {
    setIsOpen(false);
    // Clear data after animation
    setTimeout(() => setCelebrationData(null), 300);
  }, []);

  const showChallengeComplete = useCallback(
    (data: {
      challengeTitle: string;
      xpEarned?: number;
      badge?: BadgeReward;
      avatar?: AvatarReward;
    }) => {
      setCelebrationData({
        type: 'challenge_complete',
        title: 'Challenge Completed!',
        subtitle: data.challengeTitle,
        xpEarned: data.xpEarned,
        badge: data.badge,
        avatar: data.avatar,
      });
      setIsOpen(true);
    },
    []
  );

  const showLevelUp = useCallback((newLevel: number, xpEarned?: number) => {
    setCelebrationData({
      type: 'level_up',
      title: 'Level Up!',
      subtitle: `You reached Level ${newLevel}`,
      xpEarned,
      newLevel,
    });
    setIsOpen(true);
  }, []);

  const showBadgeEarned = useCallback((badge: BadgeReward, xpEarned?: number) => {
    setCelebrationData({
      type: 'badge_earned',
      title: 'Badge Earned!',
      subtitle: badge.name,
      xpEarned,
      badge,
    });
    setIsOpen(true);
  }, []);

  const showAvatarUnlocked = useCallback((avatar: AvatarReward) => {
    setCelebrationData({
      type: 'avatar_unlocked',
      title: 'Avatar Unlocked!',
      subtitle: avatar.name,
      avatar,
    });
    setIsOpen(true);
  }, []);

  const value: CelebrationContextValue = {
    showChallengeComplete,
    showLevelUp,
    showBadgeEarned,
    showAvatarUnlocked,
    closeCelebration,
  };

  return (
    <CelebrationContext.Provider value={value}>
      {children}
      <CelebrationOverlay
        isOpen={isOpen}
        data={celebrationData}
        onClose={closeCelebration}
        autoDismissMs={5000}
      />
    </CelebrationContext.Provider>
  );
}
