import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { TwoFactorGate } from "./TwoFactorGate";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("client" | "coach" | "admin" | "manager" | "staff")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, allRoles, loading } = useAuth();
  const location = useLocation();

  // Show loading while auth is initializing or while role is being fetched
  if (loading || (user && role === null)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
    return <TwoFactorGate>{children}</TwoFactorGate>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
