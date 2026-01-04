import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { Crown, Check, Loader2, Clock, AlertTriangle, ExternalLink, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
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
import { UpgradeSuccessDialog } from "@/components/subscription/UpgradeSuccessDialog";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { NativeSubscriptionManagement } from "@/components/payments/NativeSubscriptionManagement";
import { BillingInterval } from "@/lib/pricing-config";
import { usePlatformRestrictions } from "@/hooks/usePlatformRestrictions";
import { LegalDisclosure, LegalLinks } from "@/components/shared/LegalLinks";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
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
  
  // UPGRADE SUCCESS DIALOG state
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradedToTier, setUpgradedToTier] = useState<TierKey>('free');
  const previousTierRef = useRef<TierKey>('free');
  
  // Platform detection and pricing
  const isNativeApp = isDespia();
  const isMobile = useIsMobile();
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
    
    // 2. Store previous tier for the dialog
    const prevTier = previousTierRef.current;
    
    // 3. Set the upgraded tier and show the success dialog
    setUpgradedToTier(tier as TierKey);
    setShowUpgradeDialog(true);
    
    // 4. Clear tier cache and force refetch for immediate UI update
    localStorage.removeItem('fitconnect_cached_tier');
    localStorage.removeItem('fitconnect_tier_timestamp');
    
    await Promise.all([
      queryClient.resetQueries({ queryKey: ['subscription-status'] }),
      queryClient.resetQueries({ queryKey: ['feature-access'] }),
      queryClient.invalidateQueries({ queryKey: ['coach-profile'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['platform-subscription'], refetchType: 'all' }),
    ]);
    
    console.log('[PlatformSubscription] Upgrade complete - dialog shown for', tier, 'from', prevTier);
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
  const { hasPendingChange, pendingTier, isExpired, expiredTier } = subscriptionStatus;

  // Format the pending change date
  const formattedPendingChangeDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  // Get pending tier display name
  const pendingTierName = pendingTier ? SUBSCRIPTION_TIERS[pendingTier]?.name || pendingTier : null;

  // Get expired tier display name for messaging
  const expiredTierName = expiredTier ? SUBSCRIPTION_TIERS[expiredTier]?.name || expiredTier : null;

  const handleSubscribe = (tierKey: TierKey) => {
    // Store current tier as previous (for upgrade dialog)
    previousTierRef.current = activeTier;
    
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
   * 
   * PHASE 6: Hard block Stripe portal on native platforms
   */
  const handleManageStripeSubscription = async () => {
    if (!user) return;

    // PHASE 6: Hard block - prevent Stripe portal on native apps
    if (isNativeApp) {
      toast.error("Subscription Management", {
        description: "Please manage your subscription through the App Store or Google Play.",
      });
      return;
    }

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
            {/* Billing grace period warning - show when subscription has payment issues */}
            {subscriptionStatus.status === 'past_due' && (
              <Alert variant="destructive" className="mb-6">
                <CreditCard className="h-4 w-4" />
                <AlertTitle>{t("subscription.paymentIssue", "Payment Issue")}</AlertTitle>
                <AlertDescription>
                  {t("subscription.paymentIssueDesc", "There's a problem with your subscription payment. Please update your payment method to avoid losing access.")}
                  {isNativeSubscription ? (
                    <Button 
                      variant="link" 
                      className="h-auto p-0 ml-1"
                      onClick={() => {
                        if (typeof window !== 'undefined' && (window as any).despia?.openURL) {
                          (window as any).despia.openURL('https://apps.apple.com/account/subscriptions');
                        } else {
                          window.open('https://apps.apple.com/account/subscriptions', '_blank');
                        }
                      }}
                    >
                      {t("subscription.updatePaymentMethod", "Update Payment Method")}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  ) : null}
                </AlertDescription>
              </Alert>
            )}

            {/* Phase 7: Show expired subscription message for non-native subscriptions */}
            {!isNativeSubscription && isExpired && expiredTierName && (
              <Alert className="mb-6 border-muted bg-muted/50">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <AlertDescription className="text-muted-foreground">
                  Your <strong>{expiredTierName}</strong> subscription has expired. Subscribe again to restore your features.
                </AlertDescription>
              </Alert>
            )}

            {/* Phase 5: Show pending downgrade message for non-native subscriptions */}
            {!isNativeSubscription && !isExpired && hasPendingChange && pendingTierName && formattedPendingChangeDate && (
              <Alert className="mb-6 border-blue-500/30 bg-blue-500/10">
                <Clock className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Your plan will change to <strong>{pendingTierName}</strong> on{' '}
                  <strong>{formattedPendingChangeDate}</strong>. You'll keep your current features until then.
                </AlertDescription>
              </Alert>
            )}

            {/* Show native subscription management for App Store / Play Store subscriptions */}
            {isNativeSubscription && activeTier !== 'free' && (
              <div className="mb-6">
                <NativeSubscriptionManagement 
                  tier={activeTier} 
                  currentPeriodEnd={currentPeriodEnd}
                />
              </div>
            )}

            {/* Billing interval toggle for native apps - using Switch like onboarding */}
            {isNativeApp && (
              <div className="mb-6 flex items-center justify-center gap-3">
                <span className={`text-sm font-medium transition-colors ${billingInterval === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {t("subscription.monthly", "Monthly")}
                </span>
                <Switch 
                  checked={billingInterval === 'yearly'}
                  onCheckedChange={(checked) => setBillingInterval(checked ? 'yearly' : 'monthly')}
                />
                <span className={`text-sm font-medium transition-colors ${billingInterval === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {t("subscription.yearly", "Yearly")}
                </span>
                {billingInterval === 'yearly' && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {t("subscription.save", "Save")} ~17%
                  </Badge>
                )}
              </div>
            )}

          {/* Tier cards - exclude free tier, show as compact cards */}
          {(() => {
            // Filter out free tier from display - free is handled by "Cancel Subscription" button
            const paidTiers = (Object.entries(SUBSCRIPTION_TIERS) as [TierKey, typeof SUBSCRIPTION_TIERS[TierKey]][])
              .filter(([tierKey, tier]) => {
                if (tier.adminOnly && activeTier !== tierKey) return false;
                if (tierKey === 'free') return false; // Never show free as a selectable card
                return true;
              });

            const renderTierCard = ([tierKey, tier]: [TierKey, typeof SUBSCRIPTION_TIERS[TierKey]]) => {
              const isCurrentTier = activeTier === tierKey;
              const isLoading = loadingTier === tierKey || (isPurchasing && loadingTier === null);
              const buttonConfig = getButtonConfig(tierKey);
              const isPricedTier = ['starter', 'pro', 'enterprise'].includes(tierKey);

              return (
                <div
                  key={tierKey}
                  className={cn(
                    "border rounded-lg p-4 relative transition-all h-full",
                    isCurrentTier 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50",
                    tier.highlighted && "ring-2 ring-primary"
                  )}
                >
                {isCurrentTier && (
                    <Badge className="absolute top-2 right-2">{t("subscription.currentPlan")}</Badge>
                  )}
                  {tier.highlighted && !isCurrentTier && (
                    <Badge variant="secondary" className="absolute top-2 right-2">{t("subscription.popular")}</Badge>
                  )}
                  
                  <h3 className="font-semibold text-lg mb-1">{tier.name}</h3>
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
                    isNativeSubscription ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          // Open native subscription management for cancellation
                          if (typeof window !== 'undefined' && (window as any).despia?.openURL) {
                            (window as any).despia.openURL('https://apps.apple.com/account/subscriptions');
                          } else {
                            window.open('https://apps.apple.com/account/subscriptions', '_blank');
                          }
                        }}
                      >
                        {t("subscription.cancelSubscription", "Cancel Subscription")}
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
            };

            return isMobile ? (
              <Carousel 
                className="w-full overflow-visible" 
                opts={{ align: "center", containScroll: "trimSnaps" }}
              >
                <CarouselContent className="py-4">
                  {paidTiers.map((tierEntry) => (
                    <CarouselItem key={tierEntry[0]} className="basis-[90%] px-2">
                      {renderTierCard(tierEntry)}
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center gap-1 mt-4">
                  {paidTiers.map((_, idx) => (
                    <div key={idx} className="w-2 h-2 rounded-full bg-muted" />
                  ))}
                </div>
              </Carousel>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paidTiers.map(renderTierCard)}
              </div>
            );
          })()}
          
          {/* Cancel subscription section for paid native users */}
          {isNativeApp && isNativeSubscription && activeTier !== 'free' && (
            <div className="mt-6 pt-4 border-t border-border">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).despia?.openURL) {
                    (window as any).despia.openURL('https://apps.apple.com/account/subscriptions');
                  } else {
                    window.open('https://apps.apple.com/account/subscriptions', '_blank');
                  }
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("subscription.cancelSubscription", "Cancel Subscription")}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Opens App Store subscription management
              </p>
            </div>
          )}
          
          {/* Legal footer with restore purchases */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm mb-3">
              {isNativeApp && (
                <button 
                  type="button"
                  onClick={async () => {
                    if (typeof window !== 'undefined' && (window as any).despia?.restorePurchases) {
                      try {
                        toast.loading("Restoring purchases...");
                        await (window as any).despia.restorePurchases();
                        toast.success("Purchases restored successfully");
                      } catch (error) {
                        console.error("Failed to restore purchases:", error);
                        toast.error("Failed to restore purchases");
                      }
                    } else {
                      toast.info("Restore purchases is only available on iOS/Android");
                    }
                  }}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Restore Purchases
                </button>
              )}
              <LegalLinks variant="compact" />
            </div>
            <LegalDisclosure />
          </div>
        </CardContent>
      </Card>

      {/* Native IAP unsuccessful dialog */}
      <IAPUnsuccessfulDialog 
        open={iapState.showUnsuccessfulModal} 
        onOpenChange={dismissUnsuccessfulModal}
      />
      
      {/* Upgrade success dialog with unlocked features */}
      <UpgradeSuccessDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        newTier={upgradedToTier}
        previousTier={previousTierRef.current}
      />
    </>
  );
};

export default PlatformSubscription;
