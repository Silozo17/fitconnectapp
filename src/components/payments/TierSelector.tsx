import { cn } from "@/lib/utils";
import { SUBSCRIPTION_TIERS, TierKey } from "@/lib/stripe-config";
import { Check } from "lucide-react";

interface TierSelectorProps {
  selectedTier: TierKey;
  onTierChange: (tier: TierKey) => void;
}

export function TierSelector({ selectedTier, onTierChange }: TierSelectorProps) {
  // Exclude free tier from selector since you can't subscribe to it
  const paidTiers = (Object.keys(SUBSCRIPTION_TIERS) as TierKey[]).filter(key => key !== "free");

  return (
    <div className="flex gap-2 p-1 bg-background/20 rounded-lg border border-border/30">
      {paidTiers.map((tier) => {
        const isSelected = selectedTier === tier;
        const tierData = SUBSCRIPTION_TIERS[tier];
        
        return (
          <button
            key={tier}
            onClick={() => onTierChange(tier)}
            className={cn(
              "relative px-6 py-3 rounded-md text-sm font-medium transition-all duration-200",
              isSelected
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-background/30"
            )}
          >
            {tierData.name}
            {tierData.highlighted && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold bg-accent text-accent-foreground rounded-full">
                POPULAR
              </span>
            )}
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
