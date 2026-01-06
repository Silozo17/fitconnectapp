import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TwoFactorGate } from "./TwoFactorGate";
import PageLoadingSpinner from "@/components/shared/PageLoadingSpinner";
import { hasAnyRole, isUserPrivileged, ADMIN_ROLES } from "@/lib/role-utils";
import type { AppRole } from "@/lib/role-utils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

const ROLE_LOADING_TIMEOUT_MS = 5000;

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, allRoles, loading } = useAuth();
  const location = useLocation();
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Timeout protection: if roles don't load in 5s, proceed anyway
  useEffect(() => {
    if (!user || allRoles.length > 0 || hasTimedOut) return;
    
    const timeout = setTimeout(() => {
      console.warn('[ProtectedRoute] Role loading timed out after 5s, proceeding with navigation');
      setHasTimedOut(true);
    }, ROLE_LOADING_TIMEOUT_MS);
    
    return () => clearTimeout(timeout);
  }, [user, allRoles.length, hasTimedOut]);

  // Show spinner during initial auth loading
  if (loading) {
    return <PageLoadingSpinner />;
  }
  
  // If user exists but roles haven't loaded yet, wait (with timeout protection)
  if (user && allRoles.length === 0 && !hasTimedOut) {
    return <PageLoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Admin can access all routes (but still needs 2FA)
  if (hasAnyRole(allRoles, ADMIN_ROLES)) {
    return <TwoFactorGate>{children}</TwoFactorGate>;
  }

  // Check if user has ANY of the allowed roles
  if (allowedRoles && !hasAnyRole(allRoles, allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  // Privileged users (admin, manager, staff, coach) require 2FA
  if (isUserPrivileged(allRoles)) {
    return <TwoFactorGate>{children}</TwoFactorGate>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
