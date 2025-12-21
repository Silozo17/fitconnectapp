import { useState, useEffect, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useCoachProfileRealtime } from "@/hooks/useCoachProfileRealtime";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";
import CoachSidebar from "./CoachSidebar";
import DashboardHeader from "./DashboardHeader";
import SkipNavigation from "@/components/shared/SkipNavigation";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const DashboardLayout = memo(({ children, title = "Coach Dashboard", description }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: onboardingStatus, isLoading } = useCoachOnboardingStatus();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Subscribe to realtime updates for coach profile (e.g., admin changes subscription tier)
  useCoachProfileRealtime();
  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleOpenMobile = useCallback(() => {
    setMobileOpen(true);
  }, []);

  useEffect(() => {
    if (!isLoading && onboardingStatus && !onboardingStatus.isOnboarded) {
      navigate("/onboarding/coach");
    }
  }, [onboardingStatus, isLoading, navigate]);

  if (isLoading || !onboardingStatus?.isOnboarded) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Loading dashboard">
          <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Loading dashboard...</span>
        </div>
        {/* Always render bottom nav for immediate visibility in PWA/Despia */}
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

      <SkipNavigation />

      <div className="h-dvh bg-background overflow-hidden">
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

      <MobileBottomNav variant="coach" />
    </>
  );
});

DashboardLayout.displayName = "DashboardLayout";

export default DashboardLayout;
