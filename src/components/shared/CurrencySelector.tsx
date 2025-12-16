import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/contexts/LocaleContext";
import { getSupportedCurrencies, CurrencyCode } from "@/lib/currency";
import { Globe } from "lucide-react";

interface CurrencySelectorProps {
  showLabel?: boolean;
  className?: string;
  /** Optional controlled value - if provided, uses this instead of locale context */
  value?: string;
  /** Optional onChange handler for controlled mode */
  onChange?: (value: string) => void;
}

export function CurrencySelector({ showLabel = true, className, value, onChange }: CurrencySelectorProps) {
  const { currency, setCurrency } = useLocale();
  const currencies = getSupportedCurrencies();

  // Use controlled value if provided, otherwise use locale context
  const currentValue = value !== undefined ? value : currency;
  const handleChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    } else {
      setCurrency(newValue as CurrencyCode);
    }
  };

  return (
    <div className={className}>
      {showLabel && (
        <Label className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4" />
          Currency
        </Label>
      )}
      <Select value={currentValue} onValueChange={handleChange}>
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
