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
  const { hasFeature, getMinimumTier, isLoading } = useFeatureAccess();
  
  // Show loading skeleton to prevent briefly revealing gated content
  if (isLoading) {
    return (
      <div className="w-full space-y-3 p-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  // If user has access, show children
  if (hasFeature(feature)) {
    return <>{children}</>;
  }
  
  // Otherwise show locked state
  return fallback ?? (
    <LockedFeatureCard 
      feature={feature} 
      requiredTier={getMinimumTier(feature)} 
    />
  );
};
