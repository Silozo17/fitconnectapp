/**
 * Lightweight confetti animation utility
 * Works across web, PWA, and Despia mobile app
 * 
 * Uses canvas-confetti (~3KB gzipped) with lazy loading
 * Auto-cleans after animation completes
 * Non-blocking - doesn't prevent user interaction
 */

export type ConfettiType = 'burst' | 'shower' | 'fireworks';

export interface ConfettiOptions {
  type?: ConfettiType;
  duration?: number; // 1000-2000ms (default: 1500)
  particleCount?: number;
  colors?: string[];
}

// Preset configurations for common celebration events
export const confettiPresets = {
  achievement: { type: 'burst' as ConfettiType, particleCount: 100, duration: 1500 },
  levelUp: { type: 'fireworks' as ConfettiType, particleCount: 150, duration: 2000 },
  challengeComplete: { type: 'shower' as ConfettiType, particleCount: 80, duration: 1500 },
  badgeEarned: { type: 'burst' as ConfettiType, particleCount: 80, duration: 1200 },
  challengeJoin: { type: 'burst' as ConfettiType, particleCount: 50, duration: 1000 },
};

// Check if user prefers reduced motion
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Lazy load canvas-confetti to minimize bundle impact
let confettiModule: typeof import('canvas-confetti') | null = null;

const loadConfetti = async () => {
  if (!confettiModule) {
    confettiModule = await import('canvas-confetti');
  }
  return confettiModule.default;
};

// Default brand colors for confetti
const defaultColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

/**
 * Triggers a full-screen confetti animation
 * Auto-cleans after animation completes
 */
export const triggerConfetti = async (options: ConfettiOptions = {}): Promise<void> => {
  // Respect accessibility preferences
  if (prefersReducedMotion()) {
    return;
  }

  const {
    type = 'burst',
    duration = 1500,
    particleCount = 100,
    colors = defaultColors,
  } = options;

  try {
    const confetti = await loadConfetti();

    switch (type) {
      case 'burst':
        // Single explosion from center
        confetti({
          particleCount,
          spread: 70,
          origin: { y: 0.6 },
          colors,
          disableForReducedMotion: true,
        });
        break;

      case 'shower':
        // Falling from top
        const end = Date.now() + duration;
        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors,
            disableForReducedMotion: true,
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors,
            disableForReducedMotion: true,
          });
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
        break;

      case 'fireworks':
        // Multiple bursts in sequence
        const burstCount = 3;
        const interval = duration / burstCount;
        
        for (let i = 0; i < burstCount; i++) {
          setTimeout(() => {
            confetti({
              particleCount: particleCount / burstCount,
              spread: 60,
              origin: { 
                x: 0.3 + Math.random() * 0.4,
                y: 0.5 + Math.random() * 0.2 
              },
              colors,
              disableForReducedMotion: true,
            });
          }, i * interval);
        }
        break;
    }
  } catch (error) {
    // Silently fail - confetti is non-critical
    console.warn('Confetti animation failed:', error);
  }
};

/**
 * Convenience methods for common celebration types
 */
export const confetti = {
  burst: (options?: Partial<ConfettiOptions>) => 
    triggerConfetti({ ...confettiPresets.achievement, ...options, type: 'burst' }),
  
  shower: (options?: Partial<ConfettiOptions>) => 
    triggerConfetti({ ...confettiPresets.challengeComplete, ...options, type: 'shower' }),
  
  fireworks: (options?: Partial<ConfettiOptions>) => 
    triggerConfetti({ ...confettiPresets.levelUp, ...options, type: 'fireworks' }),
};
