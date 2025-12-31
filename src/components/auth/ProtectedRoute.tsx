import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TwoFactorGate } from "./TwoFactorGate";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { perfLogger } from "@/lib/performance-logger";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("client" | "coach" | "admin" | "manager" | "staff")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, allRoles, loading } = useAuth();
  const location = useLocation();

  perfLogger.logEvent('protected_route_check', { 
    path: location.pathname.replace(/[a-f0-9-]{36}/gi, '[id]'),
    loading, 
    hasUser: !!user, 
    role: role || 'none',
    rolesCount: allRoles.length
  });

  // PERFORMANCE FIX: Show skeleton instead of spinner while loading
  // This provides immediate visual feedback and reduces perceived load time
  if (loading || (user && role === null)) {
    perfLogger.logEvent('protected_route_loading_skeleton');
    return (
      <div className="min-h-screen bg-background">
        <DashboardSkeleton />
      </div>
    );
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
    perfLogger.logEvent('protected_route_render', { requiresTwoFactor: true });
    return <TwoFactorGate>{children}</TwoFactorGate>;
  }

  perfLogger.logEvent('protected_route_render', { requiresTwoFactor: false });
  return <>{children}</>;
};

export default ProtectedRoute;
