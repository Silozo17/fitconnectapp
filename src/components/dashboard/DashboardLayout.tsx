import { useState, useEffect, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useCoachProfileRealtime } from "@/hooks/useCoachProfileRealtime";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, RefreshCw } from "lucide-react";
import CoachSidebar from "./CoachSidebar";
import DashboardHeader from "./DashboardHeader";
import SkipNavigation from "@/components/shared/SkipNavigation";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const LOADING_TIMEOUT_MS = 10000; // 10 seconds timeout

const DashboardLayout = memo(({ children, title = "Coach Dashboard", description }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: onboardingStatus, isLoading, refetch, isError } = useCoachOnboardingStatus();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const isMobile = useIsMobile();
  
  // Subscribe to realtime updates for coach profile (e.g., admin changes subscription tier)
  useCoachProfileRealtime();

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleOpenMobile = useCallback(() => {
    setMobileOpen(true);
  }, []);

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

  // Handle redirect to onboarding
  useEffect(() => {
    if (!isLoading && onboardingStatus && !onboardingStatus.isOnboarded && !onboardingStatus.error) {
      navigate("/onboarding/coach");
    }
  }, [onboardingStatus, isLoading, navigate]);

  const handleRetry = useCallback(() => {
    setLoadingTimedOut(false);
    refetch();
  }, [refetch]);

  // Show error/timeout state
  if (isError || loadingTimedOut || onboardingStatus?.error) {
    return (
      <>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4" role="alert">
          <p className="text-muted-foreground text-center">
            {loadingTimedOut 
              ? "Loading is taking longer than expected." 
              : "Unable to load dashboard. Please try again."}
          </p>
          <Button onClick={handleRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
        <MobileBottomNav variant="coach" />
      </>
    );
  }

  // Show loading state (but with timeout protection)
  if (isLoading || !onboardingStatus?.isOnboarded) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Loading dashboard">
          <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Loading dashboard...</span>
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
