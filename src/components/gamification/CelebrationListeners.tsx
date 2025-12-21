import { useChallengeCompletionListener } from '@/hooks/useChallengeCompletionListener';

/**
 * Component that sets up celebration listeners.
 * Must be used within AuthProvider and CelebrationProvider.
 */
export function CelebrationListeners() {
  // Listen for challenge completions
  useChallengeCompletionListener();
  
  return null;
}
