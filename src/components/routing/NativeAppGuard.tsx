import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isDespia } from '@/lib/despia';
import { getBestDashboardRoute } from '@/lib/view-restoration';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { debugLogger } from '@/lib/debug-logger';

/**
 * Routes that native app users are allowed to access
 * All other public website pages should redirect to dashboard/get-started
 */
const ALLOWED_NATIVE_ROUTES = [
  '/dashboard',
  '/onboarding',
  '/auth',
  '/get-started',
  '/privacy',
  '/terms',
  '/eula',
  '/docs',
  '/subscribe',
  '/reset-password',
  '/reset',
  '/review',
  '/api/zoom',
];

/**
 * Check if a path is allowed for native app users
 */
function isAllowedNativeRoute(pathname: string): boolean {
  return ALLOWED_NATIVE_ROUTES.some(route => pathname.startsWith(route));
}

interface NativeAppGuardProps {
  children: React.ReactNode;
}

/**
 * NativeAppGuard prevents native app users from seeing public website pages
 * 
 * On native apps, users should NEVER see:
 * - Homepage (/)
 * - Coach marketplace (/coaches)
 * - About, FAQ, Pricing, etc.
 * 
 * Instead, they should be redirected to:
 * - Dashboard (if authenticated)
 * - /get-started (if not authenticated)
 */
export function NativeAppGuard({ children }: NativeAppGuardProps) {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasGuarded = useRef(false);
  const isNative = isDespia();

  useEffect(() => {
    // Only apply to native apps
    if (!isNative) return;
    
    // Skip during auth loading
    if (loading) return;
    
    const currentPath = location.pathname;
    
    // Skip if on an allowed route
    if (isAllowedNativeRoute(currentPath)) {
      hasGuarded.current = false; // Reset for future checks
      return;
    }
    
    // Prevent duplicate redirects
    if (hasGuarded.current) return;
    hasGuarded.current = true;
    
    debugLogger.lifecycle('NativeAppGuard', 'redirect_check', {
      currentPath,
      hasUser: !!user,
      role,
    });
    
    // If authenticated, redirect to dashboard
    if (user && role) {
      // For clients, check onboarding status
      if (role === 'client') {
        const cachedValue = localStorage.getItem(STORAGE_KEYS.CLIENT_ONBOARDED);
        if (cachedValue === 'false') {
          debugLogger.navigation(currentPath, '/onboarding/client', { reason: 'native_guard_onboarding' });
          navigate('/onboarding/client', { replace: true });
          return;
        }
      }
      
      const targetRoute = getBestDashboardRoute(role);
      debugLogger.navigation(currentPath, targetRoute, { reason: 'native_guard_auth' });
      navigate(targetRoute, { replace: true });
    } else {
      // Not authenticated - redirect to get-started
      debugLogger.navigation(currentPath, '/get-started', { reason: 'native_guard_unauth' });
      navigate('/get-started', { replace: true });
    }
  }, [isNative, user, role, loading, navigate, location.pathname]);

  // Reset guard flag when path changes to an allowed route
  useEffect(() => {
    if (isAllowedNativeRoute(location.pathname)) {
      hasGuarded.current = false;
    }
  }, [location.pathname]);

  // For native users not on allowed routes during loading, show nothing
  // This prevents flash of public page before redirect
  if (isNative && loading && !isAllowedNativeRoute(location.pathname)) {
    return null;
  }

  return <>{children}</>;
}

export default NativeAppGuard;
