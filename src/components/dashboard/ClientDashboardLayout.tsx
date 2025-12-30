import { useState, useEffect, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useClientOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useDiscoverModal } from "@/hooks/useDiscoverModal";
import { Loader2 } from "lucide-react";
import ClientSidebar from "./ClientSidebar";
import ClientDashboardHeader from "./ClientDashboardHeader";
import SkipNavigation from "@/components/shared/SkipNavigation";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import PlatformBackground from "@/components/shared/PlatformBackground";
import { ProfilePanelProvider, useProfilePanel } from "@/contexts/ProfilePanelContext";
import ProfilePanel from "@/components/shared/ProfilePanel";
import ClientProfileSummary from "@/components/dashboard/client/ClientProfileSummary";
import { DiscoverModal } from "@/components/discover/DiscoverModal";

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const LOADING_TIMEOUT_MS = 10000;

const ClientDashboardLayoutInner = memo(({
  children,
  title = "Client Dashboard",
  description,
}: ClientDashboardLayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: onboardingStatus, isLoading } = useClientOnboardingStatus();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isOpen: profilePanelOpen } = useProfilePanel();
  const { shouldShow: showDiscover, markAsSeen: markDiscoverSeen } = useDiscoverModal('client');

  // Check if user just completed onboarding - prevents flash of redirect
  const justCompletedOnboarding = useMemo(() => {
    if (typeof sessionStorage === 'undefined') return false;
    const flag = sessionStorage.getItem('fitconnect_onboarding_just_completed');
    if (flag === 'client') {
      sessionStorage.removeItem('fitconnect_onboarding_just_completed');
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (!isLoading && onboardingStatus && !onboardingStatus.isOnboarded && !onboardingStatus.error && !justCompletedOnboarding) {
      navigate("/onboarding/client", { replace: true });
    }
  }, [onboardingStatus, isLoading, navigate, justCompletedOnboarding]);

  // Show loading only if actually loading and not just completed onboarding
  if (isLoading && !justCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Guard: if not onboarded and not just completed, show loading (redirect will happen)
  if (!onboardingStatus?.isOnboarded && !justCompletedOnboarding) {
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

      <PlatformBackground showAmbientGlow={false} />
      <SkipNavigation />

      <div className="h-dvh overflow-hidden relative">
        <ClientSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div className={`transition-all duration-300 h-full flex flex-col overflow-hidden ${sidebarCollapsed ? "xl:ml-16" : "xl:ml-64"}`}>
          <ClientDashboardHeader onMenuToggle={() => setMobileOpen(true)} />
          
          {/* Profile Panel */}
          <ProfilePanel headerHeight={64}>
            <ClientProfileSummary />
          </ProfilePanel>

          <main 
            id="main-content" 
            className={`flex-1 p-4 lg:p-6 overflow-y-auto overflow-x-hidden pb-mobile-nav mt-header-safe xl:mt-0 ${profilePanelOpen ? 'pointer-events-none' : ''}`}
            role="main"
            aria-label={title}
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>

      <MobileBottomNav variant="client" />

      {/* First-time Discover Modal */}
      <DiscoverModal 
        role="client" 
        open={showDiscover} 
        onClose={markDiscoverSeen} 
      />
    </>
  );
});

ClientDashboardLayoutInner.displayName = 'ClientDashboardLayoutInner';

const ClientDashboardLayout = (props: ClientDashboardLayoutProps) => (
  <ProfilePanelProvider>
    <ClientDashboardLayoutInner {...props} />
  </ProfilePanelProvider>
);

export default ClientDashboardLayout;
