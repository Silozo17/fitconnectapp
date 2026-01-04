import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { Crown, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_TIERS, TierKey, normalizeTier, getTierPosition } from "@/lib/stripe-config";
import { useActivePricing } from "@/hooks/useActivePricing";
import { useNativePricing } from "@/hooks/useNativePricing";
import { useNativeIAP, SubscriptionTier } from "@/hooks/useNativeIAP";
import { isDespia } from "@/lib/despia";
import { triggerHaptic } from "@/lib/despia";
import { triggerConfetti, confettiPresets } from "@/lib/confetti";
import { IAPUnsuccessfulDialog } from "@/components/iap/IAPUnsuccessfulDialog";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { NativeSubscriptionManagement } from "@/components/payments/NativeSubscriptionManagement";
import { BillingInterval } from "@/lib/pricing-config";
import { usePlatformRestrictions } from "@/hooks/usePlatformRestrictions";
import { LegalDisclosure } from "@/components/shared/LegalLinks";
import { useQueryClient } from "@tanstack/react-query";

interface PlatformSubscriptionProps {
  coachId: string;
  currentTier?: string;
}

// Helper to translate feature keys
const translateFeature = (featureKey: string, t: TFunction, tPages: TFunction): string => {
  // featureKeys are like "pricing.tierFeatures.free.clients"
  // We need to extract the path and use tPages
  const match = featureKey.match(/^pricing\.tierFeatures\.(.+)$/);
  if (match) {
    return tPages(`pricing.tierFeatures.${match[1]}`);
  }
  return featureKey;
};

const PlatformSubscription = ({ coachId, currentTier = "free" }: PlatformSubscriptionProps) => {
  const { t } = useTranslation("settings");
  const { t: tPages } = useTranslation("pages");
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  
  // Platform detection and pricing
  const isNativeApp = isDespia();
  const { isAndroidNative } = usePlatformRestrictions();
  const webPricing = useActivePricing();
  const nativePricing = useNativePricing();
  const pricing = isNativeApp ? nativePricing : webPricing;

  // PHASE 4: Upgrade success callback with celebration UI
  const handleUpgradeSuccess = useCallback(async (tier: SubscriptionTier) => {
    console.log('[PlatformSubscription] Upgrade success callback triggered for tier:', tier);
    
    // 1. Trigger celebration IMMEDIATELY (before any async work)
    triggerConfetti(confettiPresets.achievement);
    triggerHaptic('success');
    
    // 2. Show success toast with prominent styling
    const tierName = SUBSCRIPTION_TIERS[tier]?.name || tier;
    toast.success(`🎉 Upgraded to ${tierName}!`, {
      description: 'Your new features are now active. Enjoy!',
      duration: 5000,
    });
    
    // 3. Clear tier cache and force refetch for immediate UI update
    localStorage.removeItem('fitconnect_cached_tier');
    localStorage.removeItem('fitconnect_tier_timestamp');
    
    await Promise.all([
      queryClient.resetQueries({ queryKey: ['subscription-status'] }),
      queryClient.resetQueries({ queryKey: ['feature-access'] }),
      queryClient.invalidateQueries({ queryKey: ['coach-profile'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['platform-subscription'], refetchType: 'all' }),
    ]);
  }, [queryClient]);
  
  // Native IAP hook with success callback
  const { purchase: nativePurchase, state: iapState, dismissUnsuccessfulModal } = useNativeIAP({
    onPurchaseComplete: handleUpgradeSuccess,
  });

  // Unified subscription status - single source of truth
  const subscriptionStatus = useSubscriptionStatus();
  
  // Use the unified status for determining active tier and subscription source
  const activeTier = subscriptionStatus.tier;
  const isNativeSubscription = subscriptionStatus.isNativeSubscription;
  const currentPeriodEnd = subscriptionStatus.currentPeriodEnd;

  const handleSubscribe = (tierKey: TierKey) => {
    if (isNativeApp && ['starter', 'pro', 'enterprise'].includes(tierKey)) {
      // For Enterprise on Android, yearly is not available
      const effectiveInterval = (tierKey === 'enterprise' && isAndroidNative && billingInterval === 'yearly') 
        ? 'monthly' 
        : billingInterval;
      nativePurchase(tierKey as SubscriptionTier, effectiveInterval);
    } else {
      navigate(`/subscribe?tier=${tierKey}&billing=${billingInterval}&from=settings`);
    }
  };

  /**
   * Handle "Manage Subscription" button click.
   * For native subscriptions (App Store / Play Store), this should NOT open Stripe.
   * The NativeSubscriptionManagement component handles that case.
   * This function is only called for actual Stripe subscriptions.
   */
  const handleManageStripeSubscription = async () => {
    if (!user) return;

    // Safety check: Don't open Stripe for native subscriptions
    if (isNativeSubscription) {
      toast.info("Please manage your subscription through the App Store or Google Play");
      return;
    }

    setLoadingTier("manage");
    try {
      const returnUrl = `${window.location.origin}/dashboard/coach/settings`;

      const { data, error } = await supabase.functions.invoke("stripe-platform-subscription", {
        body: {
          action: "get-portal-link",
          coachId,
          email: user.email,
          successUrl: returnUrl,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Failed to open billing portal");
    } finally {
      setLoadingTier(null);
    }
  };

  const currentPosition = getTierPosition(activeTier);

  const getButtonConfig = (tierKey: TierKey) => {
    const targetPosition = getTierPosition(tierKey);
    if (targetPosition > currentPosition) {
      return { text: t("subscription.upgrade"), variant: "default" as const };
    }
    if (targetPosition < currentPosition) {
      return { text: t("subscription.downgrade"), variant: "outline" as const };
    }
    return { text: t("subscription.current"), variant: "outline" as const };
  };

  // Check if any purchase is in progress
  const isPurchasing = iapState.purchaseStatus === 'purchasing' || iapState.isPolling;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            {t("subscription.platformSubscription")}
          </CardTitle>
          <CardDescription>
            {t("subscription.platformDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Show native subscription management for App Store / Play Store subscriptions */}
          {isNativeSubscription && activeTier !== 'free' && (
            <div className="mb-6">
              <NativeSubscriptionManagement 
                tier={activeTier} 
                currentPeriodEnd={currentPeriodEnd}
              />
            </div>
          )}

          {/* Billing interval toggle for native apps */}
          {isNativeApp && (
            <div className="mb-6">
              <RadioGroup
                value={billingInterval}
                onValueChange={(val) => setBillingInterval(val as BillingInterval)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="billing-monthly" />
                  <Label htmlFor="billing-monthly" className="cursor-pointer">
                    {t("subscription.monthly", "Monthly")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yearly" id="billing-yearly" />
                  <Label htmlFor="billing-yearly" className="cursor-pointer flex items-center gap-2">
                    {t("subscription.yearly", "Yearly")}
                    <Badge variant="secondary" className="text-xs">
                      {t("subscription.save", "Save")} ~17%
                    </Badge>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.entries(SUBSCRIPTION_TIERS) as [TierKey, typeof SUBSCRIPTION_TIERS[TierKey]][])
              .filter(([tierKey, tier]) => !tier.adminOnly || activeTier === tierKey)
              .map(([tierKey, tier]) => {
                const isCurrentTier = activeTier === tierKey;
                const isLoading = loadingTier === tierKey || (isPurchasing && loadingTier === null);
                const buttonConfig = getButtonConfig(tierKey);
                const isPricedTier = ['starter', 'pro', 'enterprise'].includes(tierKey);

                return (
                  <div
                    key={tierKey}
                    className={cn(
                      "border rounded-lg p-4 relative transition-all",
                      isCurrentTier 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50",
                      tier.highlighted && "ring-2 ring-primary"
                    )}
                  >
                    {isCurrentTier && (
                      <Badge className="absolute -top-2 right-2">{t("subscription.currentPlan")}</Badge>
                    )}
                    {tier.highlighted && !isCurrentTier && (
                      <Badge variant="secondary" className="absolute -top-2 right-2">{t("subscription.popular")}</Badge>
                    )}
                    
                    <h3 className="font-semibold text-lg mb-1">{tier.name}</h3>
                    {/* Show "Monthly only" note for Enterprise on Android when yearly is selected */}
                    {tierKey === 'enterprise' && isAndroidNative && billingInterval === 'yearly' && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {t("subscription.monthlyOnlyAndroid", "Monthly only on Android")}
                      </p>
                    )}
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold">
                        {tier.prices.monthly.amount === 0 
                          ? t("subscription.free")
                          : (isPricedTier
                              ? pricing.formatPrice(
                                  pricing.getSubscriptionPrice(
                                    tierKey as SubscriptionTier, 
                                    // Enterprise on Android: always show monthly
                                    (tierKey === 'enterprise' && isAndroidNative) ? 'monthly' : billingInterval
                                  )
                                )
                              : `${pricing.currencySymbol}${tier.prices.monthly.amount}`)}
                      </span>
                      {tier.prices.monthly.amount > 0 && (
                        <span className="text-muted-foreground">
                          {billingInterval === 'yearly' && !(tierKey === 'enterprise' && isAndroidNative)
                            ? t("subscription.perYear", "/year") 
                            : t("subscription.perMonth")}
                        </span>
                      )}
                    </div>

                    <ul className="space-y-2 mb-4">
                      {tier.featureKeys.slice(0, 5).map((featureKey, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">{translateFeature(featureKey, t, tPages)}</span>
                        </li>
                      ))}
                      {tier.featureKeys.length > 5 && (
                        <li className="text-xs text-muted-foreground">
                          +{tier.featureKeys.length - 5} more features
                        </li>
                      )}
                    </ul>
                    
                    <a 
                      href="/pricing" 
                      className="text-xs text-muted-foreground underline hover:text-primary block mb-3"
                    >
                      See full feature comparison
                    </a>

                    {isCurrentTier ? (
                      activeTier !== "free" ? (
                        // For current paid tier: Show "Manage" for Stripe, hide for native (shown above)
                        isNativeSubscription ? (
                          <Button variant="outline" className="w-full" disabled>
                            {t("subscription.currentPlan")}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleManageStripeSubscription}
                            disabled={loadingTier === "manage"}
                          >
                            {loadingTier === "manage" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {t("subscription.manageSubscription")}
                          </Button>
                        )
                      ) : (
                        <Button variant="outline" className="w-full" disabled>
                          {t("subscription.currentPlan")}
                        </Button>
                      )
                    ) : tierKey === "free" ? (
                      // Downgrade to free: For native, show disabled (managed via platform)
                      // For Stripe, show portal link
                      isNativeSubscription ? (
                        <Button variant="outline" className="w-full" disabled>
                          {t("subscription.managedViaPlatform", "Manage via App Store/Play Store")}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleManageStripeSubscription}
                          disabled={loadingTier === "manage"}
                        >
                          {loadingTier === "manage" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          {t("subscription.downgrade")}
                        </Button>
                      )
                    ) : (
                      <Button
                        variant={buttonConfig.variant}
                        className="w-full"
                        onClick={() => handleSubscribe(tierKey)}
                        disabled={!!loadingTier || isPurchasing}
                      >
                        {(isLoading || isPurchasing) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {buttonConfig.text}
                      </Button>
                    )}
                  </div>
                );
              })}
          </div>
          
          {/* Legal disclosure - required for iOS App Store compliance */}
          <LegalDisclosure className="mt-6 pt-4 border-t" />
        </CardContent>
      </Card>

      {/* Native IAP unsuccessful dialog */}
      <IAPUnsuccessfulDialog 
        open={iapState.showUnsuccessfulModal} 
        onOpenChange={dismissUnsuccessfulModal}
      />
    </>
  );
};

export default PlatformSubscription;
