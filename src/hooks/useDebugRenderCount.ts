import { useRef, useEffect } from 'react';
import { debugLogger } from '@/lib/debug-logger';

/**
 * Hook to track render counts and log high render counts as potential issues.
 * Use this in components you suspect might be causing infinite loops or excessive re-renders.
 * 
 * @param componentName - Name of the component for logging
 * @param threshold - Number of renders before warning (default: 10)
 * @returns Current render count
 */
export function useDebugRenderCount(componentName: string, threshold: number = 10): number {
  const renderCount = useRef(0);
  const hasWarned = useRef(false);
  
  // Increment on every render
  renderCount.current += 1;
  
  useEffect(() => {
    // Log mount event
    debugLogger.render(componentName, 'mount', { renderCount: renderCount.current });
    
    return () => {
      // Log unmount event with final render count
      debugLogger.render(componentName, 'unmount', { 
        finalRenderCount: renderCount.current 
      });
    };
  }, [componentName]);
  
  // Log warning if render count exceeds threshold
  if (renderCount.current > threshold && !hasWarned.current) {
    hasWarned.current = true;
    debugLogger.error(
      `High render count: ${renderCount.current} renders`,
      new Error(`Component ${componentName} has rendered ${renderCount.current} times`),
      componentName
    );
  } else if (renderCount.current > threshold) {
    // Continue logging every 10 renders after threshold
    if (renderCount.current % 10 === 0) {
      debugLogger.render(componentName, 'excessive_renders', { 
        renderCount: renderCount.current,
        warning: true
      });
    }
  }
  
  return renderCount.current;
}

export default useDebugRenderCount;
