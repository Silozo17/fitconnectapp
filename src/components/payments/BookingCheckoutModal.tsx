import { Suspense } from "react";
import { X, Calendar, Clock, Video, MapPin, CreditCard, Banknote } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedEmbeddedCheckout, CheckoutLoading } from "./UnifiedEmbeddedCheckout";

interface BookingCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionType: {
    id: string;
    name: string;
    price: number;
    currency?: string;
    duration_minutes: number;
    payment_required?: string;
    deposit_type?: string;
    deposit_value?: number;
  };
  coach: {
    id: string;
    display_name: string | null;
    currency?: string | null;
  };
  bookingDetails: {
    requestedAt: Date;
    requestedTime: string;
    isOnline: boolean;
    message?: string;
  };
  amountDue: number;
  depositAmount?: number;
  remainingBalance?: number;
}

// Format currency
const formatCurrency = (amount: number, currency: string = 'GBP'): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
};

export function BookingCheckoutModal({
  open,
  onOpenChange,
  sessionType,
  coach,
  bookingDetails,
  amountDue,
  depositAmount,
  remainingBalance,
}: BookingCheckoutModalProps) {
  const { t } = useTranslation('booking');
  const currency = sessionType.currency || coach.currency || 'GBP';
  const paymentRequired = sessionType.payment_required || 'full';
  const isDeposit = paymentRequired === 'deposit';

  const successUrl = `${window.location.origin}/dashboard/client/sessions?booking=success`;
  const cancelUrl = `${window.location.origin}/dashboard/client/coaches?booking=cancelled`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto p-0">
        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* Left Side - Booking Summary (Dark) */}
          <div className="w-full lg:w-2/5 bg-[#0D0D14] p-6 text-white">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-white text-xl">
                {t('bookSession.confirmPayment', 'Confirm Payment')}
              </DialogTitle>
            </DialogHeader>

            {/* Session Info */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {t('bookSession.summary.session', 'Session')}
                </p>
                <p className="font-semibold text-lg">{sessionType.name}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {t('bookSession.summary.coach', 'Coach')}
                </p>
                <p className="font-medium">{coach.display_name}</p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{format(bookingDetails.requestedAt, "EEE, MMM d")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{bookingDetails.requestedTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                {bookingDetails.isOnline ? (
                  <>
                    <Video className="h-4 w-4 text-primary" />
                    <span>{t('bookSession.online', 'Online Session')}</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{t('bookSession.inPerson', 'In-Person')}</span>
                  </>
                )}
                <Badge variant="secondary" className="ml-auto text-xs">
                  {sessionType.duration_minutes} {t('time.minutes', 'min')}
                </Badge>
              </div>

              {/* Payment Breakdown */}
              <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('bookSession.summary.sessionPrice', 'Session Price')}</span>
                  <span>{formatCurrency(sessionType.price, currency)}</span>
                </div>

                {isDeposit && depositAmount !== undefined && (
                  <>
                    <div className="flex justify-between text-amber-400">
                      <span className="flex items-center gap-1">
                        <Banknote className="h-4 w-4" />
                        {t('bookSession.summary.depositDueNow', 'Deposit Due Now')}
                      </span>
                      <span className="font-bold">{formatCurrency(depositAmount, currency)}</span>
                    </div>
                    {remainingBalance !== undefined && remainingBalance > 0 && (
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{t('bookSession.summary.remainingAtSession', 'Remaining at session')}</span>
                        <span>{formatCurrency(remainingBalance, currency)}</span>
                      </div>
                    )}
                  </>
                )}

                {!isDeposit && (
                  <div className="flex justify-between text-emerald-400 text-lg font-bold pt-2 border-t border-white/10">
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      {t('bookSession.summary.payNow', 'Pay Now')}
                    </span>
                    <span>{formatCurrency(amountDue, currency)}</span>
                  </div>
                )}

                {isDeposit && (
                  <div className="flex justify-between text-amber-400 text-lg font-bold pt-2 border-t border-white/10">
                    <span>{t('bookSession.summary.payNow', 'Pay Now')}</span>
                    <span>{formatCurrency(amountDue, currency)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Stripe Checkout (Light) */}
          <div className="w-full lg:w-3/5 bg-white p-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 lg:hidden"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            <Suspense fallback={<CheckoutLoading />}>
              <UnifiedEmbeddedCheckout
                checkoutType="booking"
                itemId={sessionType.id}
                coachId={coach.id}
                successUrl={successUrl}
                cancelUrl={cancelUrl}
                bookingDetails={{
                  sessionTypeId: sessionType.id,
                  requestedAt: bookingDetails.requestedAt.toISOString(),
                  durationMinutes: sessionType.duration_minutes,
                  isOnline: bookingDetails.isOnline,
                  message: bookingDetails.message,
                }}
              />
            </Suspense>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BookingCheckoutModal;
