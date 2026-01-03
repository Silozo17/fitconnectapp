import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TwoFactorGate } from "./TwoFactorGate";
import PageLoadingSpinner from "@/components/shared/PageLoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("client" | "coach" | "admin" | "manager" | "staff")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, allRoles, loading } = useAuth();
  const location = useLocation();

  // PERF FIX: Only show spinner during initial auth loading
  // If we have user but no role yet, wait briefly for cache restoration
  // Don't block on role if user exists - role will be fetched async
  if (loading) {
    return <PageLoadingSpinner />;
  }
  
  // PERF FIX: If user exists and we're still waiting for role, 
  // show spinner only briefly - native cache should restore role immediately
  if (user && role === null && allRoles.length === 0) {
    return <PageLoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Admin can access all routes
  if (allRoles.includes("admin")) {
    // Admin still needs 2FA verification
    return <TwoFactorGate>{children}</TwoFactorGate>;
  }

  // If user exists but no roles could be fetched, redirect to home
  if (allRoles.length === 0) {
    return <Navigate to="/" replace />;
  }

  // Check if user has ANY of the allowed roles
  if (allowedRoles) {
    const hasPermission = allRoles.some(userRole => allowedRoles.includes(userRole));
    if (!hasPermission) {
      return <Navigate to="/" replace />;
    }
  }

  // Check if user is privileged (admin, manager, staff, coach) - require 2FA
  const isPrivilegedUser = allRoles.some(r => 
    ['admin', 'manager', 'staff', 'coach'].includes(r)
  );

  if (isPrivilegedUser) {
    return <TwoFactorGate>{children}</TwoFactorGate>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
