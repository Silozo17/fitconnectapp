import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { getLastRoute } from "@/hooks/useRouteRestoration";

const ADMIN_ROLE_KEY = "admin_active_role";

const getDefaultDashboardForRole = (role: string | null): string => {
  switch (role) {
    case "admin":
    case "manager":
    case "staff":
      return "/dashboard/admin";
    case "coach":
      return "/dashboard/coach";
    default:
      return "/dashboard/client";
  }
};

const validateRouteForRole = (route: string, role: string | null): boolean => {
  const isAdminUser = role === "admin" || role === "manager" || role === "staff";
  const isCoach = role === "coach";
  
  if (route.startsWith("/dashboard/admin")) {
    return isAdminUser;
  }
  if (route.startsWith("/dashboard/coach")) {
    return isAdminUser || isCoach;
  }
  if (route.startsWith("/dashboard/client")) {
    // Admins, coaches, and clients can all access client dashboard
    return true;
  }
  return false;
};

const DashboardRedirect = () => {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Priority 1: Check for saved last route
    const lastRoute = getLastRoute();
    if (lastRoute && validateRouteForRole(lastRoute, role)) {
      // Sync admin_active_role localStorage with the restored route
      const viewModeFromPath = lastRoute.match(/^\/dashboard\/(admin|coach|client)/)?.[1];
      if (viewModeFromPath) {
        localStorage.setItem(ADMIN_ROLE_KEY, JSON.stringify({ type: viewModeFromPath, profileId: null }));
      }
      navigate(lastRoute, { replace: true });
      return;
    }

    // Priority 2: Check for saved view mode preference
    try {
      const savedRole = localStorage.getItem(ADMIN_ROLE_KEY);
      if (savedRole) {
        const { type } = JSON.parse(savedRole);
        const preferredRoute = `/dashboard/${type}`;
        if (validateRouteForRole(preferredRoute, role)) {
          navigate(preferredRoute, { replace: true });
          return;
        }
      }
    } catch {
      // Invalid saved role, continue to default
    }

    // Priority 3: Fall back to role-based default
    navigate(getDefaultDashboardForRole(role), { replace: true });
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
