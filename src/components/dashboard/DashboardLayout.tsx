import { useState, useEffect, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useCoachProfileRealtime } from "@/hooks/useCoachProfileRealtime";
import { useDiscoverModal } from "@/hooks/useDiscoverModal";
import { Loader2 } from "lucide-react";
import CoachSidebar from "./CoachSidebar";
import DashboardHeader from "./DashboardHeader";
import SkipNavigation from "@/components/shared/SkipNavigation";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import PlatformBackground from "@/components/shared/PlatformBackground";
import { ProfilePanelProvider, useProfilePanel } from "@/contexts/ProfilePanelContext";
import ProfilePanel from "@/components/shared/ProfilePanel";
import CoachProfileSummary from "@/components/dashboard/coach/CoachProfileSummary";
import { DiscoverModal } from "@/components/discover/DiscoverModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const LOADING_TIMEOUT_MS = 10000;

const DashboardLayoutInner = memo(({ children, title = "Coach Dashboard", description }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: onboardingStatus, isLoading } = useCoachOnboardingStatus();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isOpen: profilePanelOpen } = useProfilePanel();
  const { shouldShow: showDiscover, markAsSeen: markDiscoverSeen } = useDiscoverModal('coach');
  
  useCoachProfileRealtime();

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleOpenMobile = useCallback(() => {
    setMobileOpen(true);
  }, []);

  useEffect(() => {
    if (!isLoading && onboardingStatus && !onboardingStatus.isOnboarded && !onboardingStatus.error) {
      navigate("/onboarding/coach", { replace: true });
    }
  }, [onboardingStatus, isLoading, navigate]);

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <MobileBottomNav variant="coach" />
      </>
    );
  }

  if (!onboardingStatus?.isOnboarded) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <MobileBottomNav variant="coach" />
      </>
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

      <div className="h-dvh overflow-hidden relative overflow-x-clip">
        <CoachSidebar
          collapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div className={`transition-all duration-300 h-full flex flex-col overflow-hidden ${sidebarCollapsed ? "xl:ml-16" : "xl:ml-64"}`}>
          <DashboardHeader 
            subscriptionTier={onboardingStatus.subscriptionTier} 
            onMenuToggle={handleOpenMobile} 
          />
          
          {/* Profile Panel */}
          <ProfilePanel headerHeight={64}>
            <CoachProfileSummary />
          </ProfilePanel>

          <main 
            id="main-content" 
            className={`flex-1 p-4 lg:p-6 overflow-y-auto pb-mobile-nav mt-header-safe xl:mt-0 ${profilePanelOpen ? 'pointer-events-none' : ''}`}
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
  <ProfilePanelProvider>
    <DashboardLayoutInner {...props} />
  </ProfilePanelProvider>
);

export default DashboardLayout;
