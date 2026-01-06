import { useEffect } from 'react';

/**
 * Signals that React has hydrated and the app shell can be hidden.
 * Place this component early in the render tree.
 * 
 * Includes a small delay to ensure React has fully mounted and 
 * the first meaningful content is visible before hiding the HTML loader.
 */
export function HydrationSignal() {
  useEffect(() => {
    // Delay hiding the app shell to ensure React content is fully rendered
    // This prevents a flash of black screen on Android devices
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.__hideAppShell) {
        window.__hideAppShell();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __hideAppShell?: () => void;
  }
}
