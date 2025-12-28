import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import {
  getBestDashboardRoute,
  saveViewState,
  getViewModeFromPath,
} from "@/lib/view-restoration";

const DashboardRedirect = () => {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Use centralized restoration logic - checks saved route, then saved view, then role default
    const targetRoute = getBestDashboardRoute(role);
    
    // Sync view state before navigating
    const viewMode = getViewModeFromPath(targetRoute);
    if (viewMode) {
      saveViewState(viewMode);
    }
    
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
