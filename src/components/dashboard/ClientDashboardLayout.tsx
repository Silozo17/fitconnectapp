import { useState, useEffect, useMemo, memo } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useClientOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useDiscoverModal } from "@/hooks/useDiscoverModal";
import { useCoachPreFetch } from "@/hooks/useCoachPreFetch";
import { STORAGE_KEYS } from "@/lib/storage-keys";
// OPTIMIZED: Moved useAutoAwardClientBadges to specific pages (ClientOverview, ClientAchievements)
// to prevent 3 database queries on every navigation
import ClientSidebar from "./ClientSidebar";
import ClientDashboardHeader from "./ClientDashboardHeader";
import SkipNavigation from "@/components/shared/SkipNavigation";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import PlatformBackground from "@/components/shared/PlatformBackground";
import { ProfilePanelProvider, useProfilePanel } from "@/contexts/ProfilePanelContext";
import ProfilePanel from "@/components/shared/ProfilePanel";
import ProfileNotch from "@/components/shared/ProfileNotch";
import ClientProfileSummary from "@/components/dashboard/client/ClientProfileSummary";
import { DiscoverModal } from "@/components/discover/DiscoverModal";
import PageLoadingSpinner from "@/components/shared/PageLoadingSpinner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { MOBILE_NAV_CLOSE_EVENT } from "@/lib/mobile-nav";

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
  const [isNavigating, setIsNavigating] = useState(false);
  const { isOpen: profilePanelOpen } = useProfilePanel();
  const { shouldShow: showDiscover, markAsSeen: markDiscoverSeen } = useDiscoverModal('client');
  
  // PERFORMANCE: Pre-fetch coaches in background for instant Find Coaches page
  useCoachPreFetch();

  // PERFORMANCE: Check localStorage for known-onboarded users to skip DB check
  const isKnownOnboarded = useMemo(() => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.CLIENT_ONBOARDED) === 'true';
  }, []);

  // FIX: Guard against race condition during native pull-to-refresh
  // If user is not yet available (auth loading), show loading spinner
  // This prevents crashes when Despia's pull-to-refresh triggers a full page reload
  if (!user) {
    return <PageLoadingSpinner />;
  }

  // Check if user just completed onboarding - prevents flash of redirect
  const justCompletedOnboarding = useMemo(() => {
    if (typeof sessionStorage === 'undefined') return false;
    const flag = sessionStorage.getItem(STORAGE_KEYS.ONBOARDING_JUST_COMPLETED);
    if (flag === 'client') {
      sessionStorage.removeItem(STORAGE_KEYS.ONBOARDING_JUST_COMPLETED);
      // Set the permanent flag for future visits
      localStorage.setItem(STORAGE_KEYS.CLIENT_ONBOARDED, 'true');
      return true;
    }
    return false;
  }, []);

  // When onboarding status confirms user is onboarded, cache it
  useEffect(() => {
    if (onboardingStatus?.isOnboarded && !isKnownOnboarded) {
      localStorage.setItem(STORAGE_KEYS.CLIENT_ONBOARDED, 'true');
    }
  }, [onboardingStatus?.isOnboarded, isKnownOnboarded]);

  // Listen for global close event (e.g., from ViewSwitcher) and close immediately
  useEffect(() => {
    const handleCloseRequest = () => {
      flushSync(() => setMobileOpen(false));
    };
    window.addEventListener(MOBILE_NAV_CLOSE_EVENT, handleCloseRequest);
    return () => window.removeEventListener(MOBILE_NAV_CLOSE_EVENT, handleCloseRequest);
  }, []);

  useEffect(() => {
    if (!isLoading && onboardingStatus && !onboardingStatus.isOnboarded && !onboardingStatus.error && !justCompletedOnboarding && !isKnownOnboarded) {
      navigate("/onboarding/client", { replace: true });
    }
  }, [onboardingStatus, isLoading, navigate, justCompletedOnboarding, isKnownOnboarded]);

  // OPTIMIZED: Skip loading state entirely for known-onboarded users
  // Only show spinner if we're actually loading AND not known-onboarded
  if (isLoading && !justCompletedOnboarding && !isKnownOnboarded) {
    return <PageLoadingSpinner />;
  }

  // Guard: if not onboarded and not just completed and not known-onboarded, show spinner (redirect will happen)
  if (!onboardingStatus?.isOnboarded && !justCompletedOnboarding && !isKnownOnboarded) {
    return <PageLoadingSpinner />;
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
          onNavigating={setIsNavigating}
        />

        <div className={`transition-all duration-300 h-full flex flex-col overflow-hidden ${sidebarCollapsed ? "xl:ml-16" : "xl:ml-64"}`}>
          <ClientDashboardHeader onMenuToggle={() => setMobileOpen(true)} />
          
          {/* Profile Panel */}
          <ProfilePanel headerHeight={64}>
            <ClientProfileSummary />
          </ProfilePanel>

          {/* Profile Notch - rendered outside ProfilePanel to avoid CSS transform containment */}
          <ProfileNotch />

          <main
            id="main-content" 
            className={`flex-1 p-4 pt-5 lg:p-6 lg:pt-7 overflow-y-auto overflow-x-hidden pb-mobile-nav mt-header-safe xl:mt-0 ${profilePanelOpen ? 'pointer-events-none' : ''}`}
            role="main"
            aria-label={title}
            tabIndex={-1}
          >
            {/* Navigation loading overlay */}
            {isNavigating && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <PageLoadingSpinner />
              </div>
            )}
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
  <ErrorBoundary>
    <ProfilePanelProvider>
      <ClientDashboardLayoutInner {...props} />
    </ProfilePanelProvider>
  </ErrorBoundary>
);

export default ClientDashboardLayout;
