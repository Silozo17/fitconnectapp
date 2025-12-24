import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useClientOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, RefreshCw } from "lucide-react";
import ClientSidebar from "./ClientSidebar";
import ClientDashboardHeader from "./ClientDashboardHeader";
import SkipNavigation from "@/components/shared/SkipNavigation";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { Button } from "@/components/ui/button";

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const LOADING_TIMEOUT_MS = 10000; // 10 seconds timeout

const ClientDashboardLayout = ({
  children,
  title = "Client Dashboard",
  description,
}: ClientDashboardLayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: onboardingStatus, isLoading, refetch, isError } = useClientOnboardingStatus();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const isMobile = useIsMobile();

  // Loading timeout protection
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setLoadingTimedOut(true);
      }, LOADING_TIMEOUT_MS);
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimedOut(false);
    }
  }, [isLoading]);

  // Handle redirect to onboarding - navigate immediately
  useEffect(() => {
    if (!isLoading && onboardingStatus && !onboardingStatus.isOnboarded && !onboardingStatus.error) {
      navigate("/onboarding/client", { replace: true });
    }
  }, [onboardingStatus, isLoading, navigate]);

  // Show loading state ONLY while actually fetching data
  // Once we have data and user is not onboarded, we're redirecting - show loading during that transition
  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Loading dashboard">
          <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Loading dashboard...</span>
        </div>
        <MobileBottomNav variant="client" />
      </>
    );
  }

  // If not onboarded, show loading spinner while redirect happens (prevents "frozen" appearance)
  if (!onboardingStatus?.isOnboarded) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Redirecting to onboarding">
          <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Redirecting to onboarding...</span>
        </div>
        <MobileBottomNav variant="client" />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{title} | FitConnect</title>
        {description && <meta name="description" content={description} />}
      </Helmet>

      <SkipNavigation />

      <div className="h-dvh bg-background overflow-hidden">
        <ClientSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div className={`transition-all duration-300 h-full flex flex-col overflow-hidden ${sidebarCollapsed ? "xl:ml-16" : "xl:ml-64"}`}>
          <ClientDashboardHeader onMenuToggle={() => setMobileOpen(true)} />
          <main 
            id="main-content" 
            className="flex-1 p-4 lg:p-6 overflow-y-auto pb-mobile-nav"
            role="main"
            aria-label={title}
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>

      <MobileBottomNav variant="client" />
    </>
  );
};

export default ClientDashboardLayout;
