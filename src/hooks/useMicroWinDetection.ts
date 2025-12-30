import { useEffect, useRef } from 'react';
import { triggerConfetti, confettiPresets } from '@/lib/confetti';
import { triggerHaptic } from '@/lib/despia';

/**
 * Detects and celebrates micro-wins. Simplified version - triggers on dashboard mount.
 */
export function useMicroWinDetection() {
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    // Check session storage for today's celebrations
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `microwin-welcomed-${today}`;
    
    if (!sessionStorage.getItem(storageKey)) {
      sessionStorage.setItem(storageKey, 'true');
      // Subtle welcome confetti on first dashboard visit of the day
      setTimeout(() => {
        triggerConfetti(confettiPresets.subtle);
        triggerHaptic('light');
      }, 2000);
    }
  }, []);

  return { isLoading: false };
}
