import { Link } from "react-router-dom";
import { Lock, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureKey, FEATURE_NAMES, FEATURE_DESCRIPTIONS } from "@/lib/feature-config";
import { TierKey, SUBSCRIPTION_TIERS } from "@/lib/stripe-config";
import { useActivePricing } from "@/hooks/useActivePricing";
import { useNativePricing } from "@/hooks/useNativePricing";
import { useNativeIAP, SubscriptionTier } from "@/hooks/useNativeIAP";
import { usePlatformRestrictions } from "@/hooks/usePlatformRestrictions";

interface LockedFeatureCardProps {
  feature: FeatureKey;
  requiredTier: TierKey;
  className?: string;
}

export const LockedFeatureCard = ({ feature, requiredTier, className }: LockedFeatureCardProps) => {
  const tierConfig = SUBSCRIPTION_TIERS[requiredTier];
  const featureName = FEATURE_NAMES[feature];
  const featureDescription = FEATURE_DESCRIPTIONS[feature];
  
  // Platform detection and pricing
  const { isNativeMobile } = usePlatformRestrictions();
  const webPricing = useActivePricing();
  const nativePricing = useNativePricing();
  const pricing = isNativeMobile ? nativePricing : webPricing;
  
  // Native IAP hook
  const { purchase: nativePurchase, state: iapState } = useNativeIAP();
  
  const isPricedTier = ['starter', 'pro', 'enterprise'].includes(requiredTier);
  const monthlyPrice = isPricedTier 
    ? pricing.getSubscriptionPrice(requiredTier as SubscriptionTier, 'monthly')
    : tierConfig.prices.monthly.amount;

  const handleNativeUpgrade = () => {
    if (isPricedTier) {
      nativePurchase(requiredTier as SubscriptionTier, 'monthly');
    }
  };

  const isPurchasing = iapState.purchaseStatus === 'purchasing' || iapState.isPolling;
  
  return (
    <Card className={`border-dashed border-2 border-muted-foreground/30 bg-muted/20 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{featureName}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {featureDescription}
        </p>
        
        <div className="bg-primary/10 rounded-lg px-4 py-2 mb-6">
          <p className="text-sm">
            <span className="text-muted-foreground">Available on </span>
            <span className="font-semibold text-primary">{tierConfig.name}</span>
            {monthlyPrice > 0 && (
              <span className="text-muted-foreground"> ({pricing.formatPrice(monthlyPrice)}/month)</span>
            )}
          </p>
        </div>
        
        {isNativeMobile && isPricedTier ? (
          <Button 
            onClick={handleNativeUpgrade}
            disabled={isPurchasing}
            className="gap-2"
          >
            {isPurchasing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Upgrade to {tierConfig.name}
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Link to="/subscribe">
            <Button className="gap-2">
              <Sparkles className="w-4 h-4" />
              Upgrade to {tierConfig.name}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
        
        <a 
          href="/pricing" 
          className="text-xs text-muted-foreground underline hover:text-primary mt-3"
        >
          View all plan features
        </a>
      </CardContent>
    </Card>
  );
};

// Smaller inline locked badge for sidebar items
export const LockedBadge = () => (
  <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
);
