import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown } from "lucide-react";
import { SUBSCRIPTION_TIERS, TierKey } from "@/lib/stripe-config";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface UpgradeSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newTier: TierKey;
  previousTier: TierKey;
}

/**
 * Get features that are newly unlocked by upgrading from previousTier to newTier
 */
const getUnlockedFeatures = (newTier: TierKey, previousTier: TierKey): string[] => {
  const newTierConfig = SUBSCRIPTION_TIERS[newTier];
  const prevTierConfig = SUBSCRIPTION_TIERS[previousTier];
  
  if (!newTierConfig || !prevTierConfig) return [];
  
  // Get feature keys unique to the new tier (not in previous tier)
  const previousFeatureKeys = new Set(prevTierConfig.featureKeys);
  const newFeatureKeys = newTierConfig.featureKeys.filter(
    key => !previousFeatureKeys.has(key)
  );
  
  // Map feature keys to readable labels
  return newFeatureKeys.slice(0, 6); // Limit to 6 for UI
};

/**
 * Get tier-specific celebration messaging
 */
const getTierCelebration = (tier: TierKey) => {
  switch (tier) {
    case 'enterprise':
      return {
        emoji: '🚀',
        headline: "You're now an Elite Coach!",
        subtitle: "Unlimited clients and premium features unlocked",
        gradient: "from-amber-500 via-orange-500 to-red-500",
      };
    case 'pro':
      return {
        emoji: '⭐',
        headline: "Welcome to Pro!",
        subtitle: "Advanced tools to scale your coaching business",
        gradient: "from-blue-500 via-purple-500 to-pink-500",
      };
    case 'starter':
      return {
        emoji: '🎉',
        headline: "Welcome to Starter!",
        subtitle: "Your coaching journey begins now",
        gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      };
    default:
      return {
        emoji: '✨',
        headline: "Upgrade Complete!",
        subtitle: "Enjoy your new features",
        gradient: "from-primary to-primary/80",
      };
  }
};

export const UpgradeSuccessDialog = ({
  isOpen,
  onClose,
  newTier,
  previousTier,
}: UpgradeSuccessDialogProps) => {
  const { t: tPages } = useTranslation("pages");
  const tierConfig = SUBSCRIPTION_TIERS[newTier];
  const celebration = getTierCelebration(newTier);
  const unlockedFeatures = getUnlockedFeatures(newTier, previousTier);
  
  // Translate feature keys to readable labels
  const translateFeature = (featureKey: string): string => {
    const match = featureKey.match(/^pricing\.tierFeatures\.(.+)$/);
    if (match) {
      return tPages(`pricing.tierFeatures.${match[1]}`);
    }
    return featureKey;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          {/* Celebration emoji */}
          <div className="flex justify-center">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center text-4xl",
              "bg-gradient-to-br shadow-lg",
              celebration.gradient
            )}>
              <Crown className="h-10 w-10 text-white" />
            </div>
          </div>
          
          {/* Headline */}
          <DialogTitle className="text-2xl font-bold text-center">
            {celebration.emoji} {celebration.headline}
          </DialogTitle>
          
          {/* Tier badge */}
          <div className="flex justify-center">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-sm px-4 py-1 font-semibold",
                "bg-gradient-to-r text-white",
                celebration.gradient
              )}
            >
              {tierConfig?.name || newTier} Plan
            </Badge>
          </div>
          
          <DialogDescription className="text-center text-muted-foreground">
            {celebration.subtitle}
          </DialogDescription>
        </DialogHeader>

        {/* Unlocked features */}
        {unlockedFeatures.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>What's now unlocked:</span>
            </div>
            <ul className="space-y-2">
              {unlockedFeatures.map((featureKey, index) => (
                <li 
                  key={index}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span>{translateFeature(featureKey)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-6">
          <Button 
            onClick={onClose} 
            className="w-full"
            size="lg"
          >
            Start Exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeSuccessDialog;
