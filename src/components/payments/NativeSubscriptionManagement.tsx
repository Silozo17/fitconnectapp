import { useState } from "react";
import { ExternalLink, Apple, Smartphone, Clock, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEnvironment } from "@/hooks/useEnvironment";
import { useTranslation } from "react-i18next";
import { SubscriptionStatusBadge } from "./SubscriptionStatusBadge";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface NativeSubscriptionManagementProps {
  tier: string;
  currentPeriodEnd?: string | null;
}

/**
 * Component for managing subscriptions purchased through App Store or Play Store.
 * Shows platform-specific instructions and deep links instead of Stripe portal.
 * Phase 3: Now includes effective date messaging for cancelled subscriptions.
 * Phase 4: Includes "Refresh Purchase" button for stuck activation states.
 */
export const NativeSubscriptionManagement = ({ tier, currentPeriodEnd }: NativeSubscriptionManagementProps) => {
  const { t } = useTranslation("settings");
  const { isIOS, isAndroid } = useEnvironment();
  const { isCancelled, isWithinGracePeriod, hasAccessUntil, status } = useSubscriptionStatus();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Determine badge status
  const getBadgeStatus = () => {
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
            effectiveDate={hasAccessUntil}
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
        {/* Phase 3: Show cancellation warning with access end date */}
        {isCancelled && isWithinGracePeriod && formattedGracePeriodEnd && (
          <Alert className="border-amber-500/30 bg-amber-500/10">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              Your subscription is cancelled but you still have access until{' '}
              <strong>{formattedGracePeriodEnd}</strong>. You can resubscribe at any time.
            </AlertDescription>
          </Alert>
        )}

        {/* Past due warning */}
        {status === 'past_due' && (
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
          {formattedExpiryDate && !isCancelled && (
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
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {isCancelled 
            ? "Resubscribing will restore your access immediately"
            : "If your plan doesn't update after purchase, tap 'Refresh Purchase Status'"
          }
        </p>
      </CardContent>
    </Card>
  );
};

export default NativeSubscriptionManagement;
