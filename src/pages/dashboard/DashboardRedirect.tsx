import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { getBestDashboardRoute } from "@/lib/view-restoration";

/**
 * Simple redirect component that sends users to their appropriate dashboard.
 * Waits for auth to load, then navigates to the best dashboard for their role.
 */
const DashboardRedirect = () => {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Get the best route based on saved preferences and role
    const targetRoute = getBestDashboardRoute(role);
    navigate(targetRoute, { replace: true });
  }, [role, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default DashboardRedirect;
