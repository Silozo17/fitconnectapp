import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FeatureKey } from "@/lib/feature-config";
import { Skeleton } from "@/components/ui/skeleton";
import { UpgradeDrawer } from "@/components/subscription/UpgradeDrawer";

interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureGate = ({ feature, children, fallback }: FeatureGateProps) => {
  const { hasFeature, isLoading, isFounder } = useFeatureAccess();
  const navigate = useNavigate();
  const [showUpgradeDrawer, setShowUpgradeDrawer] = useState(false);
  
  // FOUNDER FAST PATH: Founders always have access to all features
  // Check this FIRST before any loading state to prevent any flash
  if (isFounder) {
    return <>{children}</>;
  }
  
  // Show loading skeleton only if:
  // 1. We're actually loading AND
  // 2. We don't have a cached tier that grants access
  // This prevents showing skeleton when we already know the user has access
  if (isLoading && !hasFeature(feature)) {
    return (
      <div className="w-full space-y-3 p-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  // If user has access (either from DB or cached tier), show children
  if (hasFeature(feature)) {
    return <>{children}</>;
  }
  
  // Only show locked state if we're NOT loading and user definitely doesn't have access
  // This prevents briefly showing locked content to paid users during load
  if (isLoading) {
    return (
      <div className="w-full space-y-3 p-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  // User definitively doesn't have access - show UpgradeDrawer immediately
  // Use effect to open drawer on mount to avoid render-time state updates
  useEffect(() => {
    if (!hasFeature(feature) && !isLoading) {
      setShowUpgradeDrawer(true);
    }
  }, [feature, hasFeature, isLoading]);
  
  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Show UpgradeDrawer when feature is locked
  return (
    <UpgradeDrawer
      open={showUpgradeDrawer}
      onOpenChange={(open) => {
        setShowUpgradeDrawer(open);
        if (!open) {
          // User dismissed drawer without upgrading - navigate back
          navigate(-1);
        }
      }}
      mode="upgrade"
    />
  );
};
