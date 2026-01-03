import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Check, Loader2, Smartphone, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useNativeIAP, SubscriptionTier, BillingInterval } from '@/hooks/useNativeIAP';
import { isDespia, isDespiaAndroid, isDespiaIOS } from '@/lib/despia';
import { SUBSCRIPTION_TIERS, TierKey, normalizeTier, getTierPosition } from '@/lib/stripe-config';
import { useNativePricing } from '@/hooks/useNativePricing';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';

interface NativeSubscriptionButtonsProps {
  currentTier?: string;
  className?: string;
  /** Optional: Set when purchase is optimistically confirmed but polling */
  optimisticTier?: SubscriptionTier | null;
}

/**
 * Native subscription buttons for in-app purchases via Despia + RevenueCat
 * Only visible when running inside the Despia native environment
 * 
 * Phase 2: Properly handles downgrades by directing to platform subscription management
 * Phase 4: Shows optimistic UI during purchase confirmation
 */
export const NativeSubscriptionButtons = ({
  currentTier = 'free',
  className,
  optimisticTier,
}: NativeSubscriptionButtonsProps) => {
  const { t } = useTranslation('settings');
  const { t: tPages } = useTranslation('pages');
  const pricing = useNativePricing();
  const { state, purchase, isAvailable } = useNativeIAP();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');

  // Only render in Despia environment
  if (!isDespia()) {
    return null;
  }

  const activeTier = normalizeTier(currentTier);
  // Use optimistic tier if we're confirming a purchase
  const displayTier = optimisticTier || activeTier;
  const currentPosition = getTierPosition(activeTier);
  const isAndroid = isDespiaAndroid();
  const isIOS = isDespiaIOS();

  // On Android, Enterprise tier doesn't have yearly pricing
  const isYearlyAvailable = (tierKey: string) => {
    if (isAndroid && tierKey === 'enterprise') {
      return false;
    }
    return true;
  };

  // Phase 2: Handle purchase - only for upgrades
  const handlePurchase = async (tierKey: SubscriptionTier) => {
    const targetPosition = getTierPosition(tierKey);
    
    // Only allow purchases for upgrades - downgrades must go through platform
    if (targetPosition <= currentPosition && activeTier !== 'free') {
      return;
    }
    
    // Force monthly for Enterprise on Android
    const effectiveInterval = (isAndroid && tierKey === 'enterprise') 
      ? 'monthly' 
      : billingInterval;
    await purchase(tierKey, effectiveInterval);
  };

  // Phase 2: Open platform subscription management for downgrades
  const handleOpenPlatformSubscriptions = () => {
    if (isIOS) {
      window.open('https://apps.apple.com/account/subscriptions', '_blank');
    } else if (isAndroid) {
      window.open('https://play.google.com/store/account/subscriptions', '_blank');
    }
  };

  // Phase 2 & 4: Determine button text and behavior
  const getButtonConfig = (tierKey: TierKey) => {
    const targetPosition = getTierPosition(tierKey);
    const isProcessing = state.purchaseStatus === 'purchasing' || state.isPolling;
    
    // Phase 4: Show activating state for optimistic tier
    if (optimisticTier === tierKey) {
      return { 
        text: 'Activating...', 
        variant: 'default' as const,
        disabled: true,
        isActivating: true,
      };
    }
    
    if (isProcessing) {
      return { 
        text: state.isPolling ? 'Confirming...' : 'Processing...', 
        variant: 'default' as const,
        disabled: true,
        isActivating: false,
      };
    }
    
    // Current tier
    if (targetPosition === currentPosition) {
      return { 
        text: t('subscription.current'), 
        variant: 'outline' as const,
        disabled: true,
        isActivating: false,
      };
    }
    
    // Upgrade
    if (targetPosition > currentPosition) {
      return { 
        text: t('subscription.upgrade'), 
        variant: 'default' as const,
        disabled: false,
        isActivating: false,
      };
    }
    
    // Downgrade - show change plan button that opens platform settings
    return { 
      text: 'Change Plan', 
      variant: 'outline' as const,
      disabled: false,
      isDowngrade: true,
      isActivating: false,
    };
  };

  // Filter to only subscription tiers (not free or admin-only)
  const purchasableTiers = (['starter', 'pro', 'enterprise'] as const).map(
    key => ({ key, tier: SUBSCRIPTION_TIERS[key] })
  );

  return (
    <Card className={cn('border-primary/20', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          <Crown className="h-5 w-5 text-primary" />
          {t('subscription.platformSubscription')}
        </CardTitle>
        <CardDescription>
          Subscribe directly through the app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Billing interval toggle */}
        <div className="flex justify-center">
          <RadioGroup
            value={billingInterval}
            onValueChange={(value) => setBillingInterval(value as BillingInterval)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly" className="cursor-pointer">Monthly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yearly" id="yearly" />
              <Label htmlFor="yearly" className="cursor-pointer">
                Yearly
                <Badge variant="secondary" className="ml-2 text-xs">Save 2 months</Badge>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Subscription tiers */}
        <div className="grid grid-cols-1 gap-4">
        {purchasableTiers.map(({ key, tier }) => {
            const isCurrentTier = activeTier === key;
            const isProcessing = (state.purchaseStatus === 'purchasing' || state.isPolling);
            const isPurchasable = key === 'starter' || key === 'pro' || key === 'enterprise';
            const tierPosition = getTierPosition(key);
            const canUpgrade = tierPosition > currentPosition;
            const showYearlyOption = isYearlyAvailable(key);

            // For Enterprise on Android, force monthly even if yearly is selected
            const effectiveInterval = (!showYearlyOption && billingInterval === 'yearly') 
              ? 'monthly' 
              : billingInterval;

            // Get price for effective interval
            const price = effectiveInterval === 'monthly'
              ? pricing.getSubscriptionPrice(key, 'monthly')
              : pricing.getSubscriptionPrice(key, 'yearly');

            return (
              <div
                key={key}
                className={cn(
                  'border rounded-lg p-4 relative transition-all',
                  isCurrentTier
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50',
                  tier.highlighted && 'ring-2 ring-primary'
                )}
              >
                {isCurrentTier && (
                  <Badge className="absolute -top-2 right-2">
                    {t('subscription.currentPlan')}
                  </Badge>
                )}
                {tier.highlighted && !isCurrentTier && (
                  <Badge variant="secondary" className="absolute -top-2 right-2">
                    {t('subscription.popular')}
                  </Badge>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {pricing.formatPrice(price)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {effectiveInterval === 'monthly' ? '/month' : '/year'}
                    </div>
                    {billingInterval === 'yearly' && showYearlyOption && (
                      <div className="text-xs text-primary">
                        Save {pricing.formatPrice(pricing.getSubscriptionSavings(key))}
                      </div>
                    )}
                    {!showYearlyOption && billingInterval === 'yearly' && (
                      <div className="text-xs text-muted-foreground">
                        Monthly only
                      </div>
                    )}
                  </div>
                </div>

                <ul className="space-y-1 mb-4">
                  {tier.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {(() => {
                  const buttonConfig = getButtonConfig(key);
                  
                  // Current tier
                  if (isCurrentTier) {
                    return (
                      <Button variant="outline" className="w-full" disabled>
                        {t('subscription.currentPlan')}
                      </Button>
                    );
                  }
                  
                  // Phase 2: Downgrade - open platform subscriptions
                  if ('isDowngrade' in buttonConfig && buttonConfig.isDowngrade) {
                    return (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleOpenPlatformSubscriptions}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {buttonConfig.text}
                      </Button>
                    );
                  }
                  
                  // Upgrade or processing
                  return (
                    <Button
                      variant={buttonConfig.variant}
                      className="w-full"
                      onClick={() => isPurchasable && handlePurchase(key)}
                      disabled={buttonConfig.disabled || isProcessing || !isAvailable}
                    >
                      {(isProcessing || buttonConfig.isActivating) && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {buttonConfig.text}
                    </Button>
                  );
                })()}
              </div>
            );
          })}
        </div>

        {/* Phase 2: Downgrade messaging */}
        {activeTier !== 'free' && (
          <Alert className="border-muted bg-muted/50">
            <AlertDescription className="text-sm text-muted-foreground">
              To downgrade or cancel, tap "Change Plan" or manage your subscription in{' '}
              {isIOS ? 'App Store' : 'Google Play'} settings. Changes take effect at the end of your billing period.
            </AlertDescription>
          </Alert>
        )}

        {/* Phase 4: Optimistic success message with refresh option */}
        {optimisticTier && (
          <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <SubscriptionStatusBadge status="activating" />
            <span className="text-sm text-green-700">
              Your {optimisticTier.charAt(0).toUpperCase() + optimisticTier.slice(1)} plan is being activated...
            </span>
          </div>
        )}

        {/* Status messages with refresh hint */}
        {state.isPolling && (
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground animate-pulse">
              Confirming your subscription with the {isDespiaIOS() ? 'App Store' : 'Play Store'}...
            </div>
            <p className="text-xs text-muted-foreground">
              This usually takes a few seconds. If it takes longer, go to Settings → Subscription and tap "Refresh Purchase Status".
            </p>
          </div>
        )}

        {state.error && (
          <div className="text-center text-sm text-destructive">
            {state.error}
          </div>
        )}

        {!isAvailable && (
          <div className="text-center text-sm text-muted-foreground">
            In-app purchases are only available in the mobile app.
          </div>
        )}

        {/* Legal disclosure - required by iOS App Store */}
        <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
          By continuing, you agree to our{" "}
          <button 
            onClick={() => window.open(`${window.location.origin}/terms`, '_blank', 'noopener,noreferrer')}
            className="text-primary hover:underline"
          >
            Terms of Use (EULA)
          </button>
          {" "}and{" "}
          <button 
            onClick={() => window.open(`${window.location.origin}/privacy`, '_blank', 'noopener,noreferrer')}
            className="text-primary hover:underline"
          >
            Privacy Policy
          </button>
        </p>
      </CardContent>
    </Card>
  );
};

export default NativeSubscriptionButtons;
