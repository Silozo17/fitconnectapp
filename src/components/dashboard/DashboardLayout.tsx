import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import CoachSidebar from "./CoachSidebar";
import DashboardHeader from "./DashboardHeader";

interface CoachProfile {
  display_name: string | null;
  subscription_tier: string | null;
  onboarding_completed: boolean;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const DashboardLayout = ({ children, title = "Coach Dashboard", description }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("coach_profiles")
        .select("display_name, subscription_tier, onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data && !data.onboarding_completed) {
        navigate("/onboarding/coach");
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
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
        <CoachSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div
          className={cn(
            "transition-all duration-300",
            sidebarCollapsed ? "ml-16" : "ml-64"
          )}
        >
          <DashboardHeader
            displayName={profile?.display_name}
            subscriptionTier={profile?.subscription_tier}
          />

          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
