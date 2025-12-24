import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "fitconnect_last_route";

export const useRouteRestoration = () => {
  const location = useLocation();

  // Save current route on navigation (only dashboard routes)
  useEffect(() => {
    const pathname = location.pathname;
    
    // Only save dashboard routes for restoration
    if (pathname.startsWith("/dashboard")) {
      try {
        localStorage.setItem(STORAGE_KEY, pathname);
      } catch {
        // Ignore storage errors (e.g., private browsing)
      }
    }
  }, [location.pathname]);
};

export const getLastRoute = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const clearLastRoute = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
};
