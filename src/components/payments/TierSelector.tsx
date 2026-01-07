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
  /** Use "tabs" for compact horizontal layout, "radio" for vertical cards */
  variant?: "radio" | "tabs";
}

export function TierSelector({ 
  selectedTier, 
  onTierChange, 
  billingInterval, 
  includeFreeTier = false,
  variant = "radio"
}: TierSelectorProps) {
  const pricing = useActivePricing();
  
  // Exclude admin-only tiers (like founder) and free tier from selector
  const displayTiers = (Object.keys(SUBSCRIPTION_TIERS) as TierKey[]).filter(key => {
    if (SUBSCRIPTION_TIERS[key].adminOnly) return false;
    if (key === "free" && !includeFreeTier) return false;
    return true;
  });

  // Tabs variant - compact horizontal layout
  if (variant === "tabs") {
    return (
      <div className="flex rounded-xl border border-border/50 bg-background/20 p-1 gap-1">
        {displayTiers.map((tier) => {
          const isSelected = selectedTier === tier;
          const tierData = SUBSCRIPTION_TIERS[tier];
          const TierIcon = TIER_ICONS[tier] || Rocket;
          
          return (
            <button
              key={tier}
              onClick={() => onTierChange(tier)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all font-medium text-sm",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <TierIcon className="h-4 w-4" />
              <span>{tierData.name}</span>
              {tierData.highlighted && !isSelected && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-accent text-accent-foreground rounded-full">
                  ★
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Radio variant - vertical cards (default)
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
  /** Limit the number of features shown */
  maxFeatures?: number;
}

export function TierFeatures({ tier, maxFeatures }: TierFeaturesProps) {
  const tierData = SUBSCRIPTION_TIERS[tier];
  const features = maxFeatures ? tierData.features.slice(0, maxFeatures) : tierData.features;
  
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">{tierData.description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span className="text-foreground/90">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
