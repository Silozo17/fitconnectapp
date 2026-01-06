import { cn } from "@/lib/utils";
import { SUBSCRIPTION_TIERS, TierKey, BillingInterval } from "@/lib/stripe-config";
import { Check, Rocket, Crown, Sparkles } from "lucide-react";
import { useActivePricing } from "@/hooks/useActivePricing";

const TIER_ICONS: Record<string, React.ElementType> = {
  starter: Rocket,
  pro: Crown,
  enterprise: Sparkles,
};

interface TierSelectorProps {
  selectedTier: TierKey;
  onTierChange: (tier: TierKey) => void;
  billingInterval: BillingInterval;
  includeFreeTier?: boolean;
}

export function TierSelector({ selectedTier, onTierChange, billingInterval, includeFreeTier = false }: TierSelectorProps) {
  const pricing = useActivePricing();
  
  // Exclude admin-only tiers (like founder) from selector, optionally include free tier
  const displayTiers = (Object.keys(SUBSCRIPTION_TIERS) as TierKey[]).filter(key => {
    if (SUBSCRIPTION_TIERS[key].adminOnly) return false;
    if (key === "free" && !includeFreeTier) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      {displayTiers.map((tier) => {
        const isSelected = selectedTier === tier;
        const tierData = SUBSCRIPTION_TIERS[tier];
        const TierIcon = TIER_ICONS[tier] || Rocket;
        
        // Get price for this tier and interval
        const price = tier !== 'free' 
          ? pricing.getSubscriptionPrice(tier as 'starter' | 'pro' | 'enterprise', billingInterval)
          : 0;
        const formattedPrice = pricing.formatPrice(price);
        
        return (
          <button
            key={tier}
            onClick={() => onTierChange(tier)}
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
              isSelected
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                : "border-border/50 bg-background/20 hover:border-border"
            )}
          >
            {/* Radio indicator */}
            <div className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
              isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
            )}>
              {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
            
            {/* Icon */}
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
              isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              <TierIcon className="h-5 w-5" />
            </div>
            
            {/* Text content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-semibold",
                  isSelected ? "text-foreground" : "text-foreground/80"
                )}>
                  {tierData.name}
                </span>
                {tierData.highlighted && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-accent text-accent-foreground rounded-full">
                    POPULAR
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">{tierData.description}</p>
            </div>
            
            {/* Price */}
            <div className="text-right shrink-0">
              <span className={cn(
                "font-bold",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {formattedPrice}
              </span>
              <span className="text-sm text-muted-foreground">
                /{billingInterval === 'monthly' ? 'mo' : 'yr'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface TierFeaturesProps {
  tier: TierKey;
}

export function TierFeatures({ tier }: TierFeaturesProps) {
  const tierData = SUBSCRIPTION_TIERS[tier];
  
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">{tierData.description}</p>
      <ul className="space-y-2">
        {tierData.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span className="text-foreground/90">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
