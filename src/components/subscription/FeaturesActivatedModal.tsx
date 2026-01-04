import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Zap, Star } from "lucide-react";
import { SUBSCRIPTION_TIERS, TierKey } from "@/lib/stripe-config";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface FeaturesActivatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: TierKey;
}

// Map tier icons for display
const TIER_ICONS: Record<TierKey, typeof Crown> = {
  free: Sparkles,
  starter: Zap,
  pro: Star,
  enterprise: Crown,
  founder: Crown,
};

// Get tier-specific styling
const getTierStyle = (tier: TierKey) => {
  switch (tier) {
    case 'enterprise':
    case 'founder':
      return {
        gradient: "from-amber-500 via-orange-500 to-red-500",
        iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      };
    case 'pro':
      return {
        gradient: "from-blue-500 via-purple-500 to-pink-500",
        iconBg: "bg-gradient-to-br from-blue-500 to-purple-600",
      };
    case 'starter':
      return {
        gradient: "from-emerald-500 via-teal-500 to-cyan-500",
        iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      };
    default:
      return {
        gradient: "from-primary to-primary/80",
        iconBg: "bg-primary",
      };
  }
};

export const FeaturesActivatedModal = ({
  isOpen,
  onClose,
  tier,
}: FeaturesActivatedModalProps) => {
  const { t: tPages } = useTranslation("pages");
  const tierConfig = SUBSCRIPTION_TIERS[tier];
  const style = getTierStyle(tier);
  const Icon = TIER_ICONS[tier];
  
  // Translate feature keys to readable labels
  const translateFeature = (featureKey: string): string => {
    const match = featureKey.match(/^pricing\.tierFeatures\.(.+)$/);
    if (match) {
      return tPages(`pricing.tierFeatures.${match[1]}`);
    }
    return featureKey;
  };

  // Get features to display (use featureKeys for translation, limit to 6)
  const features = tierConfig?.featureKeys?.slice(0, 6) || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          {/* Celebration header */}
          <div className="flex justify-center">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center shadow-lg",
              style.iconBg
            )}>
              <Icon className="h-10 w-10 text-white" />
            </div>
          </div>
          
          {/* Headline */}
          <DialogTitle className="text-2xl font-bold text-center">
            🎉 Congratulations! 🎉
          </DialogTitle>
          
          {/* Tier badge */}
          <div className="flex justify-center">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-sm px-4 py-1 font-semibold",
                "bg-gradient-to-r text-white",
                style.gradient
              )}
            >
              {tierConfig?.name || tier} Active!
            </Badge>
          </div>
          
          <DialogDescription className="text-center text-muted-foreground">
            Your subscription is now active
          </DialogDescription>
        </DialogHeader>

        {/* Features list */}
        {features.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>New Features Activated 👇</span>
            </div>
            <ul className="space-y-2">
              {features.map((featureKey, index) => (
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
            Let's go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeaturesActivatedModal;
