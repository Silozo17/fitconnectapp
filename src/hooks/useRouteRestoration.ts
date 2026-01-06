import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveRoute, getSavedViewState, clearViewState } from "@/lib/view-restoration";

/**
 * Hook to track and save route changes for restoration on native app relaunch.
 */
export const useRouteRestoration = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/dashboard")) {
      saveRoute(location.pathname);
    }
  }, [location.pathname]);
};

// Re-exports for backward compatibility
export const getLastRoute = () => getSavedViewState()?.route ?? null;
export const getLastViewMode = () => getSavedViewState();
export const clearLastRoute = clearViewState;
