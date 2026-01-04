import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfileId } from "@/hooks/useCoachProfileId";
import { normalizeTier, TierKey } from "@/lib/stripe-config";

export type SubscriptionSource = 'stripe' | 'revenuecat' | 'admin' | 'none';

export interface SubscriptionStatus {
  tier: TierKey;
  source: SubscriptionSource;
  status: 'active' | 'past_due' | 'cancelled' | 'expired' | 'none';
  currentPeriodEnd: string | null;
  isNativeSubscription: boolean;
  stripeSubscriptionId: string | null;
  isLoading: boolean;
  // Phase 3: Effective date messaging
  isCancelled: boolean;
  hasAccessUntil: string | null;
  isWithinGracePeriod: boolean;
  // Phase 5: Pending tier change (for downgrades scheduled at period end)
  pendingTier: TierKey | null;
  hasPendingChange: boolean;
  // Phase 7: Subscription expiry handling
  isExpired: boolean;
  expiredTier: TierKey | null; // The tier that expired (for messaging)
}

/**
 * Unified hook for subscription status.
 * Single source of truth for determining:
 * - Current tier
 * - Subscription source (Stripe vs RevenueCat vs Admin)
 * - Whether to show Stripe portal or native management UI
 * - Cancellation status and grace period
 */
export const useSubscriptionStatus = (): SubscriptionStatus => {
  const { user } = useAuth();
  const { data: coachProfileId } = useCoachProfileId();

  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ["subscription-status", coachProfileId],
    queryFn: async () => {
      if (!coachProfileId) return null;

      // Fetch both platform subscription and admin grant in parallel
      const [platformSubResult, adminGrantResult, coachProfileResult] = await Promise.all([
        supabase
          .from("platform_subscriptions")
          .select("tier, status, stripe_subscription_id, current_period_end, pending_tier")
          .eq("coach_id", coachProfileId)
          .maybeSingle(),
        supabase
          .from("admin_granted_subscriptions")
          .select("tier, is_active, expires_at")
          .eq("coach_id", coachProfileId)
          .eq("is_active", true)
          .maybeSingle(),
        supabase
          .from("coach_profiles")
          .select("subscription_tier")
          .eq("id", coachProfileId)
          .single(),
      ]);

      return {
        platformSub: platformSubResult.data,
        adminGrant: adminGrantResult.data,
        coachProfile: coachProfileResult.data,
      };
    },
    enabled: !!coachProfileId && !!user,
    staleTime: 5_000, // 5 seconds - faster updates during active sessions
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Default state
  if (isLoading || !subscriptionData) {
    return {
      tier: 'free',
      source: 'none',
      status: 'none',
      currentPeriodEnd: null,
      isNativeSubscription: false,
      stripeSubscriptionId: null,
      isLoading,
      isCancelled: false,
      hasAccessUntil: null,
      isWithinGracePeriod: false,
      pendingTier: null,
      hasPendingChange: false,
      isExpired: false,
      expiredTier: null,
    };
  }

  const { platformSub, adminGrant, coachProfile } = subscriptionData;
  const currentTier = normalizeTier(coachProfile?.subscription_tier || 'free');

  // Check for founder tier first (immutable)
  if (currentTier === 'founder') {
    return {
      tier: 'founder',
      source: 'admin',
      status: 'active',
      currentPeriodEnd: null,
      isNativeSubscription: false,
      stripeSubscriptionId: null,
      isLoading: false,
      isCancelled: false,
      hasAccessUntil: null,
      isWithinGracePeriod: false,
      pendingTier: null,
      hasPendingChange: false,
      isExpired: false,
      expiredTier: null,
    };
  }

  // Check for active admin grant
  if (adminGrant && adminGrant.is_active) {
    const adminGrantExpired = adminGrant.expires_at && new Date(adminGrant.expires_at) < new Date();
    if (!adminGrantExpired) {
      return {
        tier: normalizeTier(adminGrant.tier),
        source: 'admin',
        status: 'active',
        currentPeriodEnd: adminGrant.expires_at,
        isNativeSubscription: false,
        stripeSubscriptionId: null,
        isLoading: false,
        isCancelled: false,
        hasAccessUntil: adminGrant.expires_at,
        isWithinGracePeriod: false,
        pendingTier: null,
        hasPendingChange: false,
        isExpired: false,
        expiredTier: null,
      };
    }
  }

  // Check for platform subscription
  if (platformSub) {
    const stripeSubId = platformSub.stripe_subscription_id;
    
    // RevenueCat subscriptions have IDs starting with 'rc_'
    const isRevenueCat = stripeSubId?.startsWith('rc_') || false;
    
    // Determine if it's a native subscription (RevenueCat = App Store / Play Store)
    const isNative = isRevenueCat;

    // Phase 5: Check if cancelled but still within grace period
    const isCancelled = platformSub.status === 'cancelled';
    const periodEnd = platformSub.current_period_end;
    const now = new Date();
    const isWithinGracePeriod = isCancelled && periodEnd && new Date(periodEnd) > now;

    // Phase 7: Check if subscription period has expired
    // This applies to both cancelled (grace period ended) and expired statuses
    const isPeriodExpired = periodEnd && new Date(periodEnd) < now;
    const isExpired = (isCancelled && isPeriodExpired) || platformSub.status === 'expired';

    // Phase 5: Check for pending tier change (scheduled downgrade)
    const pendingTierValue = (platformSub as any).pending_tier;
    const pendingTier = pendingTierValue ? normalizeTier(pendingTierValue) : null;
    const hasPendingChange = !!pendingTier && pendingTier !== normalizeTier(platformSub.tier || 'free');

    // Determine effective status for UI
    let effectiveStatus: 'active' | 'past_due' | 'cancelled' | 'expired' | 'none';
    if (isExpired) {
      effectiveStatus = 'expired';
    } else if (isWithinGracePeriod) {
      effectiveStatus = 'cancelled'; // Keep cancelled status for UI messaging
    } else {
      effectiveStatus = (platformSub.status as 'active' | 'past_due' | 'cancelled' | 'expired') || 'none';
    }

    // Phase 7: If expired, tier should be the pending tier (if scheduled downgrade) or free
    const effectiveTier = isExpired 
      ? (pendingTier || 'free') 
      : normalizeTier(platformSub.tier || 'free');
    
    // Track what tier expired for messaging purposes
    const expiredTier = isExpired ? normalizeTier(platformSub.tier || 'free') : null;

    return {
      tier: effectiveTier,
      source: isNative ? 'revenuecat' : 'stripe',
      status: effectiveStatus,
      currentPeriodEnd: periodEnd,
      isNativeSubscription: isNative,
      stripeSubscriptionId: stripeSubId,
      isLoading: false,
      isCancelled,
      hasAccessUntil: isWithinGracePeriod ? periodEnd : null,
      isWithinGracePeriod,
      pendingTier: isExpired ? null : pendingTier, // Clear pending if already expired
      hasPendingChange: isExpired ? false : hasPendingChange,
      isExpired,
      expiredTier,
    };
  }

  // No subscription found
  return {
    tier: currentTier,
    source: 'none',
    status: 'none',
    currentPeriodEnd: null,
    isNativeSubscription: false,
    stripeSubscriptionId: null,
    isLoading: false,
    isCancelled: false,
    hasAccessUntil: null,
    isWithinGracePeriod: false,
    pendingTier: null,
    hasPendingChange: false,
    isExpired: false,
    expiredTier: null,
  };
};

export default useSubscriptionStatus;
