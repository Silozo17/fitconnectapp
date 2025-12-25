import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getLastRoute, useRouteRestoration } from "@/hooks/useRouteRestoration";
import { isDespia } from "@/lib/despia";

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

      // In native app (Despia), always try to restore from homepage or auth pages
      // In web browser, only restore from /auth or /get-started pages
      const shouldRestore = isNativeApp
        ? currentPath === "/" || currentPath === "/auth" || currentPath === "/get-started"
        : currentPath === "/auth" || currentPath === "/get-started";

      if (lastRoute && shouldRestore && lastRoute !== currentPath) {
        // Verify the saved route matches the user's role
        const isValidRoute =
          (lastRoute.startsWith("/dashboard/admin") && (role === "admin" || role === "manager" || role === "staff")) ||
          (lastRoute.startsWith("/dashboard/coach") && role === "coach") ||
          (lastRoute.startsWith("/dashboard/client") && (role === "client" || role === "coach"));

        if (isValidRoute) {
          // Sync admin_active_role localStorage with the restored route
          const viewModeFromPath = lastRoute.match(/^\/dashboard\/(admin|coach|client)/)?.[1];
          if (viewModeFromPath) {
            localStorage.setItem("admin_active_role", JSON.stringify({ type: viewModeFromPath, profileId: null }));
          }
          navigate(lastRoute, { replace: true });
        } else if (isNativeApp) {
          // Invalid saved route in native app - go to default dashboard
          const defaultDashboard = getDefaultDashboardForRole(role);
          const viewModeFromDefault = defaultDashboard.match(/^\/dashboard\/(admin|coach|client)/)?.[1];
          if (viewModeFromDefault) {
            localStorage.setItem("admin_active_role", JSON.stringify({ type: viewModeFromDefault, profileId: null }));
          }
          navigate(defaultDashboard, { replace: true });
        }
      } else if (isNativeApp && currentPath === "/" && !lastRoute) {
        // No saved route but authenticated in native app - go to dashboard
        const defaultDashboard = getDefaultDashboardForRole(role);
        const viewModeFromDefault = defaultDashboard.match(/^\/dashboard\/(admin|coach|client)/)?.[1];
        if (viewModeFromDefault) {
          localStorage.setItem("admin_active_role", JSON.stringify({ type: viewModeFromDefault, profileId: null }));
        }
        navigate(defaultDashboard, { replace: true });
      }

      hasRestored.current = true;
    }
  }, [user, role, loading, navigate, location.pathname]);

  return null;
};

export default RouteRestorer;
