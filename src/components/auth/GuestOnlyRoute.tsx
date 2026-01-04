import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageLoadingSpinner from "@/components/shared/PageLoadingSpinner";
import { useRef, useEffect, useState } from "react";

interface GuestOnlyRouteProps {
  children: React.ReactNode;
}

const GuestOnlyRoute = ({ children }: GuestOnlyRouteProps) => {
  const { user, role, loading } = useAuth();
  const hasRenderedContent = useRef(false);
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);

  // Check if signup is in progress (set by Auth.tsx before signUp call)
  // This prevents the home page flash after OTP verification
  const isSignupInProgress = sessionStorage.getItem('fitconnect_signup_in_progress') === 'true';

  // Prevent flash by ensuring minimum loading time on first render
  useEffect(() => {
    if (!hasRenderedContent.current && loading) {
      const timer = setTimeout(() => {
        setMinLoadingComplete(true);
      }, 100); // Brief minimum to prevent flash
      return () => clearTimeout(timer);
    } else {
      setMinLoadingComplete(true);
    }
  }, [loading]);

  // Show loading while signup is completing or during actual loading state
  if (isSignupInProgress || (loading && !minLoadingComplete)) {
    return <PageLoadingSpinner />;
  }

  // If user is authenticated, redirect to their role-based dashboard
  if (user) {
    // Mark that we've rendered content before redirect
    hasRenderedContent.current = true;
    
    if (role === "admin" || role === "manager" || role === "staff") {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (role === "coach") {
      return <Navigate to="/dashboard/coach" replace />;
    } else {
      return <Navigate to="/dashboard/client" replace />;
    }
  }

  // Not authenticated, show the guest-only content
  hasRenderedContent.current = true;
  return <>{children}</>;
};

export default GuestOnlyRoute;
