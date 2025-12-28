import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getLastRoute, useRouteRestoration } from "@/hooks/useRouteRestoration";
import { isDespia } from "@/lib/despia";

const ADMIN_ROLE_KEY = "admin_active_role";

const getDefaultDashboardForRole = (role: string): string => {
  switch (role) {
    case "admin":
    case "manager":
    case "staff":
      return "/dashboard/admin";
    case "coach":
      return "/dashboard/coach";
    default:
      return "/dashboard/client";
  }
};

const validateRouteForRole = (route: string, role: string): boolean => {
  const isAdminUser = role === "admin" || role === "manager" || role === "staff";
  const isCoach = role === "coach";
  
  if (route.startsWith("/dashboard/admin")) {
    return isAdminUser;
  }
  if (route.startsWith("/dashboard/coach")) {
    return isAdminUser || isCoach;
  }
  if (route.startsWith("/dashboard/client")) {
    // Admins, coaches, and clients can all access client dashboard
    return true;
  }
  return false;
};

const syncViewModeToStorage = (route: string) => {
  const viewModeFromPath = route.match(/^\/dashboard\/(admin|coach|client)/)?.[1];
  if (viewModeFromPath) {
    localStorage.setItem(ADMIN_ROLE_KEY, JSON.stringify({ type: viewModeFromPath, profileId: null }));
  }
};

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
      const lastRoute = getLastRoute();
      const currentPath = location.pathname;
      const isNativeApp = isDespia();

      // Paths that should trigger restoration
      // Now also includes /dashboard (the redirect page) for native apps
      const shouldRestore = isNativeApp
        ? currentPath === "/" || currentPath === "/auth" || currentPath === "/get-started" || currentPath === "/dashboard"
        : currentPath === "/auth" || currentPath === "/get-started";

      if (lastRoute && shouldRestore && lastRoute !== currentPath) {
        // Use the new validation that supports multi-role users
        if (validateRouteForRole(lastRoute, role)) {
          syncViewModeToStorage(lastRoute);
          navigate(lastRoute, { replace: true });
        } else if (isNativeApp) {
          // Invalid saved route in native app - go to default dashboard
          const defaultDashboard = getDefaultDashboardForRole(role);
          syncViewModeToStorage(defaultDashboard);
          navigate(defaultDashboard, { replace: true });
        }
      } else if (isNativeApp && (currentPath === "/" || currentPath === "/dashboard") && !lastRoute) {
        // No saved route but authenticated in native app - check for saved view preference
        try {
          const savedRole = localStorage.getItem(ADMIN_ROLE_KEY);
          if (savedRole) {
            const { type } = JSON.parse(savedRole);
            const preferredRoute = `/dashboard/${type}`;
            if (validateRouteForRole(preferredRoute, role)) {
              navigate(preferredRoute, { replace: true });
              hasRestored.current = true;
              return;
            }
          }
        } catch {
          // Invalid saved role, fall through to default
        }
        
        // Fall back to default dashboard
        const defaultDashboard = getDefaultDashboardForRole(role);
        syncViewModeToStorage(defaultDashboard);
        navigate(defaultDashboard, { replace: true });
      }

      hasRestored.current = true;
    }
  }, [user, role, loading, navigate, location.pathname]);

  return null;
};

export default RouteRestorer;
