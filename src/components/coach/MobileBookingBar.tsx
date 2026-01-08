import { MessageSquare, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";

interface MobileBookingBarProps {
  hourlyRate: number | null;
  currency: CurrencyCode;
  onMessage: () => void;
  onBook: () => void;
  isMessageLoading?: boolean;
  isClient?: boolean;
}

export function MobileBookingBar({
  hourlyRate,
  currency,
  onMessage,
  onBook,
  isMessageLoading,
  isClient,
}: MobileBookingBarProps) {
  if (!isClient) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden z-50">
      {/* Glassmorphic background */}
      <div className="glass-nav border-t border-border/50 px-4 py-3 pb-safe-bottom">
        <div className="flex items-center gap-3">
          {/* Price */}
          <div className="flex-shrink-0">
            {hourlyRate ? (
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(hourlyRate, currency)}
                <span className="text-xs text-muted-foreground font-normal">/session</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Contact for pricing</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex-1 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl h-10"
              onClick={onMessage}
              disabled={isMessageLoading}
            >
              {isMessageLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              <span className="ml-1.5 hidden sm:inline">Message</span>
            </Button>
            <Button
              size="sm"
              className="flex-1 rounded-xl h-10"
              onClick={onBook}
            >
              <Calendar className="h-4 w-4" />
              <span className="ml-1.5">Book</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
