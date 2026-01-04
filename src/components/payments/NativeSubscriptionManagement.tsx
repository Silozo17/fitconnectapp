import { useState } from "react";
import { ExternalLink, Apple, Smartphone, Clock, AlertTriangle, RefreshCw, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEnvironment } from "@/hooks/useEnvironment";
import { useTranslation } from "react-i18next";
import { SubscriptionStatusBadge } from "./SubscriptionStatusBadge";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { SUBSCRIPTION_TIERS } from "@/lib/stripe-config";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { triggerRestorePurchases, isDespia } from "@/lib/despia";
import { useAuth } from "@/contexts/AuthContext";

interface NativeSubscriptionManagementProps {
  tier: string;
  currentPeriodEnd?: string | null;
}

/**
 * Component for managing subscriptions purchased through App Store or Play Store.
 * Shows platform-specific instructions and deep links instead of Stripe portal.
 * Phase 3: Now includes effective date messaging for cancelled subscriptions.
 * Phase 4: Includes "Refresh Purchase" button for stuck activation states.
 * Phase 4: Includes "Restore Purchases" button for device transfers / reinstalls.
 */
export const NativeSubscriptionManagement = ({ tier, currentPeriodEnd }: NativeSubscriptionManagementProps) => {
  const { t } = useTranslation("settings");
  const { isIOS, isAndroid } = useEnvironment();
  const { isCancelled, isWithinGracePeriod, hasAccessUntil, status, hasPendingChange, pendingTier, currentPeriodEnd: periodEnd, isExpired, expiredTier } = useSubscriptionStatus();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { user } = useAuth();

  const handleOpenSubscriptionSettings = () => {
    // Open external URLs - window.open works in Despia for external links
    if (isIOS) {
      // iOS deep link to App Store subscriptions
      window.open('https://apps.apple.com/account/subscriptions', '_blank');
    } else if (isAndroid) {
      // Android deep link to Play Store subscriptions
      window.open('https://play.google.com/store/account/subscriptions', '_blank');
    }
  };

  /**
   * PHASE 4: Manual refresh purchase - reconciles with RevenueCat
   * Useful when purchase succeeded but activation is stuck
   */
  const handleRefreshPurchase = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-subscription-entitlement');
      
      if (error) {
        toast.error('Failed to verify subscription', {
          description: 'Please try again or contact support.',
        });
        return;
      }
      
      if (data?.reconciled && data?.tier) {
        toast.success('Subscription activated!', {
          description: `Your ${data.tier} plan is now active.`,
        });
        // Invalidate all relevant queries
        queryClient.invalidateQueries({ queryKey: ['coach-profile'] });
        queryClient.invalidateQueries({ queryKey: ['platform-subscription'] });
        queryClient.invalidateQueries({ queryKey: ['feature-access'] });
        queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      } else if (data?.status === 'no_active_entitlement') {
        toast.info('No active subscription found', {
          description: 'If you recently purchased, it may take a moment to activate.',
        });
      } else {
        toast.success('Subscription verified', {
          description: 'Your subscription is up to date.',
        });
        // Still refresh data
        queryClient.invalidateQueries({ queryKey: ['coach-profile'] });
        queryClient.invalidateQueries({ queryKey: ['platform-subscription'] });
      }
    } catch (e) {
      console.error('[NativeSubscriptionManagement] Refresh failed:', e);
      toast.error('Something went wrong', {
        description: 'Please try again.',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * PHASE 4: Restore purchases - useful for device transfers, reinstalls
   * Calls RevenueCat restore and then reconciles with backend
   */
  const handleRestorePurchases = async () => {
    if (!user?.id) {
      toast.error('Please sign in to restore purchases');
      return;
    }
    
    setIsRestoring(true);
    try {
      // Trigger native restore
      const triggered = triggerRestorePurchases(user.id);
      
      if (!triggered) {
        toast.error('Restore not available', {
          description: 'This feature is only available in the mobile app.',
        });
        setIsRestoring(false);
        return;
      }
      
      // Wait a moment for restore to process, then reconcile
      toast.info('Restoring purchases...', {
        description: 'Please wait while we verify your subscriptions.',
      });
      
      // Wait 3 seconds for RevenueCat to process the restore
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Now reconcile with backend
      const { data, error } = await supabase.functions.invoke('verify-subscription-entitlement');
      
      if (error) {
        toast.error('Failed to verify restored purchases', {
          description: 'Please try refreshing your purchase status.',
        });
        return;
      }
      
      if (data?.reconciled && data?.tier) {
        toast.success('Purchases restored!', {
          description: `Your ${data.tier} plan has been restored.`,
        });
        // Invalidate all relevant queries
        queryClient.invalidateQueries({ queryKey: ['coach-profile'] });
        queryClient.invalidateQueries({ queryKey: ['platform-subscription'] });
        queryClient.invalidateQueries({ queryKey: ['feature-access'] });
        queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      } else if (data?.status === 'no_active_entitlement') {
        toast.info('No purchases to restore', {
          description: 'We couldn\'t find any active subscriptions to restore.',
        });
      } else {
        toast.success('Restore complete', {
          description: 'Your subscription status has been verified.',
        });
        queryClient.invalidateQueries({ queryKey: ['coach-profile'] });
        queryClient.invalidateQueries({ queryKey: ['platform-subscription'] });
      }
    } catch (e) {
      console.error('[NativeSubscriptionManagement] Restore failed:', e);
      toast.error('Restore failed', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  // Format the expiry date if available
  const formattedExpiryDate = currentPeriodEnd 
    ? new Date(currentPeriodEnd).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : null;

  // Format the grace period end date
  const formattedGracePeriodEnd = hasAccessUntil
    ? new Date(hasAccessUntil).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  // Format the pending change date (period end)
  const formattedPendingChangeDate = periodEnd
    ? new Date(periodEnd).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  // Get pending tier display name
  const pendingTierName = pendingTier ? SUBSCRIPTION_TIERS[pendingTier]?.name || pendingTier : null;

  // Get expired tier display name (for messaging)
  const expiredTierName = expiredTier ? SUBSCRIPTION_TIERS[expiredTier]?.name || expiredTier : null;

  // Determine badge status
  const getBadgeStatus = (): 'active' | 'activating' | 'cancelled' | 'past_due' | 'pending_change' | 'expired' => {
    if (isExpired) return 'expired';
    if (hasPendingChange && !isCancelled) return 'pending_change';
    if (isCancelled && isWithinGracePeriod) return 'cancelled';
    if (status === 'past_due') return 'past_due';
    return 'active';
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {isIOS ? (
              <Apple className="h-5 w-5" />
            ) : (
              <Smartphone className="h-5 w-5" />
            )}
            {t("subscription.manageSubscription")}
          </CardTitle>
          <SubscriptionStatusBadge 
            status={getBadgeStatus()} 
            effectiveDate={hasPendingChange ? periodEnd : hasAccessUntil}
            pendingTier={pendingTierName}
          />
        </div>
        <CardDescription>
          {isIOS 
            ? "Your subscription is managed through the App Store"
            : "Your subscription is managed through Google Play"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phase 7: Show expired subscription message */}
        {isExpired && expiredTierName && (
          <Alert className="border-muted bg-muted/50">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <AlertDescription className="text-muted-foreground">
              Your <strong>{expiredTierName}</strong> subscription has expired. Subscribe again to restore your features.
            </AlertDescription>
          </Alert>
        )}

        {/* Phase 5: Show pending downgrade message */}
        {hasPendingChange && pendingTierName && formattedPendingChangeDate && !isCancelled && !isExpired && (
          <Alert className="border-blue-500/30 bg-blue-500/10">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Your plan will change to <strong>{pendingTierName}</strong> on{' '}
              <strong>{formattedPendingChangeDate}</strong>. You'll keep your current features until then.
            </AlertDescription>
          </Alert>
        )}

        {/* Phase 3: Show cancellation warning with access end date */}
        {isCancelled && isWithinGracePeriod && formattedGracePeriodEnd && !isExpired && (
          <Alert className="border-amber-500/30 bg-amber-500/10">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              Your subscription is cancelled but you still have access until{' '}
              <strong>{formattedGracePeriodEnd}</strong>. You can resubscribe at any time.
            </AlertDescription>
          </Alert>
        )}

        {/* Past due warning */}
        {status === 'past_due' && !isExpired && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your payment is past due. Please update your payment method to avoid losing access.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Current Plan:</strong> {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </p>
          {formattedExpiryDate && !isCancelled && !isExpired && (
            <p>
              <strong>Renews:</strong> {formattedExpiryDate}
            </p>
          )}
        </div>

        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <p className="font-medium mb-2">To manage your subscription:</p>
          {isIOS ? (
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Tap the button below to open App Store settings</li>
              <li>Find FitConnect in your subscriptions list</li>
              <li>Choose to upgrade, downgrade, or cancel</li>
            </ol>
          ) : (
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Tap the button below to open Google Play settings</li>
              <li>Find FitConnect in your subscriptions list</li>
              <li>Choose to upgrade, downgrade, or cancel</li>
            </ol>
          )}
          <p className="mt-2 text-xs text-muted-foreground italic">
            Plan changes take effect at the end of your current billing period.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleOpenSubscriptionSettings}
            className="w-full"
            variant="default"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {isIOS ? "Open App Store Subscriptions" : "Open Google Play Subscriptions"}
          </Button>

          {/* Phase 4: Refresh Purchase button for stuck activations */}
          <Button
            onClick={handleRefreshPurchase}
            variant="outline"
            className="w-full"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isRefreshing ? "Verifying..." : "Refresh Purchase Status"}
          </Button>

          {/* Phase 4: Restore Purchases for device transfers / reinstalls */}
          {isDespia() && (
            <Button
              onClick={handleRestorePurchases}
              variant="ghost"
              className="w-full text-muted-foreground"
              disabled={isRestoring}
            >
              {isRestoring ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              {isRestoring ? "Restoring..." : "Restore Purchases"}
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {isExpired
            ? "Subscribe again to restore your premium features"
            : isCancelled 
              ? "Resubscribing will restore your access immediately"
              : "If your plan doesn't update after purchase, tap 'Refresh Purchase Status'"
          }
        </p>
      </CardContent>
    </Card>
  );
};

export default NativeSubscriptionManagement;
