import { ReactNode } from "react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FeatureKey } from "@/lib/feature-config";
import { LockedFeatureCard } from "./LockedFeatureCard";
import { Skeleton } from "@/components/ui/skeleton";

interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureGate = ({ feature, children, fallback }: FeatureGateProps) => {
  const { hasFeature, getMinimumTier, isLoading, currentTier, isFounder } = useFeatureAccess();
  
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
  
  // User definitively doesn't have access - show locked state
  return fallback ?? (
    <LockedFeatureCard 
      feature={feature} 
      requiredTier={getMinimumTier(feature)} 
    />
  );
};
