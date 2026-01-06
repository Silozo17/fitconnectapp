import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
import { isDespia } from "@/lib/despia";
import { getBestDashboardRoute, getViewModeFromPath, saveRoute } from "@/lib/view-restoration";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const PROFILE_LOADING_TIMEOUT_MS = 5000;

/**
 * Simplified RouteRestorer with timeout protection
 * 
 * Handles navigation for authenticated users on app launch.
 * Includes timeout protection to prevent infinite loading on Android.
 */
const RouteRestorer = () => {
  const { user, role, loading } = useAuth();
  const { isLoadingProfiles, activeProfileType } = useAdminView();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRestored = useRef(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Timeout protection for profile loading
  useEffect(() => {
    if (!isLoadingProfiles || hasTimedOut) return;
    
    const timeout = setTimeout(() => {
      console.warn('[RouteRestorer] Profile loading timed out after 5s, proceeding with navigation');
      setHasTimedOut(true);
    }, PROFILE_LOADING_TIMEOUT_MS);
    
    return () => clearTimeout(timeout);
  }, [isLoadingProfiles, hasTimedOut]);

  // Track route changes for future restoration
  useEffect(() => {
    if (location.pathname.startsWith("/dashboard")) {
      saveRoute(location.pathname);
    }
  }, [location.pathname]);

  // Handle route restoration for authenticated users
  useEffect(() => {
    // Block until loading completes OR timeout fires
    if (loading || (isLoadingProfiles && !hasTimedOut) || hasRestored.current) return;
    if (!user || !role) return;

    const currentPath = location.pathname;
    const isNativeApp = isDespia();

    // Check if current path already matches the active profile type
    const currentViewMode = getViewModeFromPath(currentPath);
    if (currentViewMode === activeProfileType) {
      hasRestored.current = true;
      return;
    }

    // Paths that should trigger restoration
    const shouldRestore = isNativeApp
      ? ["/", "/auth", "/get-started", "/dashboard"].includes(currentPath)
      : ["/auth", "/get-started"].includes(currentPath);

    if (shouldRestore) {
      // For clients, check onboarding status (handle both formats)
      if (role === "client") {
        const cachedValue = localStorage.getItem(STORAGE_KEYS.CLIENT_ONBOARDED);
        // Only redirect if explicitly false (not just missing)
        if (cachedValue === 'false') {
          navigate("/onboarding/client", { replace: true });
          hasRestored.current = true;
          return;
        }
      }

      // Navigate to best dashboard route
      const targetRoute = getBestDashboardRoute(role);
      if (targetRoute !== currentPath) {
        navigate(targetRoute, { replace: true });
      }
    }

    hasRestored.current = true;
  }, [user, role, loading, isLoadingProfiles, hasTimedOut, activeProfileType, navigate, location.pathname]);

  return null;
};

export default RouteRestorer;
