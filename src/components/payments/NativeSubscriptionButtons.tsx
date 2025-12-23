import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Check, Loader2, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useNativeIAP, SubscriptionTier, BillingInterval } from '@/hooks/useNativeIAP';
import { isDespia } from '@/lib/despia';
import { SUBSCRIPTION_TIERS, TierKey, normalizeTier, getTierPosition } from '@/lib/stripe-config';
import { useActivePricing } from '@/hooks/useActivePricing';

interface NativeSubscriptionButtonsProps {
  currentTier?: string;
  className?: string;
}

/**
 * Native subscription buttons for in-app purchases via Despia + RevenueCat
 * Only visible when running inside the Despia native environment
 */
export const NativeSubscriptionButtons = ({
  currentTier = 'free',
  className,
}: NativeSubscriptionButtonsProps) => {
  const { t } = useTranslation('settings');
  const { t: tPages } = useTranslation('pages');
  const pricing = useActivePricing();
  const { state, purchase, isAvailable } = useNativeIAP();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');

  // Only render in Despia environment
  if (!isDespia()) {
    return null;
  }

  const activeTier = normalizeTier(currentTier);
  const currentPosition = getTierPosition(activeTier);

  const handlePurchase = async (tierKey: SubscriptionTier) => {
    await purchase(tierKey, billingInterval);
  };

  const getButtonText = (tierKey: TierKey) => {
    const targetPosition = getTierPosition(tierKey);
    if (state.isPurchasing || state.isPolling) {
      return state.isPolling ? 'Confirming...' : 'Processing...';
    }
    if (targetPosition > currentPosition) {
      return t('subscription.upgrade');
    }
    if (targetPosition < currentPosition) {
      return t('subscription.downgrade');
    }
    return t('subscription.current');
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
            const isProcessing = (state.isPurchasing || state.isPolling);
            const isPurchasable = key === 'starter' || key === 'pro' || key === 'enterprise';
            const tierPosition = getTierPosition(key);
            const canUpgrade = tierPosition > currentPosition;

            // Get price for current interval
            const price = billingInterval === 'monthly'
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
                      {billingInterval === 'monthly' ? '/month' : '/year'}
                    </div>
                    {billingInterval === 'yearly' && (
                      <div className="text-xs text-primary">
                        Save {pricing.formatPrice(pricing.getSubscriptionSavings(key))}
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

                {isCurrentTier ? (
                  <Button variant="outline" className="w-full" disabled>
                    {t('subscription.currentPlan')}
                  </Button>
                ) : (
                  <Button
                    variant={canUpgrade ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => isPurchasable && handlePurchase(key)}
                    disabled={isProcessing || !isAvailable}
                  >
                    {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {getButtonText(key)}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Status messages */}
        {state.isPolling && (
          <div className="text-center text-sm text-muted-foreground animate-pulse">
            Confirming your subscription with the App Store...
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
      </CardContent>
    </Card>
  );
};

export default NativeSubscriptionButtons;
