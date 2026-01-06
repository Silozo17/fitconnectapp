import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
import { isDespia } from "@/lib/despia";
import { getBestDashboardRoute, getViewModeFromPath, saveRoute } from "@/lib/view-restoration";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/**
 * Simplified RouteRestorer
 * 
 * Handles navigation for authenticated users on app launch.
 * Reduced from 113 lines to ~50 lines.
 */
const RouteRestorer = () => {
  const { user, role, loading } = useAuth();
  const { isLoadingProfiles, activeProfileType } = useAdminView();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRestored = useRef(false);

  // Track route changes for future restoration
  useEffect(() => {
    if (location.pathname.startsWith("/dashboard")) {
      saveRoute(location.pathname);
    }
  }, [location.pathname]);

  // Handle route restoration for authenticated users
  useEffect(() => {
    if (loading || isLoadingProfiles || hasRestored.current) return;
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
  }, [user, role, loading, isLoadingProfiles, activeProfileType, navigate, location.pathname]);

  return null;
};

export default RouteRestorer;
