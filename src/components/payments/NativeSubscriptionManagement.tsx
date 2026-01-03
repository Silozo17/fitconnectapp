import { ExternalLink, Apple, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnvironment } from "@/hooks/useEnvironment";
import { useTranslation } from "react-i18next";

interface NativeSubscriptionManagementProps {
  tier: string;
  currentPeriodEnd?: string | null;
}

/**
 * Component for managing subscriptions purchased through App Store or Play Store.
 * Shows platform-specific instructions and deep links instead of Stripe portal.
 */
export const NativeSubscriptionManagement = ({ tier, currentPeriodEnd }: NativeSubscriptionManagementProps) => {
  const { t } = useTranslation("settings");
  const { isIOS, isAndroid } = useEnvironment();

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

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isIOS ? (
            <Apple className="h-5 w-5" />
          ) : (
            <Smartphone className="h-5 w-5" />
          )}
          {t("subscription.manageSubscription")}
        </CardTitle>
        <CardDescription>
          {isIOS 
            ? "Your subscription is managed through the App Store"
            : "Your subscription is managed through Google Play"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Current Plan:</strong> {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </p>
          {formattedExpiryDate && (
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
          Changes may take a few minutes to reflect in the app
        </p>
      </CardContent>
    </Card>
  );
};

export default NativeSubscriptionManagement;
