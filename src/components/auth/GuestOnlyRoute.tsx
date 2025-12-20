import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageLoadingSpinner from "@/components/shared/PageLoadingSpinner";

interface GuestOnlyRouteProps {
  children: React.ReactNode;
}

const GuestOnlyRoute = ({ children }: GuestOnlyRouteProps) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <PageLoadingSpinner />;
  }

  // If user is authenticated, redirect to their role-based dashboard
  if (user) {
    if (role === "admin" || role === "manager" || role === "staff") {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (role === "coach") {
      return <Navigate to="/dashboard/coach" replace />;
    } else {
      return <Navigate to="/dashboard/client" replace />;
    }
  }

  // Not authenticated, show the guest-only content
  return <>{children}</>;
};

export default GuestOnlyRoute;
