import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getLastRoute, clearLastRoute, useRouteRestoration } from "@/hooks/useRouteRestoration";

const RouteRestorer = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRestored = useRef(false);

  // Track route changes for future restoration
  useRouteRestoration();

  // Handle cold start route restoration
  useEffect(() => {
    // Only run once, when auth finishes loading
    if (loading || hasRestored.current) return;

    // Only restore for authenticated users on initial load
    if (user && role) {
      const lastRoute = getLastRoute();
      const currentPath = location.pathname;

      // Only restore if:
      // 1. We have a saved route
      // 2. Current path is a generic entry point (like root or get-started)
      // 3. The saved route is different from current
      const isEntryPoint = currentPath === "/" || currentPath === "/get-started" || currentPath === "/auth";
      
      if (lastRoute && isEntryPoint && lastRoute !== currentPath) {
        // Verify the saved route matches the user's role
        const isValidRoute = 
          (lastRoute.startsWith("/dashboard/admin") && (role === "admin" || role === "manager" || role === "staff")) ||
          (lastRoute.startsWith("/dashboard/coach") && role === "coach") ||
          (lastRoute.startsWith("/dashboard/client") && (role === "client" || role === "coach"));

        if (isValidRoute) {
          navigate(lastRoute, { replace: true });
        }
      }
      
      hasRestored.current = true;
    }
  }, [user, role, loading, navigate, location.pathname]);

  return null;
};

export default RouteRestorer;
