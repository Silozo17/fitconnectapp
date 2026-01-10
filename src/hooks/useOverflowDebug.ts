import { useEffect, useRef } from 'react';
import { 
  findOverflowingElements, 
  logOverflowReport, 
  highlightOffenders 
} from '@/lib/overflow-debug';

interface UseOverflowDebugOptions {
  enabled?: boolean;
  selector?: string;
  highlightEnabled?: boolean;
  delays?: number[];
}

/**
 * Development-only hook to detect and log horizontal overflow issues.
 * 
 * Usage:
 *   useOverflowDebug({ enabled: true });
 * 
 * Or with URL param:
 *   Add ?debugOverflow=1 to the URL
 */
export function useOverflowDebug(options: UseOverflowDebugOptions = {}): void {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Only run in development
    if (!import.meta.env.DEV) return;

    // Check if enabled via options or URL param
    const urlEnabled = new URLSearchParams(window.location.search).get('debugOverflow') === '1';
    const isEnabled = options.enabled ?? urlEnabled;

    if (!isEnabled) return;

    const { 
      selector = 'body', 
      highlightEnabled = true,
      delays = [100, 500, 2000, 5000] // Check at multiple intervals to catch carousel/animation
    } = options;

    const runDetection = () => {
      // Clean up previous highlights
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      const root = document.querySelector(selector) || document.documentElement;
      const offenders = findOverflowingElements(root);
      logOverflowReport(offenders);

      if (highlightEnabled && offenders.length > 0) {
        cleanupRef.current = highlightOffenders(offenders);
      }
    };

    // Run immediately
    runDetection();

    // Run at specified delays to catch async layout changes
    const timeouts = delays.map(delay => 
      setTimeout(runDetection, delay)
    );

    // Run on resize
    const handleResize = () => {
      runDetection();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      timeouts.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [options.enabled, options.selector, options.highlightEnabled]);
}
