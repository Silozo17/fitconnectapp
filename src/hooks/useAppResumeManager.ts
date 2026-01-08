/**
 * Simplified App Resume Manager
 * 
 * Handles app resume/visibility events with a simple debounced approach.
 * Includes native app route protection on resume.
 * 
 * The old system had 300+ lines for something that React Query 
 * and Supabase handle automatically.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isDespia } from '@/lib/despia';
import { getBestDashboardRoute, getSavedViewState } from '@/lib/view-restoration';

const RESUME_DEBOUNCE_MS = 2000;

/**
 * Routes that are considered "public" website pages
 * Native app users should never land on these after resume
 */
const PUBLIC_ROUTES = ['/', '/coaches', '/about', '/faq', '/pricing', '/for-coaches', 
  '/how-it-works', '/success-stories', '/contact', '/community', '/marketplace', 
  '/blog', '/install', '/trust-and-verification'];

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_ROUTES.some(route => 
    route !== '/' && (pathname === route || pathname.startsWith(route + '/'))
  );
}

/**
 * Simple app resume hook - handles visibility changes
 * 
 * What it does:
 * 1. Starts Supabase auto-refresh on visibility
 * 2. Invalidates stale React Query data
 * 3. Redirects native app users away from public pages on resume
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

    // Native app route protection on resume
    if (isDespia() && isPublicRoute(window.location.pathname)) {
      // Check if user is authenticated via session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // User is authenticated but on a public page - redirect to dashboard
          const savedRoute = getSavedViewState()?.route;
          const targetRoute = savedRoute || getBestDashboardRoute(null);
          window.location.replace(targetRoute);
        } else {
          // Not authenticated - redirect to get-started
          window.location.replace('/get-started');
        }
      });
    }
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
