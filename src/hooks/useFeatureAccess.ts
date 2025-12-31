import { useRef } from "react";
import { useCoachProfile } from "./useCoachClients";
import { useCoachClients } from "./useCoachClients";
import { SUBSCRIPTION_TIERS, TierKey, normalizeTier } from "@/lib/stripe-config";
import { FEATURE_ACCESS, FeatureKey, getMinimumTierForFeature } from "@/lib/feature-config";

export const useFeatureAccess = () => {
  const { data: coachProfile, isLoading: profileLoading } = useCoachProfile();
  const { data: clients, isLoading: clientsLoading } = useCoachClients();
  
  // Cache the last known tier to prevent flicker during loading states
  const lastKnownTierRef = useRef<TierKey>("free");
  
  // Only update cached tier when we have valid profile data
  if (!profileLoading && coachProfile?.subscription_tier) {
    lastKnownTierRef.current = normalizeTier(coachProfile.subscription_tier);
  }
  
  // Use cached tier during loading to prevent visual flicker
  const effectiveTier = profileLoading 
    ? lastKnownTierRef.current 
    : normalizeTier(coachProfile?.subscription_tier);
    
  const tierConfig = SUBSCRIPTION_TIERS[effectiveTier];
  
  // Check if coach has access to a feature
  // During loading, use cached tier to prevent flicker
  const hasFeature = (feature: FeatureKey): boolean => {
    const allowedTiers = FEATURE_ACCESS[feature] as readonly string[];
    return allowedTiers.includes(effectiveTier);
  };
  
  // Get client limit for current tier
  // Use ternary to preserve null (unlimited) - nullish coalescing would incorrectly treat null as missing
  const clientLimit = tierConfig ? tierConfig.clientLimit : 3;
  
  // Get current client count
  const activeClientCount = clients?.filter(c => c.status === "active").length ?? 0;
  
  // Check if can add more clients
  const canAddClient = (): boolean => {
    if (clientLimit === null) return true; // Unlimited
    return activeClientCount < clientLimit;
  };
  
  // Get remaining client slots
  const remainingClientSlots = clientLimit === null ? null : Math.max(0, clientLimit - activeClientCount);
  
  // Check if approaching client limit (80% or more)
  const isApproachingLimit = (): boolean => {
    if (clientLimit === null) return false;
    return activeClientCount >= clientLimit * 0.8;
  };
  
  // Get minimum tier needed for a feature
  const getMinimumTier = (feature: FeatureKey): TierKey => {
    return getMinimumTierForFeature(feature);
  };
  
  return {
    currentTier: effectiveTier,
    tierConfig,
    hasFeature,
    clientLimit,
    activeClientCount,
    canAddClient,
    remainingClientSlots,
    isApproachingLimit,
    getMinimumTier,
    isFounder: effectiveTier === "founder",
    isLoading: profileLoading || clientsLoading,
  };
};
