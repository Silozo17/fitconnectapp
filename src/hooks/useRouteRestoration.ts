import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "fitconnect_last_route";
const COLD_START_KEY = "fitconnect_cold_start";

export const useRouteRestoration = () => {
  const location = useLocation();

  // Mark navigation has occurred (no longer cold start)
  useEffect(() => {
    // After first navigation, mark as not a cold start
    const timer = setTimeout(() => {
      sessionStorage.setItem(COLD_START_KEY, "false");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Save current route on navigation (only dashboard routes)
  useEffect(() => {
    const pathname = location.pathname;
    
    // Only save dashboard routes for restoration
    if (pathname.startsWith("/dashboard")) {
      try {
        sessionStorage.setItem(STORAGE_KEY, pathname);
      } catch {
        // Ignore storage errors (e.g., private browsing)
      }
    }
  }, [location.pathname]);
};

export const getLastRoute = (): string | null => {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const clearLastRoute = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
};

// Check if this is a cold start (fresh page load, not in-app navigation)
export const isColdStart = (): boolean => {
  try {
    return sessionStorage.getItem(COLD_START_KEY) !== "false";
  } catch {
    return true;
  }
};

// Mark cold start as complete
export const markColdStartComplete = () => {
  try {
    sessionStorage.setItem(COLD_START_KEY, "false");
  } catch {
    // Ignore storage errors
  }
};
