import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/contexts/LocaleContext";
import { getSupportedCurrencies, CurrencyCode } from "@/lib/currency";
import { Globe } from "lucide-react";

interface CurrencySelectorProps {
  showLabel?: boolean;
  className?: string;
}

export function CurrencySelector({ showLabel = true, className }: CurrencySelectorProps) {
  const { currency, setCurrency } = useLocale();
  const currencies = getSupportedCurrencies();

  return (
    <div className={className}>
      {showLabel && (
        <Label className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4" />
          Currency
        </Label>
      )}
      <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyCode)}>
        <SelectTrigger>
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((curr) => (
            <SelectItem key={curr.code} value={curr.code}>
              {curr.symbol} {curr.code} - {curr.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
