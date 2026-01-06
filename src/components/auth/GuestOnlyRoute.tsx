import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageLoadingSpinner from "@/components/shared/PageLoadingSpinner";
import { useRef, useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { isAdminRole } from "@/lib/role-utils";
import { recordBootStage, BOOT_STAGES } from "@/lib/boot-stages";

interface GuestOnlyRouteProps {
  children: React.ReactNode;
}

// Guest route timeout - show guest content after this time even if auth is still loading
const GUEST_ROUTE_TIMEOUT_MS = 3000;

const GuestOnlyRoute = ({ children }: GuestOnlyRouteProps) => {
  const { user, role, loading } = useAuth();
  const hasRenderedContent = useRef(false);
  const [guestTimeoutReached, setGuestTimeoutReached] = useState(false);
  const mountTimeRef = useRef(Date.now());

  // Check if signup is in progress (set by Auth.tsx before signUp call)
  // This prevents the home page flash after OTP verification
  const isSignupInProgress = sessionStorage.getItem(STORAGE_KEYS.SIGNUP_IN_PROGRESS) === 'true';

  // Timeout: If auth is still loading after GUEST_ROUTE_TIMEOUT_MS, show guest content
  // This prevents Android users from being stuck on a black/loading screen
  useEffect(() => {
    if (!loading) {
      // Auth resolved, no need for timeout
      return;
    }

    const timer = setTimeout(() => {
      console.warn('[GuestOnlyRoute] Timeout reached - showing guest content despite loading');
      recordBootStage(BOOT_STAGES.GUEST_ROUTE_TIMEOUT);
      setGuestTimeoutReached(true);
    }, GUEST_ROUTE_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [loading]);

  // If user is authenticated, redirect to their role-based dashboard
  // This check must come first to ensure authenticated users are always redirected
  if (user) {
    hasRenderedContent.current = true;
    
    if (isAdminRole(role)) {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (role === "coach") {
      return <Navigate to="/dashboard/coach" replace />;
    } else {
      return <Navigate to="/dashboard/client" replace />;
    }
  }

  // Show loading only if:
  // 1. Signup is in progress, OR
  // 2. Auth is loading AND timeout hasn't been reached
  if (isSignupInProgress) {
    return <PageLoadingSpinner />;
  }

  if (loading && !guestTimeoutReached) {
    // Brief initial grace period (100ms) to prevent flash on fast auth resolution
    const timeSinceMount = Date.now() - mountTimeRef.current;
    if (timeSinceMount < 100) {
      return <PageLoadingSpinner />;
    }
    // After 100ms, continue showing spinner until timeout or auth resolves
    return <PageLoadingSpinner />;
  }

  // Show guest content:
  // - Auth resolved with no user, OR
  // - Timeout reached (assume no user)
  if (!hasRenderedContent.current) {
    recordBootStage(BOOT_STAGES.GUEST_ROUTE_RENDERED);
  }
  hasRenderedContent.current = true;
  return <>{children}</>;
};

export default GuestOnlyRoute;
