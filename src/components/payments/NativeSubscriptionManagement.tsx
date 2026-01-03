import { ExternalLink, Apple, Smartphone, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEnvironment } from "@/hooks/useEnvironment";
import { useTranslation } from "react-i18next";
import { SubscriptionStatusBadge } from "./SubscriptionStatusBadge";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

interface NativeSubscriptionManagementProps {
  tier: string;
  currentPeriodEnd?: string | null;
}

/**
 * Component for managing subscriptions purchased through App Store or Play Store.
 * Shows platform-specific instructions and deep links instead of Stripe portal.
 * Phase 3: Now includes effective date messaging for cancelled subscriptions.
 */
export const NativeSubscriptionManagement = ({ tier, currentPeriodEnd }: NativeSubscriptionManagementProps) => {
  const { t } = useTranslation("settings");
  const { isIOS, isAndroid } = useEnvironment();
  const { isCancelled, isWithinGracePeriod, hasAccessUntil, status } = useSubscriptionStatus();

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
        </div>

        <Button 
          onClick={handleOpenSubscriptionSettings}
          className="w-full"
          variant="default"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {isIOS ? "Open App Store Subscriptions" : "Open Google Play Subscriptions"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {isCancelled 
            ? "Resubscribing will restore your access immediately"
            : "Changes may take a few minutes to reflect in the app"
          }
        </p>
      </CardContent>
    </Card>
  );
};

export default NativeSubscriptionManagement;
