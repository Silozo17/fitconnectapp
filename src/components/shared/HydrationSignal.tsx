import { useEffect } from 'react';

/**
 * Signals that React has hydrated and the app shell can be hidden.
 * Place this component early in the render tree.
 */
export function HydrationSignal() {
  useEffect(() => {
    // Hide the static app shell skeleton
    if (typeof window !== 'undefined' && window.__hideAppShell) {
      window.__hideAppShell();
    }
  }, []);

  return null;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __hideAppShell?: () => void;
  }
}
