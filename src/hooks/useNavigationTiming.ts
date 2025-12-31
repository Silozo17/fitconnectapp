import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { perfLogger } from '@/lib/performance-logger';

/**
 * Hook to track navigation timing between routes
 * Only active when VITE_PERF_DEBUG=true
 */
export function useNavigationTiming() {
  const location = useLocation();
  const previousPathRef = useRef<string | null>(null);
  const navigationStartRef = useRef<number>(0);

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;
    
    // Skip first render (no previous path)
    if (previousPath !== null && previousPath !== currentPath) {
      const duration = performance.now() - navigationStartRef.current;
      perfLogger.logNavigation(previousPath, currentPath, duration);
    }
    
    // Update refs for next navigation
    previousPathRef.current = currentPath;
    navigationStartRef.current = performance.now();
  }, [location.pathname]);
}
