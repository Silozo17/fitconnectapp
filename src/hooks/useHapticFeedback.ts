import { useCallback } from 'react';
import { isDespia, triggerHaptic, HapticPattern } from '@/lib/despia';

/**
 * Hook for triggering haptic feedback in the Despia native environment
 * Provides event-specific methods for consistent haptic patterns across the app
 */
export const useHapticFeedback = () => {
  const isNative = isDespia();

  // Event-specific haptic triggers
  const onMessageReceived = useCallback(() => {
    triggerHaptic('light');
  }, []);

  const onConnectionRequest = useCallback(() => {
    triggerHaptic('heavy');
  }, []);

  const onBookingReminder = useCallback(() => {
    triggerHaptic('warning');
  }, []);

  const onChallengeStarted = useCallback(() => {
    triggerHaptic('success');
  }, []);

  const onChallengeExpiring = useCallback(() => {
    triggerHaptic('warning');
  }, []);

  const onChallengeCompleted = useCallback(() => {
    triggerHaptic('success');
  }, []);

  const onAchievementEarned = useCallback(() => {
    triggerHaptic('success');
  }, []);

  const onDailyMotivation = useCallback(() => {
    triggerHaptic('light');
  }, []);

  // Direct pattern triggers
  const light = useCallback(() => triggerHaptic('light'), []);
  const heavy = useCallback(() => triggerHaptic('heavy'), []);
  const success = useCallback(() => triggerHaptic('success'), []);
  const warning = useCallback(() => triggerHaptic('warning'), []);
  const error = useCallback(() => triggerHaptic('error'), []);

  // Generic trigger for custom patterns
  const trigger = useCallback((pattern: HapticPattern) => {
    triggerHaptic(pattern);
  }, []);

  return {
    isNative,
    // Event-specific haptics
    onMessageReceived,
    onConnectionRequest,
    onBookingReminder,
    onChallengeStarted,
    onChallengeExpiring,
    onChallengeCompleted,
    onAchievementEarned,
    onDailyMotivation,
    // Direct patterns
    light,
    heavy,
    success,
    warning,
    error,
    trigger,
  };
};

export default useHapticFeedback;
