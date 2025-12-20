import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "fitconnect_last_route";

// Routes that should not be saved for restoration
const EXCLUDED_ROUTES = ["/auth", "/get-started", "/"];

export const useRouteRestoration = () => {
  const location = useLocation();

  // Save current route on navigation (excluding auth routes)
  useEffect(() => {
    const pathname = location.pathname;
    
    // Only save dashboard and meaningful routes
    if (
      pathname.startsWith("/dashboard") &&
      !EXCLUDED_ROUTES.some(route => pathname === route)
    ) {
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
