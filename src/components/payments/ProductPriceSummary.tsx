import { CheckoutItem } from "@/hooks/useCheckoutItem";
import { formatCurrency, CurrencyCode } from "@/lib/currency";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useExchangeRates } from "@/hooks/useExchangeRates";

interface ProductPriceSummaryProps {
  item: CheckoutItem;
}

export function ProductPriceSummary({ item }: ProductPriceSummaryProps) {
  const { convertForViewer } = useExchangeRates();
  const isRecurring = item.type === "subscription";
  const billingText = isRecurring 
    ? `Billed ${item.billingPeriod === "monthly" ? "monthly" : item.billingPeriod === "weekly" ? "weekly" : "annually"}`
    : "One-time payment";
  
  const itemCurrency = (item.currency || "GBP") as CurrencyCode;
  const convertedPrice = convertForViewer(item.price, itemCurrency);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {item.name}
        </h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {formatCurrency(convertedPrice.amount, convertedPrice.currency)}{" "}
          {isRecurring && (
            <span className="text-base font-normal text-gray-500">
              per {item.billingPeriod === "monthly" ? "month" : item.billingPeriod === "weekly" ? "week" : "year"}
            </span>
          )}
        </p>
        {convertedPrice.wasConverted && (
          <p className="text-sm text-gray-500 mt-1">
            Original: {formatCurrency(convertedPrice.originalAmount, convertedPrice.originalCurrency)}
          </p>
        )}
      </div>

      {item.coach && (
        <div className="flex items-center gap-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={item.coach.profileImageUrl || undefined} alt={item.coach.displayName} />
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
              {item.coach.displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-gray-500">Created by</p>
            <p className="text-sm font-medium text-gray-900">{item.coach.displayName}</p>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-500">{billingText}</p>
          </div>
          <p className="font-semibold text-gray-900">
            {formatCurrency(convertedPrice.amount, convertedPrice.currency)}
          </p>
        </div>
        
        <Separator className="bg-gray-200" />
        
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Subtotal</p>
          <p className="font-medium text-gray-900">
            {formatCurrency(convertedPrice.amount, convertedPrice.currency)}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Tax</p>
          <p className="text-sm text-gray-500">Calculated at checkout</p>
        </div>
        
        <Separator className="bg-gray-200" />
        
        <div className="flex justify-between items-center">
          <p className="font-semibold text-gray-900">Total due today</p>
          <div className="text-right">
            <p className="font-bold text-gray-900 text-lg">
              {formatCurrency(convertedPrice.amount, convertedPrice.currency)}
            </p>
            {convertedPrice.wasConverted && (
              <p className="text-xs text-gray-500">
                Charged in {formatCurrency(convertedPrice.originalAmount, convertedPrice.originalCurrency)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
