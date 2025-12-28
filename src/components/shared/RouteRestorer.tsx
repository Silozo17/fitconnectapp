import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRouteRestoration } from "@/hooks/useRouteRestoration";
import { isDespia } from "@/lib/despia";
import {
  getBestDashboardRoute,
  getRestoredRoute,
  validateRouteForRole,
  saveViewState,
  getViewModeFromPath,
} from "@/lib/view-restoration";

const RouteRestorer = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRestored = useRef(false);

  // Track route changes for future restoration
  useRouteRestoration();

  // Handle route restoration for authenticated users
  useEffect(() => {
    // Only run once, when auth finishes loading
    if (loading || hasRestored.current) return;

    // Only restore for authenticated users
    if (user && role) {
      const currentPath = location.pathname;
      const isNativeApp = isDespia();

      // Paths that should trigger restoration
      const shouldRestore = isNativeApp
        ? currentPath === "/" || currentPath === "/auth" || currentPath === "/get-started" || currentPath === "/dashboard"
        : currentPath === "/auth" || currentPath === "/get-started";

      if (shouldRestore) {
        // Use centralized restoration logic
        const restoredRoute = getRestoredRoute(role);
        
        if (restoredRoute && restoredRoute !== currentPath) {
          // Sync view state before navigating
          const viewMode = getViewModeFromPath(restoredRoute);
          if (viewMode) {
            saveViewState(viewMode);
          }
          navigate(restoredRoute, { replace: true });
        } else if (isNativeApp && !restoredRoute) {
          // No saved route but authenticated in native app - go to best dashboard
          const defaultRoute = getBestDashboardRoute(role);
          const viewMode = getViewModeFromPath(defaultRoute);
          if (viewMode) {
            saveViewState(viewMode);
          }
          navigate(defaultRoute, { replace: true });
        }
      }

      hasRestored.current = true;
    }
  }, [user, role, loading, navigate, location.pathname]);

  return null;
};

export default RouteRestorer;
