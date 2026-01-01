import { useState, useEffect } from 'react';

/**
 * Hook that defers component mounting until after initial render.
 * Useful for non-critical components that shouldn't block first paint.
 * 
 * @param delayMs - Delay in milliseconds (0 = next frame, >0 = setTimeout)
 * @returns boolean - true when component should mount
 */
export function useDeferredMount(delayMs: number = 0): boolean {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (delayMs === 0) {
      // Use requestIdleCallback for 0 delay (best for non-critical UI)
      if ('requestIdleCallback' in window) {
        const id = requestIdleCallback(() => setShouldMount(true), { timeout: 100 });
        return () => cancelIdleCallback(id);
      } else {
        // Fallback for Safari
        const id = requestAnimationFrame(() => setShouldMount(true));
        return () => cancelAnimationFrame(id);
      }
    } else {
      const timer = setTimeout(() => setShouldMount(true), delayMs);
      return () => clearTimeout(timer);
    }
  }, [delayMs]);

  return shouldMount;
}

/**
 * Hook that defers mounting until after hydration is complete.
 * Signals to the app shell that React has mounted.
 */
export function useHydrationComplete(): void {
  useEffect(() => {
    // Signal to hide the app shell skeleton
    if (typeof window !== 'undefined' && window.__hideAppShell) {
      window.__hideAppShell();
    }
  }, []);
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __hideAppShell?: () => void;
  }
}
