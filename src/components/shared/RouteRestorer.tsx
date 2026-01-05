import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
import { useRouteRestoration } from "@/hooks/useRouteRestoration";
import { isDespia } from "@/lib/despia";
import {
  getBestDashboardRoute,
  getRestoredRoute,
  saveViewState,
  getViewModeFromPath,
} from "@/lib/view-restoration";

const RouteRestorer = () => {
  const { user, role, loading } = useAuth();
  const { isLoadingProfiles, activeProfileType } = useAdminView();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRestored = useRef(false);
  const navigationInProgress = useRef(false);

  // Track route changes for future restoration
  useRouteRestoration();

  // Handle route restoration for authenticated users
  useEffect(() => {
    // CRITICAL: Wait for BOTH auth AND AdminContext to be fully ready
    if (loading || isLoadingProfiles || hasRestored.current || navigationInProgress.current) return;

    // Only restore for authenticated users
    if (user && role) {
      const currentPath = location.pathname;
      const isNativeApp = isDespia();

      // Check if current path already matches the active profile type
      // This prevents redundant navigation that could cause flicker
      const currentViewMode = getViewModeFromPath(currentPath);
      if (currentViewMode === activeProfileType) {
        hasRestored.current = true;
        return;
      }

      // Paths that should trigger restoration - CONSOLIDATED logic
      // Native app: restore from /, /auth, /get-started, /dashboard
      // Web: also restore from / to prevent authenticated users seeing landing page
      const shouldRestore = isNativeApp
        ? currentPath === "/" || currentPath === "/auth" || currentPath === "/get-started" || currentPath === "/dashboard"
        : currentPath === "/" || currentPath === "/auth" || currentPath === "/get-started";

      if (shouldRestore) {
        // Use centralized restoration logic
        const restoredRoute = getRestoredRoute(role);
        
        if (restoredRoute && restoredRoute !== currentPath) {
          navigationInProgress.current = true;
          // Sync view state before navigating
          const viewMode = getViewModeFromPath(restoredRoute);
          if (viewMode) {
            saveViewState(viewMode);
          }
          // Defer navigation to next frame to prevent race conditions
          requestAnimationFrame(() => {
            navigate(restoredRoute, { replace: true });
            navigationInProgress.current = false;
          });
        } else if (isNativeApp && !restoredRoute) {
          // No saved route but authenticated in native app - go to best dashboard
          const defaultRoute = getBestDashboardRoute(role);
          navigationInProgress.current = true;
          const viewMode = getViewModeFromPath(defaultRoute);
          if (viewMode) {
            saveViewState(viewMode);
          }
          requestAnimationFrame(() => {
            navigate(defaultRoute, { replace: true });
            navigationInProgress.current = false;
          });
        }
      }

      hasRestored.current = true;
    }
  }, [user, role, loading, isLoadingProfiles, activeProfileType, navigate, location.pathname]);

  return null;
};

export default RouteRestorer;
