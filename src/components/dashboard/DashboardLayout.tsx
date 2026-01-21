import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useCoachProfileRealtime } from "@/hooks/useCoachProfileRealtime";
import { usePlatformSubscriptionRealtime } from "@/hooks/usePlatformSubscriptionRealtime";
import { useDiscoverModal } from "@/hooks/useDiscoverModal";
import { STORAGE_KEYS } from "@/lib/storage-keys";
// OPTIMIZED: Moved useAutoAwardCoachBadges to specific pages (CoachOverview, CoachAchievements)
// to prevent 3 database queries on every navigation
import CoachSidebar from "./CoachSidebar";
import DashboardHeader from "./DashboardHeader";
import SkipNavigation from "@/components/shared/SkipNavigation";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import PlatformBackground from "@/components/shared/PlatformBackground";
import { ProfilePanelProvider, useProfilePanel } from "@/contexts/ProfilePanelContext";
import ProfilePanel from "@/components/shared/ProfilePanel";
import ProfileNotch from "@/components/shared/ProfileNotch";
import CoachProfileSummary from "@/components/dashboard/coach/CoachProfileSummary";
import { DiscoverModal } from "@/components/discover/DiscoverModal";
import PageLoadingSpinner from "@/components/shared/PageLoadingSpinner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { MOBILE_NAV_CLOSE_EVENT } from "@/lib/mobile-nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const LOADING_TIMEOUT_MS = 10000;

const DashboardLayoutInner = memo(({ children, title = "Coach Dashboard", description }: DashboardLayoutProps) => {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  // This prevents React "Rules of Hooks" violations
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: onboardingStatus, isLoading } = useCoachOnboardingStatus();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isOpen: profilePanelOpen } = useProfilePanel();
  const { shouldShow: showDiscover, markAsSeen: markDiscoverSeen } = useDiscoverModal('coach');
  
  // PERFORMANCE: Check localStorage for known-onboarded coaches to skip DB check
  const isKnownOnboarded = useMemo(() => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.COACH_ONBOARDED) === 'true';
  }, []);

  // Check if onboarding was JUST completed (set by CoachOnboarding before navigation)
  const justCompletedOnboarding = useMemo(() => {
    if (typeof sessionStorage === 'undefined') return false;
    const flag = sessionStorage.getItem(STORAGE_KEYS.ONBOARDING_JUST_COMPLETED);
    if (flag === 'coach') {
      // Remove the flag immediately so it doesn't persist
      sessionStorage.removeItem(STORAGE_KEYS.ONBOARDING_JUST_COMPLETED);
      // Set the permanent flag for future visits
      localStorage.setItem(STORAGE_KEYS.COACH_ONBOARDED, 'true');
      if (import.meta.env.DEV) {
        console.log('[DashboardLayout] Detected just-completed onboarding flag, skipping redirect check');
      }
      return true;
    }
    return false;
  }, []);
  
  useCoachProfileRealtime();
  usePlatformSubscriptionRealtime();

  // Listen for global close event (e.g., from ViewSwitcher) and close immediately
  useEffect(() => {
    const handleCloseRequest = () => {
      flushSync(() => setMobileOpen(false));
    };
    window.addEventListener(MOBILE_NAV_CLOSE_EVENT, handleCloseRequest);
    return () => window.removeEventListener(MOBILE_NAV_CLOSE_EVENT, handleCloseRequest);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleOpenMobile = useCallback(() => {
    setMobileOpen(true);
  }, []);

  // Consolidated onboarding check effect - prevents multiple redirects and race conditions
  useEffect(() => {
    // Skip if still loading or just completed onboarding or already known to be onboarded
    if (isLoading || justCompletedOnboarding || isKnownOnboarded) return;
    if (!onboardingStatus) return;
    
    // Case 1: User is onboarded with valid progress - cache it
    if (onboardingStatus.isOnboarded) {
      const progress = onboardingStatus.onboardingProgress;
      const hasValidProgress = progress && Object.keys(progress).length > 0;
      
      if (hasValidProgress) {
        localStorage.setItem(STORAGE_KEYS.COACH_ONBOARDED, 'true');
        return; // All good, stay on dashboard
      }
      
      // Case 2: Falsely-marked as onboarded (legacy bug) - force onboarding
      if (import.meta.env.DEV) {
        console.log('[DashboardLayout] Detected falsely-onboarded profile, forcing onboarding');
      }
      localStorage.removeItem(STORAGE_KEYS.COACH_ONBOARDED);
      navigate("/onboarding/coach", { replace: true });
      return;
    }
    
    // Case 3: Not onboarded at all - redirect to onboarding
    if (!onboardingStatus.error) {
      if (import.meta.env.DEV) {
        console.log('[DashboardLayout] Not onboarded, redirecting to onboarding');
      }
      navigate("/onboarding/coach", { replace: true });
    }
  }, [onboardingStatus, isLoading, navigate, justCompletedOnboarding, isKnownOnboarded]);

  // CONDITIONAL RETURNS - Only after all hooks have been called
  // Guard against race condition during native pull-to-refresh
  if (!user) {
    return <PageLoadingSpinner />;
  }

  // OPTIMIZED: Skip loading state entirely for known-onboarded users
  if (isLoading && !justCompletedOnboarding && !isKnownOnboarded) {
    return <PageLoadingSpinner />;
  }

  // Show spinner while redirecting to onboarding - but NOT if we just completed or known-onboarded
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

      <div className="h-dvh overflow-hidden relative overflow-x-clip">
        <CoachSidebar
          collapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div className={`transition-all duration-300 h-full flex flex-col overflow-hidden ${sidebarCollapsed ? "xl:ml-16" : "xl:ml-64"}`}>
          <DashboardHeader 
            subscriptionTier={onboardingStatus?.subscriptionTier}
            coachId={onboardingStatus?.coachId}
            onMenuToggle={handleOpenMobile} 
          />
          
          {/* Profile Panel */}
          <ProfilePanel headerHeight={64}>
            <CoachProfileSummary />
          </ProfilePanel>

          {/* Profile Notch - rendered outside ProfilePanel to avoid CSS transform containment */}
          <ProfileNotch />

          <main
            id="main-content" 
            className={`flex-1 p-4 pt-5 lg:p-6 lg:pt-7 overflow-y-auto overflow-x-hidden pb-mobile-nav ${profilePanelOpen ? 'pointer-events-none' : ''}`}
            role="main"
            aria-label={title}
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>

      <MobileBottomNav variant="coach" />

      {/* First-time Discover Modal */}
      <DiscoverModal 
        role="coach" 
        open={showDiscover} 
        onClose={markDiscoverSeen} 
      />
    </>
  );
});

DashboardLayoutInner.displayName = "DashboardLayoutInner";

const DashboardLayout = (props: DashboardLayoutProps) => (
  <ErrorBoundary>
    <ProfilePanelProvider>
      <DashboardLayoutInner {...props} />
    </ProfilePanelProvider>
  </ErrorBoundary>
);

export default DashboardLayout;
