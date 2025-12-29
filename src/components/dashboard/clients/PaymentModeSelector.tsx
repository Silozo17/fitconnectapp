import { CreditCard, Gift, Package } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";

export type PaymentMode = "free" | "use_credits" | "paid";

interface PaymentModeSelectorProps {
  value: PaymentMode;
  onChange: (value: PaymentMode) => void;
  price: string;
  onPriceChange: (value: string) => void;
  currency?: string;
  creditsAvailable: number;
  hasActivePackage: boolean;
  packageName?: string;
  disabled?: boolean;
}

export function PaymentModeSelector({
  value,
  onChange,
  price,
  onPriceChange,
  currency = "GBP",
  creditsAvailable,
  hasActivePackage,
  packageName,
  disabled = false,
}: PaymentModeSelectorProps) {
  const { t } = useTranslation("coach");
  
  const currencySymbol = currency === "GBP" ? "£" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency;

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{t("scheduleSession.paymentMode.title", "Payment Mode")}</Label>
      
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as PaymentMode)}
        className="space-y-3"
        disabled={disabled}
      >
        {/* Free Option */}
        <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
          value === "free" ? "border-primary bg-primary/5" : "border-border"
        }`}>
          <RadioGroupItem value="free" id="payment-free" className="mt-0.5" />
          <div className="flex-1">
            <Label htmlFor="payment-free" className="cursor-pointer flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              <span className="font-medium">{t("scheduleSession.paymentMode.free", "Free Session")}</span>
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              {t("scheduleSession.paymentMode.freeDescription", "No charge for this session")}
            </p>
          </div>
        </div>

        {/* Use Credits Option */}
        <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
          value === "use_credits" ? "border-primary bg-primary/5" : "border-border"
        } ${!hasActivePackage ? "opacity-50" : ""}`}>
          <RadioGroupItem 
            value="use_credits" 
            id="payment-credits" 
            className="mt-0.5"
            disabled={!hasActivePackage || creditsAvailable <= 0}
          />
          <div className="flex-1">
            <Label 
              htmlFor="payment-credits" 
              className={`cursor-pointer flex items-center gap-2 ${!hasActivePackage ? "cursor-not-allowed" : ""}`}
            >
              <Package className="h-4 w-4 text-primary" />
              <span className="font-medium">{t("scheduleSession.paymentMode.useCredits", "Use Package Credits")}</span>
              {hasActivePackage && (
                <Badge variant="secondary" className="ml-2">
                  {creditsAvailable} {t("scheduleSession.paymentMode.remaining", "remaining")}
                </Badge>
              )}
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              {hasActivePackage 
                ? t("scheduleSession.paymentMode.useCreditsDescription", `Deduct 1 credit from "${packageName}"`, { packageName })
                : t("scheduleSession.paymentMode.noCreditsAvailable", "Client has no package credits")}
            </p>
          </div>
        </div>

        {/* Paid Option */}
        <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
          value === "paid" ? "border-primary bg-primary/5" : "border-border"
        }`}>
          <RadioGroupItem value="paid" id="payment-paid" className="mt-0.5" />
          <div className="flex-1">
            <Label htmlFor="payment-paid" className="cursor-pointer flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="font-medium">{t("scheduleSession.paymentMode.paid", "Paid Session")}</span>
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              {t("scheduleSession.paymentMode.paidDescription", "Client will receive payment request")}
            </p>
            
            {value === "paid" && (
              <div className="mt-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => onPriceChange(e.target.value)}
                  className="pl-8"
                  disabled={disabled}
                />
              </div>
            )}
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
