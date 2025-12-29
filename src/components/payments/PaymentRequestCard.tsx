import { format } from "date-fns";
import { Calendar, Clock, MapPin, Video, CreditCard, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { PendingPaymentSession } from "@/hooks/usePendingPayments";

interface PaymentRequestCardProps {
  session: PendingPaymentSession;
  onPayClick: (sessionId: string) => void;
  onDeclineClick: (sessionId: string) => void;
}

export function PaymentRequestCard({ session, onPayClick, onDeclineClick }: PaymentRequestCardProps) {
  const { t } = useTranslation("client");
  const [isLoading, setIsLoading] = useState<"pay" | "decline" | null>(null);

  const coach = session.coach_profiles;
  const coachName = coach?.display_name || coach?.username || "Coach";
  const coachInitials = coachName.slice(0, 2).toUpperCase();
  const coachAvatarUrl = coach?.profile_image_url;

  const currencySymbol = session.currency === "GBP" ? "£" : 
    session.currency === "USD" ? "$" : 
    session.currency === "EUR" ? "€" : session.currency;

  const handlePay = async () => {
    setIsLoading("pay");
    try {
      await onPayClick(session.id);
    } finally {
      setIsLoading(null);
    }
  };

  const handleDecline = async () => {
    setIsLoading("decline");
    try {
      await onDeclineClick(session.id);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card className="glass-card border-warning/30 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Coach Avatar */}
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={coachAvatarUrl || undefined} alt={coachName} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {coachInitials}
            </AvatarFallback>
          </Avatar>

          {/* Session Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="font-semibold text-foreground truncate">{coachName}</h4>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 shrink-0">
                {t("pendingPayment.awaitingPayment", "Payment Required")}
              </Badge>
            </div>

            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>{format(new Date(session.scheduled_at), "EEEE, MMMM do")}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>
                  {format(new Date(session.scheduled_at), "HH:mm")} • {session.duration_minutes} min
                </span>
              </div>

              <div className="flex items-center gap-2">
                {session.is_online ? (
                  <>
                    <Video className="h-3.5 w-3.5 text-primary" />
                    <span>{t("pendingPayment.online", "Online Session")}</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate">{session.location || t("pendingPayment.inPerson", "In-Person")}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold text-foreground">
                  {currencySymbol}{session.price?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                onClick={handlePay}
                disabled={isLoading !== null}
                className="flex-1"
              >
                {isLoading === "pay" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-1.5" />
                    {t("pendingPayment.payNow", "Pay Now")}
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDecline}
                disabled={isLoading !== null}
              >
                {isLoading === "decline" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("pendingPayment.decline", "Decline")
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
