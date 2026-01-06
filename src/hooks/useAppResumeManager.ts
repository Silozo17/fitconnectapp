/**
 * Simplified App Resume Manager
 * 
 * Handles app resume/visibility events with a simple debounced approach.
 * Removed: priority system, staggered delays, handler registration.
 * 
 * The old system had 300+ lines for something that React Query 
 * and Supabase handle automatically.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const RESUME_DEBOUNCE_MS = 2000;

/**
 * Simple app resume hook - handles visibility changes
 * 
 * What it does:
 * 1. Starts Supabase auto-refresh on visibility
 * 2. Invalidates stale React Query data
 * 
 * That's it. No priority queues, no handler registration.
 */
export function useSimpleAppResume() {
  const queryClient = useQueryClient();
  const lastResumeRef = useRef(0);

  const handleResume = useCallback(() => {
    if (document.visibilityState !== 'visible') return;
    
    const now = Date.now();
    if (now - lastResumeRef.current < RESUME_DEBOUNCE_MS) return;
    lastResumeRef.current = now;

    // Start auth refresh
    supabase.auth.startAutoRefresh();
    
    // Invalidate stale queries (React Query will refetch as needed)
    queryClient.invalidateQueries({ 
      predicate: (query) => query.isStale()
    });
  }, [queryClient]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleResume);
    return () => document.removeEventListener('visibilitychange', handleResume);
  }, [handleResume]);
}

// Legacy delays - still used by some hooks during resume
export const BACKGROUND_DELAYS = {
  subscription: 3000,
  boost: 4000,
  wearable: 5000,
  sessionActivity: 6000,
} as const;

/**
 * @deprecated Use useSimpleAppResume instead. This is a no-op for backward compatibility.
 */
export function useAppResumeManager() {
  return {
    registerHandler: () => {},
    unregisterHandler: () => {},
  };
}
