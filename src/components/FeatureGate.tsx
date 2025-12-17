import { ReactNode } from "react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FeatureKey } from "@/lib/feature-config";
import { LockedFeatureCard } from "./LockedFeatureCard";

interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureGate = ({ feature, children, fallback }: FeatureGateProps) => {
  const { hasFeature, getMinimumTier, isLoading } = useFeatureAccess();
  
  // Show loading state
  if (isLoading) {
    return <>{children}</>;
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
