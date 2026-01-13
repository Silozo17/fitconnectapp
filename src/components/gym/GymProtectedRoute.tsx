import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGym } from '@/contexts/GymContext';
import PageLoadingSpinner from '@/components/shared/PageLoadingSpinner';

interface GymProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: ('owner' | 'manager' | 'coach' | 'marketing' | 'staff')[];
}

/**
 * GymProtectedRoute - Protects gym admin routes
 * Checks both authentication and gym staff membership
 */
export const GymProtectedRoute: React.FC<GymProtectedRouteProps> = ({
  children,
  requiredRoles = [],
}) => {
  const { user, loading: authLoading } = useAuth();
  const { gym, isLoading: gymLoading, isStaff, userRole } = useGym();
  const location = useLocation();

  // Still loading auth or gym data
  if (authLoading || gymLoading) {
    return <PageLoadingSpinner />;
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // No gym context (shouldn't happen if routes are set up correctly)
  if (!gym) {
    return <Navigate to="/dashboard" replace />;
  }

  // Not a staff member at this gym
  if (!isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this gym's admin area.
          </p>
          <a href="/dashboard" className="text-primary hover:underline">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Check specific role requirements
  if (requiredRoles.length > 0 && userRole && !requiredRoles.includes(userRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Insufficient Permissions</h1>
          <p className="text-muted-foreground">
            Your role ({userRole}) doesn't have access to this section.
          </p>
          <a href={`/gym/${gym.slug}/admin`} className="text-primary hover:underline">
            Return to Gym Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default GymProtectedRoute;
