import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const DashboardRedirect = () => {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Redirect based on user role
    switch (role) {
      case "admin":
      case "manager":
      case "staff":
        navigate("/dashboard/admin", { replace: true });
        break;
      case "coach":
        navigate("/dashboard/coach", { replace: true });
        break;
      case "client":
      default:
        navigate("/dashboard/client", { replace: true });
        break;
    }
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
