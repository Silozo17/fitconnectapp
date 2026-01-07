import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Crown, Loader2, Clock, AlertTriangle, ExternalLink, CreditCard, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { SUBSCRIPTION_TIERS, TierKey } from "@/lib/stripe-config";
import { useNativeIAP } from "@/hooks/useNativeIAP";
import { triggerHaptic } from "@/lib/despia";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { triggerConfetti, confettiPresets } from "@/lib/confetti";
import { IAPUnsuccessfulDialog } from "@/components/iap/IAPUnsuccessfulDialog";
import { FeaturesActivatedModal } from "@/components/subscription/FeaturesActivatedModal";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { NativeSubscriptionManagement } from "@/components/payments/NativeSubscriptionManagement";
import { LegalDisclosure, LegalLinks } from "@/components/shared/LegalLinks";
import { useQueryClient } from "@tanstack/react-query";
import { UpgradeDrawer } from "@/components/subscription/UpgradeDrawer";
import { usePlatformRestrictions } from "@/hooks/usePlatformRestrictions";
import { supabase } from "@/integrations/supabase/client";
import type { SubscriptionTier } from "@/hooks/useNativeIAP";

interface PlatformSubscriptionProps {
  coachId: string;
  currentTier?: string;
}

const PlatformSubscription = ({ coachId, currentTier = "free" }: PlatformSubscriptionProps) => {
  const { t } = useTranslation("settings");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Platform detection
  const { isNativeMobile } = usePlatformRestrictions();
  
  // State for upgrade drawer (native only)
  const [showUpgradeDrawer, setShowUpgradeDrawer] = useState(false);
  
  // State for Stripe portal loading
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  
  // FEATURES ACTIVATED MODAL state
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [upgradedToTier, setUpgradedToTier] = useState<TierKey>('free');

  // PHASE 4: Upgrade success callback with celebration UI
  const handleUpgradeSuccess = useCallback(async (tier: SubscriptionTier) => {
    console.log('[PlatformSubscription] Upgrade success callback triggered for tier:', tier);
    
    // 1. Trigger celebration IMMEDIATELY (before any async work)
    triggerConfetti(confettiPresets.achievement);
    triggerHaptic('success');
    
    // 2. Set the upgraded tier and show the features activated modal
    setUpgradedToTier(tier as TierKey);
    setShowFeaturesModal(true);
    
    // 3. Clear tier cache and force refetch for immediate UI update
    localStorage.removeItem(STORAGE_KEYS.CACHED_TIER);
    localStorage.removeItem(STORAGE_KEYS.TIER_TIMESTAMP);
    
    await Promise.all([
      queryClient.resetQueries({ queryKey: ['subscription-status'] }),
      queryClient.resetQueries({ queryKey: ['feature-access'] }),
      queryClient.invalidateQueries({ queryKey: ['coach-profile'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['platform-subscription'], refetchType: 'all' }),
    ]);
    
    console.log('[PlatformSubscription] Upgrade complete - features modal shown for', tier);
  }, [queryClient]);
  
  // Native IAP hook with success callback
  const { state: iapState, dismissUnsuccessfulModal } = useNativeIAP({
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

  // Get current tier display info
  const currentTierData = SUBSCRIPTION_TIERS[activeTier];

  // Web Stripe customer portal handler - opens Stripe portal for cancellation
  const handleManageSubscription = async () => {
    if (!user?.email) {
      toast.error("Please log in to manage subscription");
      return;
    }

    setIsPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-platform-subscription', {
        body: {
          action: 'get-portal-link',
          coachId,
          email: user.email,
          successUrl: `${window.location.origin}/dashboard/coach/settings`,
          isNativeApp: false,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('[PlatformSubscription] Stripe portal error:', error);
      toast.error(error.message || "Failed to open subscription management");
    } finally {
      setIsPortalLoading(false);
    }
  };

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

          {/* Current Plan Display */}
          <div className="flex items-center justify-between p-4 rounded-xl border-2 border-primary/30 bg-primary/5 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                {activeTier === 'free' ? (
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <Crown className="h-5 w-5 text-primary-foreground" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{currentTierData?.name || 'Free'}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {t("subscription.currentPlan")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{currentTierData?.description || 'Basic features'}</p>
              </div>
            </div>
          </div>

          {/* NATIVE UI: Simple upgrade button + App Store note */}
          {isNativeMobile ? (
            <>
              <Button
                className="w-full mb-4"
                onClick={() => setShowUpgradeDrawer(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {activeTier === 'free' ? t("subscription.upgrade", "Upgrade") : t("subscription.changePlan", "Change Plan")}
              </Button>

              <p className="text-xs text-muted-foreground text-center mb-4">
                Subscriptions can be managed in the App Store
              </p>
              
              {/* Legal footer with restore purchases */}
              <div className="pt-4 border-t border-border">
                <div className="flex flex-wrap justify-center items-center gap-4 text-sm mb-3">
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
                  <LegalLinks variant="compact" />
                </div>
                <LegalDisclosure />
              </div>
            </>
          ) : (
            /* WEB/PWA UI: Simplified 2-button layout */
            <>
              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Change Plan Button - navigates to /subscribe */}
                <Button
                  className="w-full"
                  onClick={() => {
                    // Navigate to subscribe page with current tier context
                    window.location.href = `/subscribe?from=settings&tier=${activeTier === 'free' ? 'pro' : activeTier}`;
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {activeTier === 'free' ? t("subscription.upgrade", "Upgrade Plan") : t("subscription.changePlan", "Change Plan")}
                </Button>

                {/* Switch to Free Plan Button - only show for subscribed users */}
                {activeTier !== 'free' && !isNativeSubscription && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleManageSubscription}
                    disabled={isPortalLoading}
                  >
                    {isPortalLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Switch to Free Plan
                      </>
                    )}
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center mt-3">
                {activeTier !== 'free' 
                  ? "Downgrades take effect at the end of your current billing period. Upgrades are immediate and pro-rated."
                  : "Upgrade to unlock premium features for your coaching business."
                }
              </p>
              
              {/* Legal footer */}
              <div className="pt-4 mt-4 border-t border-border">
                <div className="flex flex-wrap justify-center items-center gap-4 text-sm mb-3">
                  <LegalLinks variant="compact" />
                </div>
                <LegalDisclosure />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Drawer (Native only) */}
      {isNativeMobile && (
        <UpgradeDrawer
          open={showUpgradeDrawer}
          onOpenChange={setShowUpgradeDrawer}
          coachId={coachId}
        />
      )}

      {/* Native IAP unsuccessful dialog */}
      <IAPUnsuccessfulDialog 
        open={iapState.showUnsuccessfulModal} 
        onOpenChange={dismissUnsuccessfulModal}
      />
      
      {/* Features activated modal */}
      <FeaturesActivatedModal
        isOpen={showFeaturesModal}
        onClose={() => setShowFeaturesModal(false)}
        tier={upgradedToTier}
      />
    </>
  );
};

export default PlatformSubscription;
