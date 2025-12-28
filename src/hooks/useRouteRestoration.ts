import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveRoute } from "@/lib/view-restoration";

/**
 * Hook to track and save route changes for restoration on native app relaunch.
 * Uses the centralized view-restoration utility.
 */
export const useRouteRestoration = () => {
  const location = useLocation();

  // Save current route on navigation (only dashboard routes)
  useEffect(() => {
    const pathname = location.pathname;
    
    // Only save dashboard routes for restoration
    if (pathname.startsWith("/dashboard")) {
      saveRoute(pathname);
    }
  }, [location.pathname]);
};

// Re-export functions from centralized utility for backward compatibility
export { 
  getSavedRoute as getLastRoute,
  getSavedViewState as getLastViewMode,
  clearViewState as clearLastRoute,
} from "@/lib/view-restoration";
