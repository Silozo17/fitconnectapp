import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CelebrationOverlay, CelebrationData, CelebrationType } from '@/components/gamification/CelebrationOverlay';
import { triggerConfetti, confettiPresets } from '@/lib/confetti';
import { triggerHaptic } from '@/lib/despia';

export interface BadgeReward {
  name: string;
  imageUrl?: string;
  rarity: string;
}

export interface AvatarReward {
  name: string;
  imageUrl?: string;
  rarity: string;
}

export type StreakMilestone = 7 | 30 | 100;
export type FirstTimeAchievementType = 'first_workout' | 'first_habit' | 'first_photo' | 'first_connection';

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
  showStreakMilestone: (days: StreakMilestone, habitName: string) => void;
  showFirstTimeAchievement: (type: FirstTimeAchievementType) => void;
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
    triggerConfetti(confettiPresets.medium);
    triggerHaptic('success');
    setCelebrationData({
      type: 'avatar_unlocked',
      title: 'Avatar Unlocked!',
      subtitle: avatar.name,
      avatar,
    });
    setIsOpen(true);
  }, []);

  const showStreakMilestone = useCallback((days: StreakMilestone, habitName: string) => {
    // Select confetti intensity based on streak length
    const preset = days >= 100 
      ? confettiPresets.streakLegendary 
      : days >= 30 
        ? confettiPresets.streakMonth 
        : confettiPresets.streakWeek;
    
    triggerConfetti(preset);
    triggerHaptic(days >= 30 ? 'success' : 'light');
    
    const milestoneLabels: Record<StreakMilestone, string> = {
      7: '7-Day Streak!',
      30: '30-Day Streak!',
      100: '100-Day Streak!',
    };
    
    setCelebrationData({
      type: 'streak_milestone' as CelebrationType,
      title: milestoneLabels[days],
      subtitle: habitName,
    });
    setIsOpen(true);
  }, []);

  const showFirstTimeAchievement = useCallback((type: FirstTimeAchievementType) => {
    triggerConfetti(confettiPresets.firstTime);
    triggerHaptic('light');
    
    const achievementDetails: Record<FirstTimeAchievementType, { title: string; subtitle: string }> = {
      first_workout: { title: 'First Workout Logged!', subtitle: 'Your fitness journey begins' },
      first_habit: { title: 'First Habit Completed!', subtitle: 'Building healthy routines' },
      first_photo: { title: 'First Progress Photo!', subtitle: 'Tracking your transformation' },
      first_connection: { title: 'Coach Connected!', subtitle: 'Ready to reach your goals' },
    };
    
    const details = achievementDetails[type];
    setCelebrationData({
      type: 'first_time' as CelebrationType,
      title: details.title,
      subtitle: details.subtitle,
    });
    setIsOpen(true);
  }, []);

  const value: CelebrationContextValue = {
    showChallengeComplete,
    showLevelUp,
    showBadgeEarned,
    showAvatarUnlocked,
    showStreakMilestone,
    showFirstTimeAchievement,
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
