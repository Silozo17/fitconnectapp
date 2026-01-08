import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isDespia } from "@/lib/despia";
import { getBestDashboardRoute, saveRoute } from "@/lib/view-restoration";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { debugLogger } from "@/lib/debug-logger";

/**
 * Routes that are considered "public" website pages
 * Native app users should never land on these
 */
const PUBLIC_WEBSITE_ROUTES = [
  '/',
  '/coaches',
  '/about',
  '/faq',
  '/pricing',
  '/for-coaches',
  '/how-it-works',
  '/success-stories',
  '/contact',
  '/community',
  '/marketplace',
  '/blog',
  '/install',
  '/trust-and-verification',
  '/leaderboards',
  '/avatars',
];

/**
 * Check if a path is a public website route
 */
function isPublicWebsiteRoute(pathname: string): boolean {
  // Exact match for root
  if (pathname === '/') return true;
  
  // Check if path starts with any public route prefix
  return PUBLIC_WEBSITE_ROUTES.some(route => 
    route !== '/' && (pathname === route || pathname.startsWith(route + '/'))
  );
}

/**
 * Simplified RouteRestorer
 * 
 * Handles:
 * 1. Saving dashboard routes for future restoration
 * 2. Redirecting authenticated native app users from public pages to dashboard
 * 3. Redirecting unauthenticated native app users from public pages to /get-started
 * 
 * Web users are NOT redirected from public pages - that's intentional.
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

  // Handle native app: redirect users from public pages
  useEffect(() => {
    debugLogger.lifecycle('RouteRestorer', 'effect_run', { 
      loading, 
      hasRestored: hasRestored.current,
      hasUser: !!user,
      role,
      currentPath: location.pathname
    });
    
    if (loading || hasRestored.current) return;
    
    const currentPath = location.pathname;
    const isNativeApp = isDespia();

    // Only apply to native apps
    if (!isNativeApp) return;

    // Check if on a public website route
    const isOnPublicPage = isPublicWebsiteRoute(currentPath);
    
    // If on /get-started or a public page, handle redirect
    if (currentPath === "/get-started" || isOnPublicPage) {
      if (!user || !role) {
        // Not authenticated - redirect to get-started (if not already there)
        if (currentPath !== "/get-started") {
          debugLogger.navigation(currentPath, '/get-started', { reason: 'native_unauth_public' });
          navigate("/get-started", { replace: true });
        }
        hasRestored.current = true;
        return;
      }
      
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
