import { cn } from "@/lib/utils";
import { SUBSCRIPTION_TIERS, TierKey, BillingInterval } from "@/lib/stripe-config";
import { formatCurrency } from "@/lib/currency";

interface BillingToggleProps {
  selectedTier: TierKey;
  billingInterval: BillingInterval;
  onIntervalChange: (interval: BillingInterval) => void;
}

export function BillingToggle({ selectedTier, billingInterval, onIntervalChange }: BillingToggleProps) {
  const tierData = SUBSCRIPTION_TIERS[selectedTier];
  const monthlyPrice = tierData.prices.monthly.amount;
  const yearlyData = tierData.prices.yearly;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Monthly Option */}
      <button
        onClick={() => onIntervalChange("monthly")}
        className={cn(
          "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
          billingInterval === "monthly"
            ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
            : "border-border/50 bg-background/20 hover:border-border"
        )}
      >
        <div className="space-y-2">
          <p className="font-semibold text-foreground">Monthly</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(monthlyPrice)}
            </span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(monthlyPrice)} billed monthly
          </p>
        </div>
        {billingInterval === "monthly" && (
          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
          </div>
        )}
        {billingInterval !== "monthly" && (
          <div className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 border-border" />
        )}
      </button>

      {/* Yearly Option */}
      <button
        onClick={() => onIntervalChange("yearly")}
        className={cn(
          "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
          billingInterval === "yearly"
            ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
            : "border-border/50 bg-background/20 hover:border-border"
        )}
      >
        <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
          SAVE {formatCurrency(yearlyData.savings)}
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-foreground">Yearly</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(yearlyData.monthlyEquivalent)}
            </span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(yearlyData.amount)} billed annually
          </p>
        </div>
        {billingInterval === "yearly" && (
          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
          </div>
        )}
        {billingInterval !== "yearly" && (
          <div className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 border-border" />
        )}
      </button>
    </div>
  );
}
