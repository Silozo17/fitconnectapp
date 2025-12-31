import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ACTIVITY_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to periodically update session activity (last_seen_at)
 * Only runs when user is authenticated
 */
export const useSessionActivity = () => {
  const { user, session } = useAuth();
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
      
      // Debounce: don't update if we just updated
      if (now - lastUpdateRef.current < 60000) {
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
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
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
