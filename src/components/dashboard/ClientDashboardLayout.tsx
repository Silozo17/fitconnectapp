import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import ClientSidebar from "./ClientSidebar";
import ClientDashboardHeader from "./ClientDashboardHeader";

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const ClientDashboardLayout = ({
  children,
  title = "Client Dashboard",
  description,
}: ClientDashboardLayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("client_profiles")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data && !data.onboarding_completed) {
        navigate("/onboarding/client");
        return;
      }

      setLoading(false);
    };

    checkOnboarding();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{title} | FitConnect</title>
        {description && <meta name="description" content={description} />}
      </Helmet>

      <div className="min-h-screen bg-background">
        <ClientSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
          <ClientDashboardHeader onMenuToggle={() => setMobileOpen(true)} />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </>
  );
};

export default ClientDashboardLayout;
