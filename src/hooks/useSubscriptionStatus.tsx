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
}

/**
 * Unified hook for subscription status.
 * Single source of truth for determining:
 * - Current tier
 * - Subscription source (Stripe vs RevenueCat vs Admin)
 * - Whether to show Stripe portal or native management UI
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
          .select("tier, status, stripe_subscription_id, current_period_end")
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
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: true,
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
    };
  }

  // Check for active admin grant
  if (adminGrant && adminGrant.is_active) {
    const isExpired = adminGrant.expires_at && new Date(adminGrant.expires_at) < new Date();
    if (!isExpired) {
      return {
        tier: normalizeTier(adminGrant.tier),
        source: 'admin',
        status: 'active',
        currentPeriodEnd: adminGrant.expires_at,
        isNativeSubscription: false,
        stripeSubscriptionId: null,
        isLoading: false,
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

    return {
      tier: normalizeTier(platformSub.tier || 'free'),
      source: isNative ? 'revenuecat' : 'stripe',
      status: (platformSub.status as 'active' | 'past_due' | 'cancelled' | 'expired') || 'none',
      currentPeriodEnd: platformSub.current_period_end,
      isNativeSubscription: isNative,
      stripeSubscriptionId: stripeSubId,
      isLoading: false,
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
  };
};

export default useSubscriptionStatus;
