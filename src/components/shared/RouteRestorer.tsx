import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getLastRoute, useRouteRestoration, isColdStart, markColdStartComplete } from "@/hooks/useRouteRestoration";

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

    // Only restore for authenticated users on TRUE cold start
    if (user && role) {
      const lastRoute = getLastRoute();
      const currentPath = location.pathname;

      // Only restore if:
      // 1. This is a cold start (fresh page load, not in-app navigation)
      // 2. User landed on auth or get-started page (NOT homepage - users should be able to browse)
      // 3. We have a saved dashboard route
      const shouldRestore = isColdStart() && (currentPath === "/get-started" || currentPath === "/auth");
      
      if (lastRoute && shouldRestore && lastRoute !== currentPath) {
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
      markColdStartComplete();
    }
  }, [user, role, loading, navigate, location.pathname]);

  return null;
};

export default RouteRestorer;
