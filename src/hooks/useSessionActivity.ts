import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSafe } from "@/contexts/AuthContext";
import { isDespia } from "@/lib/despia";

// OPTIMIZED: Increased intervals to reduce edge function calls and improve native performance
const ACTIVITY_UPDATE_INTERVAL = 10 * 60 * 1000; // 10 minutes (was 5)
// Minimum time between updates (debounce)
const MIN_UPDATE_INTERVAL = 60000; // 1 minute
// Extra debounce for native apps - longer to reduce API calls
const NATIVE_DEBOUNCE = 5 * 60 * 1000; // 5 minutes (was 2)

/**
 * Hook to periodically update session activity (last_seen_at)
 * Only runs when user is authenticated
 * OPTIMIZED: Reduced frequency for native apps to improve performance
 */
export const useSessionActivity = () => {
  const auth = useAuthSafe();
  const user = auth?.user;
  const session = auth?.session;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!user || !session) {
      // Clear interval if user is not authenticated
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const updateActivity = async () => {
      const now = Date.now();
      
      // OPTIMIZED: Longer debounce for native apps to reduce API calls
      const minInterval = isDespia() ? NATIVE_DEBOUNCE : MIN_UPDATE_INTERVAL;
      
      // Debounce: don't update if we just updated
      if (now - lastUpdateRef.current < minInterval) {
        return;
      }
      
      // Validate session is still fresh before calling edge function
      // This prevents 401 errors on cold start when session might be stale
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      if (!freshSession?.access_token) {
        console.debug("[SessionActivity] Skipping - no valid session");
        return;
      }
      
      lastUpdateRef.current = now;

      try {
        await supabase.functions.invoke("track-session", {
          body: {
            isUpdate: true,
            userAgent: navigator.userAgent,
          },
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience for activity tracking
        console.debug("[SessionActivity] Update failed:", error);
      }
    };

    // Initial update when session starts
    updateActivity();

    // Set up periodic updates
    intervalRef.current = setInterval(updateActivity, ACTIVITY_UPDATE_INTERVAL);

    // Update on visibility change (when user returns to tab)
    // OPTIMIZED: Only for web, not native (native uses focus handler with debounce)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isDespia()) {
        updateActivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, session]);
};
