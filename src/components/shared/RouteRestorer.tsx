import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isDespia } from "@/lib/despia";
import { getBestDashboardRoute, saveRoute } from "@/lib/view-restoration";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { debugLogger } from "@/lib/debug-logger";

/**
 * Simplified RouteRestorer
 * 
 * Only handles:
 * 1. Saving dashboard routes for future restoration
 * 2. Redirecting authenticated native app users from /get-started to dashboard
 * 
 * Web users are NOT redirected from homepage - that's intentional.
 * GuestOnlyRoute handles redirecting from /auth and /get-started pages.
 */
const RouteRestorer = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRestored = useRef(false);

  // Track route changes for future restoration
  useEffect(() => {
    if (location.pathname.startsWith("/dashboard")) {
      saveRoute(location.pathname);
    }
  }, [location.pathname]);

  // Handle native app: redirect authenticated users from /get-started to dashboard
  useEffect(() => {
    debugLogger.lifecycle('RouteRestorer', 'effect_run', { 
      loading, 
      hasRestored: hasRestored.current,
      hasUser: !!user,
      role,
      currentPath: location.pathname
    });
    
    if (loading || hasRestored.current) return;
    if (!user || !role) return;

    const currentPath = location.pathname;
    const isNativeApp = isDespia();

    // Only redirect from /get-started on native apps
    // Web users visiting homepage should NOT be redirected
    if (isNativeApp && currentPath === "/get-started") {
      // For clients, check onboarding status
      if (role === "client") {
        const cachedValue = localStorage.getItem(STORAGE_KEYS.CLIENT_ONBOARDED);
        if (cachedValue === 'false') {
          debugLogger.navigation(currentPath, '/onboarding/client', { reason: 'client_not_onboarded' });
          navigate("/onboarding/client", { replace: true });
          hasRestored.current = true;
          return;
        }
      }

      // Navigate to dashboard
      const targetRoute = getBestDashboardRoute(role);
      debugLogger.navigation(currentPath, targetRoute, { reason: 'native_app_restore', role });
      navigate(targetRoute, { replace: true });
    }

    hasRestored.current = true;
  }, [user, role, loading, navigate, location.pathname]);

  return null;
};

export default RouteRestorer;
