import { SUBSCRIPTION_TIERS, TierKey, BillingInterval } from "@/lib/stripe-config";
import { formatCurrency, convertPlatformPriceForDisplay } from "@/lib/currency";
import { Separator } from "@/components/ui/separator";
import { useCountryContext } from "@/contexts/CountryContext";

interface PriceSummaryProps {
  tier: TierKey;
  billingInterval: BillingInterval;
}

export function PriceSummary({ tier, billingInterval }: PriceSummaryProps) {
  const { countryCode } = useCountryContext();
  const tierData = SUBSCRIPTION_TIERS[tier];
  const priceGBP = billingInterval === "monthly" 
    ? tierData.prices.monthly.amount 
    : tierData.prices.yearly.amount;
  
  const converted = convertPlatformPriceForDisplay(priceGBP, countryCode);
  const billingText = billingInterval === "monthly" 
    ? "Billed monthly" 
    : "Billed annually";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Subscribe to FitConnect {tierData.name}
        </h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {formatCurrency(converted.amount, converted.currency)}{" "}
          <span className="text-base font-normal text-gray-500">
            per {billingInterval === "monthly" ? "month" : "year"}
          </span>
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-900">FitConnect {tierData.name}</p>
            <p className="text-sm text-gray-500">{billingText}</p>
          </div>
          <p className="font-semibold text-gray-900">{formatCurrency(converted.amount, converted.currency)}</p>
        </div>
        
        <Separator className="bg-gray-200" />
        
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Subtotal</p>
          <p className="font-medium text-gray-900">{formatCurrency(converted.amount, converted.currency)}</p>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Tax</p>
          <p className="text-sm text-gray-500">Calculated at checkout</p>
        </div>
        
        <Separator className="bg-gray-200" />
        
        <div className="flex justify-between items-center">
          <p className="font-semibold text-gray-900">Total due today</p>
          <p className="font-bold text-gray-900 text-lg">{formatCurrency(converted.amount, converted.currency)}</p>
        </div>
      </div>

      {billingInterval === "yearly" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800 font-medium">
            🎉 You're saving {formatCurrency(convertPlatformPriceForDisplay(tierData.prices.yearly.savings, countryCode).amount, converted.currency)} with annual billing!
          </p>
        </div>
      )}
    </div>
  );
}
