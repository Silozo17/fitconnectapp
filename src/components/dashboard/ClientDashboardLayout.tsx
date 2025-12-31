import { useState, useEffect, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useClientOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useDiscoverModal } from "@/hooks/useDiscoverModal";
import { perfLogger } from "@/lib/performance-logger";
// OPTIMIZED: Moved useAutoAwardClientBadges to specific pages (ClientOverview, ClientAchievements)
// to prevent 3 database queries on every navigation
import ClientSidebar from "./ClientSidebar";
import ClientDashboardHeader from "./ClientDashboardHeader";
import SkipNavigation from "@/components/shared/SkipNavigation";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import PlatformBackground from "@/components/shared/PlatformBackground";
import { ProfilePanelProvider, useProfilePanel } from "@/contexts/ProfilePanelContext";
import ProfilePanel from "@/components/shared/ProfilePanel";
import ClientProfileSummary from "@/components/dashboard/client/ClientProfileSummary";
import { DiscoverModal } from "@/components/discover/DiscoverModal";
import { DashboardSkeleton } from "./DashboardSkeleton";

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

  // PERFORMANCE: Check localStorage for known-onboarded users to skip DB check
  const isKnownOnboarded = useMemo(() => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem('fitconnect_client_onboarded') === 'true';
  }, []);

  // Check if user just completed onboarding - prevents flash of redirect
  const justCompletedOnboarding = useMemo(() => {
    if (typeof sessionStorage === 'undefined') return false;
    const flag = sessionStorage.getItem('fitconnect_onboarding_just_completed');
    if (flag === 'client') {
      sessionStorage.removeItem('fitconnect_onboarding_just_completed');
      // Set the permanent flag for future visits
      localStorage.setItem('fitconnect_client_onboarded', 'true');
      return true;
    }
    return false;
  }, []);

  // Log dashboard mount
  useEffect(() => {
    perfLogger.logEvent('client_dashboard_layout_mount', { isKnownOnboarded, justCompletedOnboarding });
  }, []);

  // When onboarding status confirms user is onboarded, cache it
  useEffect(() => {
    if (onboardingStatus?.isOnboarded && !isKnownOnboarded) {
      localStorage.setItem('fitconnect_client_onboarded', 'true');
    }
  }, [onboardingStatus?.isOnboarded, isKnownOnboarded]);

  useEffect(() => {
    if (!isLoading && onboardingStatus && !onboardingStatus.isOnboarded && !onboardingStatus.error && !justCompletedOnboarding && !isKnownOnboarded) {
      navigate("/onboarding/client", { replace: true });
    }
  }, [onboardingStatus, isLoading, navigate, justCompletedOnboarding, isKnownOnboarded]);

  // OPTIMIZED: Skip loading state entirely for known-onboarded users
  // Only show skeleton if we're actually loading AND not known-onboarded
  if (isLoading && !justCompletedOnboarding && !isKnownOnboarded) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-6">
        <DashboardSkeleton variant="client" />
      </div>
    );
  }

  // Guard: if not onboarded and not just completed and not known-onboarded, show skeleton (redirect will happen)
  if (!onboardingStatus?.isOnboarded && !justCompletedOnboarding && !isKnownOnboarded) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-6">
        <DashboardSkeleton variant="client" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{title} | FitConnect</title>
        {description && <meta name="description" content={description} />}
        {/* Prevent dashboard pages from being indexed by search engines */}
        <meta name="robots" content="noindex, nofollow" />
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
