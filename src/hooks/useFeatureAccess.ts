import { useRef, useEffect } from "react";
import { useCoachProfile } from "./useCoachClients";
import { useCoachClients } from "./useCoachClients";
import { SUBSCRIPTION_TIERS, TierKey, normalizeTier } from "@/lib/stripe-config";
import { FEATURE_ACCESS, FeatureKey, getMinimumTierForFeature } from "@/lib/feature-config";
import { useSubscriptionStatus } from "./useSubscriptionStatus";

// CRITICAL: Persistent storage key for subscription tier
// This prevents tier resets on page reload, session refresh, or profile loading delays
const TIER_STORAGE_KEY = 'fitconnect_cached_tier';
const TIER_TIMESTAMP_KEY = 'fitconnect_tier_timestamp';

// Cache TTL - 5 minutes (300000ms) - after this, cache is considered stale
const CACHE_TTL_MS = 5 * 60 * 1000;

// Check if cached tier is still valid (not expired)
const isCacheValid = (): boolean => {
  try {
    const timestamp = localStorage.getItem(TIER_TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const cachedTime = parseInt(timestamp, 10);
    const now = Date.now();
    const isValid = (now - cachedTime) < CACHE_TTL_MS;
    
    if (!isValid) {
      console.log('[useFeatureAccess] Cache expired, will refetch');
    }
    
    return isValid;
  } catch {
    return false;
  }
};

// Get cached tier from localStorage (survives page reloads)
// Only returns cached value if it's still within TTL
const getCachedTier = (): TierKey | null => {
  try {
    const cached = localStorage.getItem(TIER_STORAGE_KEY);
    if (cached && cached in SUBSCRIPTION_TIERS) {
      // Only use cache if it's still valid (within TTL)
      if (isCacheValid()) {
        return cached as TierKey;
      }
      // Cache expired - clear it
      console.log('[useFeatureAccess] Clearing expired tier cache');
      localStorage.removeItem(TIER_STORAGE_KEY);
      localStorage.removeItem(TIER_TIMESTAMP_KEY);
    }
  } catch {
    // localStorage may be unavailable
  }
  return null;
};

// Persist tier to localStorage with timestamp
const persistTier = (tier: TierKey): void => {
  try {
    localStorage.setItem(TIER_STORAGE_KEY, tier);
    localStorage.setItem(TIER_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    // localStorage may be unavailable
  }
};

export const useFeatureAccess = () => {
  const { data: coachProfile, isLoading: profileLoading } = useCoachProfile();
  const { data: clients, isLoading: clientsLoading } = useCoachClients();
  
  // Phase 5: Get subscription status for grace period handling
  const subscriptionStatus = useSubscriptionStatus();
  
  // CRITICAL: Initialize from localStorage to prevent "free" flash on page reload
  // This is the key fix - never default to "free" if we have a cached paid tier
  const lastKnownTierRef = useRef<TierKey | null>(getCachedTier());
  
  // Track if we've received fresh data from the database in this session
  const hasReceivedFreshDataRef = useRef(false);
  
  // Update cache when profile loads with valid subscription tier
  if (!profileLoading && coachProfile?.subscription_tier) {
    const normalizedTier = normalizeTier(coachProfile.subscription_tier);
    
    // FOUNDER PROTECTION: Never cache a downgrade from founder
    const cachedTier = lastKnownTierRef.current;
    if (cachedTier === 'founder' && normalizedTier !== 'founder') {
      console.warn('[useFeatureAccess] BLOCKED: Attempted to downgrade from founder tier');
      // Keep founder tier, do not update
    } else {
      lastKnownTierRef.current = normalizedTier;
      hasReceivedFreshDataRef.current = true;
      // Persist to localStorage for cross-session durability
      persistTier(normalizedTier);
    }
  }
  
  // CRITICAL TIER RESOLUTION LOGIC:
  // 1. If profile is loaded with tier data -> use that (source of truth)
  // 2. If loading but we have cached tier -> use cached (prevents flash)
  // 3. If loading and no cache -> use null (will show loading state)
  // 4. NEVER default to "free" during loading - this was the bug
  const effectiveTier: TierKey | null = (() => {
    // Profile is loaded and has tier data - use it
    if (!profileLoading && coachProfile?.subscription_tier) {
      const normalizedTier = normalizeTier(coachProfile.subscription_tier);
      // FOUNDER PROTECTION in resolution
      if (lastKnownTierRef.current === 'founder' && normalizedTier !== 'founder') {
        return 'founder';
      }
      return normalizedTier;
    }
    
    // Profile is loading - use cached tier to prevent flash
    if (profileLoading && lastKnownTierRef.current) {
      return lastKnownTierRef.current;
    }
    
    // Profile loaded but no tier set - check cache first, then default to free
    if (!profileLoading && !coachProfile?.subscription_tier) {
      return lastKnownTierRef.current || 'free';
    }
    
    // Still loading with no cache - return null to indicate loading
    return lastKnownTierRef.current;
  })();
  
  // Phase 5: For cancelled subscriptions within grace period, use the paid tier for access
  // This ensures users keep their features until their paid period actually ends
  const accessTier: TierKey = (() => {
    if (subscriptionStatus.isWithinGracePeriod && subscriptionStatus.tier !== 'free') {
      // User is cancelled but still has access until period ends
      return subscriptionStatus.tier;
    }
    return effectiveTier || 'free';
  })();

  // Use free tier config as fallback only when effectiveTier is null
  const tierConfig = effectiveTier ? SUBSCRIPTION_TIERS[effectiveTier] : SUBSCRIPTION_TIERS.free;
  
  // Check if coach has access to a feature
  // CRITICAL: During loading, GRANT ACCESS to prevent feature lockouts
  // This is safer than denying - paid users should never be locked out
  // Phase 5: Use accessTier which respects grace period
  const hasFeature = (feature: FeatureKey): boolean => {
    // If tier is null (still loading), grant access to prevent lockouts
    // This is intentionally permissive during loading states
    if (!effectiveTier) {
      return true;
    }
    
    // FOUNDER PROTECTION: Founders have access to ALL features
    if (accessTier === 'founder') {
      return true;
    }
    
    const allowedTiers = FEATURE_ACCESS[feature] as readonly string[];
    return allowedTiers.includes(accessTier);
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
  
  // Explicit founder check - also check localStorage for safety
  const isFounderTier = effectiveTier === "founder" || getCachedTier() === "founder";
  
  return {
    currentTier: effectiveTier || 'free', // Only use free as absolute last resort for display
    tierConfig,
    hasFeature,
    clientLimit,
    activeClientCount,
    canAddClient,
    remainingClientSlots,
    isApproachingLimit,
    getMinimumTier,
    isFounder: isFounderTier,
    isLoading: profileLoading || clientsLoading,
    // New: Expose whether we have confirmed tier data
    hasFreshData: hasReceivedFreshDataRef.current,
    // Phase 5: Expose cancellation status for UI messaging
    isCancelled: subscriptionStatus.isCancelled,
    isWithinGracePeriod: subscriptionStatus.isWithinGracePeriod,
    accessEndsDate: subscriptionStatus.hasAccessUntil,
  };
};
