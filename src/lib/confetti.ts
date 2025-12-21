/**
 * Lightweight confetti animation utility
 * Works across web, PWA, and Despia mobile app
 * 
 * Uses canvas-confetti (~3KB gzipped) with lazy loading
 * Auto-cleans after animation completes
 * Non-blocking - doesn't prevent user interaction
 * 
 * Safeguards:
 * - Respects prefers-reduced-motion
 * - Respects global animation settings toggle
 * - Throttles rapid successive triggers
 * - AbortController for cleanup on unmount
 */

import { shouldTriggerConfetti } from '@/contexts/AnimationSettingsContext';

export type ConfettiType = 'burst' | 'shower' | 'fireworks';

export interface ConfettiOptions {
  type?: ConfettiType;
  duration?: number; // 1000-2000ms (default: 1500)
  particleCount?: number;
  colors?: string[];
  /** Skip global settings check (use for testing) */
  force?: boolean;
}

// Preset configurations for common celebration events
// Intensity levels: subtle (first-time), medium (milestones), high (achievements), maximum (legendary)
export const confettiPresets = {
  // Intensity-based presets
  subtle: { type: 'burst' as ConfettiType, particleCount: 30, duration: 800 },
  medium: { type: 'burst' as ConfettiType, particleCount: 60, duration: 1200 },
  high: { type: 'burst' as ConfettiType, particleCount: 100, duration: 1500 },
  maximum: { type: 'fireworks' as ConfettiType, particleCount: 200, duration: 3000 },
  
  // Event-specific presets
  achievement: { type: 'burst' as ConfettiType, particleCount: 100, duration: 1500 },
  levelUp: { type: 'fireworks' as ConfettiType, particleCount: 150, duration: 2000 },
  challengeComplete: { type: 'shower' as ConfettiType, particleCount: 80, duration: 1500 },
  badgeEarned: { type: 'burst' as ConfettiType, particleCount: 80, duration: 1200 },
  challengeJoin: { type: 'burst' as ConfettiType, particleCount: 50, duration: 1000 },
  
  // Streak milestone presets
  streakWeek: { type: 'burst' as ConfettiType, particleCount: 50, duration: 1000 },
  streakMonth: { type: 'shower' as ConfettiType, particleCount: 80, duration: 1500 },
  streakLegendary: { type: 'fireworks' as ConfettiType, particleCount: 150, duration: 2500 },
  
  // First-time achievements
  firstTime: { type: 'burst' as ConfettiType, particleCount: 40, duration: 1000 },
};

// ============ SAFEGUARDS ============

// Throttling: prevent rapid-fire triggers (min 500ms between)
let lastTriggerTime = 0;
const MIN_INTERVAL_MS = 500;

// AbortController for cleanup
let currentAnimationController: AbortController | null = null;

// Check if user prefers reduced motion (system level)
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// ============ LAZY LOADING ============

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
 * Cancel any ongoing confetti animation
 * Call this on component unmount to prevent memory leaks
 */
export const cancelConfetti = (): void => {
  if (currentAnimationController) {
    currentAnimationController.abort();
    currentAnimationController = null;
  }
};

/**
 * Triggers a full-screen confetti animation
 * Auto-cleans after animation completes
 * 
 * Safeguards applied:
 * - Respects prefers-reduced-motion system setting
 * - Respects global animation settings toggle
 * - Throttles to prevent rapid successive triggers
 * - Uses AbortController for cleanup
 */
export const triggerConfetti = async (options: ConfettiOptions = {}): Promise<void> => {
  const { force = false } = options;
  
  // Safeguard 1: Check global animation settings (unless forced)
  if (!force && !shouldTriggerConfetti()) {
    return;
  }
  
  // Safeguard 2: Respect accessibility preferences
  if (prefersReducedMotion()) {
    return;
  }
  
  // Safeguard 3: Throttle rapid triggers
  const now = Date.now();
  if (now - lastTriggerTime < MIN_INTERVAL_MS) {
    return;
  }
  lastTriggerTime = now;
  
  // Safeguard 4: Cancel any ongoing animation
  cancelConfetti();
  currentAnimationController = new AbortController();
  const signal = currentAnimationController.signal;

  const {
    type = 'burst',
    duration = 1500,
    particleCount = 100,
    colors = defaultColors,
  } = options;

  try {
    const confetti = await loadConfetti();
    
    // Check if aborted while loading
    if (signal.aborted) return;

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
        // Falling from top with cleanup support
        const end = Date.now() + duration;
        const frame = () => {
          // Check abort signal each frame
          if (signal.aborted) return;
          
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
          if (Date.now() < end && !signal.aborted) {
            requestAnimationFrame(frame);
          }
        };
        frame();
        break;

      case 'fireworks':
        // Multiple bursts in sequence with cleanup support
        const burstCount = 3;
        const interval = duration / burstCount;
        
        for (let i = 0; i < burstCount; i++) {
          if (signal.aborted) break;
          
          setTimeout(() => {
            // Check abort signal before each burst
            if (signal.aborted) return;
            
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
    if (!signal.aborted) {
      console.warn('Confetti animation failed:', error);
    }
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
