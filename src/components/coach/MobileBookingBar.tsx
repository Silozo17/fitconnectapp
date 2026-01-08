import { MessageSquare, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";

interface MobileBookingCardProps {
  hourlyRate: number | null;
  currency: CurrencyCode;
  onMessage: () => void;
  onBook: () => void;
  isMessageLoading?: boolean;
  isClient?: boolean;
}

export function MobileBookingCard({
  hourlyRate,
  currency,
  onMessage,
  onBook,
  isMessageLoading,
  isClient,
}: MobileBookingCardProps) {
  if (!isClient) return null;

  return (
    <Card className="lg:hidden rounded-3xl shadow-lg border-border/50 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl">
      <CardContent className="p-5">
        {/* Price Display */}
        <div className="text-center mb-4 pb-4 border-b border-border/50">
          {hourlyRate ? (
            <>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(hourlyRate, currency)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">per session</p>
            </>
          ) : (
            <p className="text-muted-foreground">Contact for pricing</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-12"
            onClick={onMessage}
            disabled={isMessageLoading}
          >
            {isMessageLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
            <span className="ml-2">Message</span>
          </Button>
          <Button
            className="flex-1 rounded-xl h-12"
            onClick={onBook}
          >
            <Calendar className="h-4 w-4" />
            <span className="ml-2">Book</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
