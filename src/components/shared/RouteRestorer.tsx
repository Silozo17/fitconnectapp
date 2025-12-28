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

  // Track route changes for future restoration
  useRouteRestoration();

  // Handle route restoration for authenticated users
  useEffect(() => {
    // CRITICAL: Wait for BOTH auth AND AdminContext to be fully ready
    if (loading || isLoadingProfiles || hasRestored.current) return;

    // Only restore for authenticated users
    if (user && role) {
      const currentPath = location.pathname;
      const isNativeApp = isDespia();

      // Check if current path already matches the active profile type
      // This prevents redundant navigation that could cause flicker
      const currentViewMode = getViewModeFromPath(currentPath);
      if (currentViewMode === activeProfileType) {
        console.log('[RouteRestorer] Current path already matches active profile type:', activeProfileType);
        hasRestored.current = true;
        return;
      }

      // Paths that should trigger restoration
      const shouldRestore = isNativeApp
        ? currentPath === "/" || currentPath === "/auth" || currentPath === "/get-started" || currentPath === "/dashboard"
        : currentPath === "/auth" || currentPath === "/get-started";

      if (shouldRestore) {
        // Use centralized restoration logic
        const restoredRoute = getRestoredRoute(role);
        
        if (restoredRoute && restoredRoute !== currentPath) {
          console.log('[RouteRestorer] Navigating to restored route:', restoredRoute);
          // Sync view state before navigating
          const viewMode = getViewModeFromPath(restoredRoute);
          if (viewMode) {
            saveViewState(viewMode);
          }
          navigate(restoredRoute, { replace: true });
        } else if (isNativeApp && !restoredRoute) {
          // No saved route but authenticated in native app - go to best dashboard
          const defaultRoute = getBestDashboardRoute(role);
          console.log('[RouteRestorer] No restored route, navigating to default:', defaultRoute);
          const viewMode = getViewModeFromPath(defaultRoute);
          if (viewMode) {
            saveViewState(viewMode);
          }
          navigate(defaultRoute, { replace: true });
        }
      }

      hasRestored.current = true;
    }
  }, [user, role, loading, isLoadingProfiles, activeProfileType, navigate, location.pathname]);

  return null;
};

export default RouteRestorer;
