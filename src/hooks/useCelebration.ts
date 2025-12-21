import { useCallback } from 'react';
import { triggerConfetti, confettiPresets, ConfettiOptions } from '@/lib/confetti';
import { triggerHaptic } from '@/lib/despia';

/**
 * React hook for triggering celebration animations
 * Combines confetti with haptic feedback for native apps
 * 
 * Usage:
 * const { celebrate, onBadgeEarned, onLevelUp } = useCelebration();
 * onBadgeEarned(); // Triggers confetti + haptic
 */
export const useCelebration = () => {
  /**
   * Generic celebration trigger
   * Combines confetti animation with haptic feedback
   */
  const celebrate = useCallback(async (options?: ConfettiOptions) => {
    // Trigger haptic feedback for native app
    triggerHaptic('success');
    
    // Trigger confetti animation
    await triggerConfetti(options);
  }, []);

  /**
   * Celebration for earning a badge
   */
  const onBadgeEarned = useCallback(async () => {
    triggerHaptic('success');
    await triggerConfetti(confettiPresets.badgeEarned);
  }, []);

  /**
   * Celebration for leveling up
   */
  const onLevelUp = useCallback(async () => {
    triggerHaptic('success');
    await triggerConfetti(confettiPresets.levelUp);
  }, []);

  /**
   * Celebration for completing a challenge
   */
  const onChallengeCompleted = useCallback(async () => {
    triggerHaptic('success');
    await triggerConfetti(confettiPresets.challengeComplete);
  }, []);

  /**
   * Celebration for general achievements
   */
  const onAchievement = useCallback(async () => {
    triggerHaptic('success');
    await triggerConfetti(confettiPresets.achievement);
  }, []);

  return {
    // Generic celebration
    celebrate,
    
    // Event-specific celebrations (confetti + haptics)
    onBadgeEarned,
    onLevelUp,
    onChallengeCompleted,
    onAchievement,
    
    // Direct confetti access (no haptics)
    triggerConfetti,
  };
};

export default useCelebration;
