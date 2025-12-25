import { useState, useMemo } from "react";
import { format, setHours, setMinutes, parseISO } from "date-fns";
import { Calendar, Clock, Video, MapPin, MessageSquare, Loader2, CreditCard, Banknote } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useCoachAvailability, useSessionTypes, useCreateBookingRequest, SessionType } from "@/hooks/useCoachSchedule";
import AvailabilityCalendar from "./AvailabilityCalendar";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import BookingCheckoutModal from "@/components/payments/BookingCheckoutModal";

interface BookSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coach: {
    id: string;
    display_name: string | null;
    booking_mode?: string | null;
    hourly_rate?: number | null;
    currency?: string | null;
  };
  onMessageFirst?: () => void;
}

// Helper to calculate deposit amount
const calculateDepositAmount = (sessionType: SessionType): number => {
  if (sessionType.payment_required !== 'deposit') return 0;
  
  if (sessionType.deposit_type === 'percentage') {
    return Math.round(sessionType.price * (sessionType.deposit_value || 0) / 100 * 100) / 100;
  }
  return sessionType.deposit_value || 0;
};

// Helper to get amount due now
const getAmountDueNow = (sessionType: SessionType): number => {
  if (sessionType.payment_required === 'none') return 0;
  if (sessionType.payment_required === 'full') return sessionType.price;
  return calculateDepositAmount(sessionType);
};

// Format currency
const formatCurrency = (amount: number, currency: string = 'GBP'): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
};

const BookSessionModal = ({ open, onOpenChange, coach, onMessageFirst }: BookSessionModalProps) => {
  const { t } = useTranslation('booking');
  const [step, setStep] = useState<"type" | "datetime" | "details">("type");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bypassMessageFirst, setBypassMessageFirst] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const { user } = useAuth();
  const { data: availability = [] } = useCoachAvailability(coach.id);
  const { data: sessionTypes = [] } = useSessionTypes(coach.id);
  const createBooking = useCreateBookingRequest();

  // Fetch existing booked sessions for this coach
  const { data: bookedSessions = [] } = useQuery({
    queryKey: ["coach-booked-sessions", coach.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select("scheduled_at, duration_minutes")
        .eq("coach_id", coach.id)
        .in("status", ["scheduled", "confirmed"])
        .gte("scheduled_at", new Date().toISOString());

      if (error) throw error;

      return (data || []).map((session) => ({
        date: session.scheduled_at.split("T")[0],
        time: format(parseISO(session.scheduled_at), "HH:mm"),
        duration_minutes: session.duration_minutes,
      }));
    },
    enabled: open,
  });

  const selectedSessionType = sessionTypes.find(t => t.id === selectedType);
  const isMessageFirst = coach.booking_mode === "message_first";
  const currency = selectedSessionType?.currency || coach.currency || 'GBP';

  // Determine effective isOnline value based on session type
  const effectiveIsOnline = useMemo(() => {
    if (!selectedSessionType) return true;
    
    // If user has explicitly set a value, use it
    if (isOnline !== null) return isOnline;
    
    // Auto-determine based on session type capabilities
    if (selectedSessionType.is_online && !selectedSessionType.is_in_person) {
      return true; // Only online available
    }
    if (!selectedSessionType.is_online && selectedSessionType.is_in_person) {
      return false; // Only in-person available
    }
    // Both available, default to online
    return true;
  }, [selectedSessionType, isOnline]);

  // Calculate payment info
  const paymentRequired = selectedSessionType?.payment_required || 'none';
  const amountDueNow = selectedSessionType ? getAmountDueNow(selectedSessionType) : 0;
  const depositAmount = selectedSessionType ? calculateDepositAmount(selectedSessionType) : 0;
  const remainingBalance = paymentRequired === 'deposit' ? (selectedSessionType?.price || 0) - depositAmount : 0;

  const handleSlotSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedSessionType) return;

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const requestedAt = setMinutes(setHours(selectedDate, hours), minutes);

    // If payment is required, show embedded checkout modal
    if (paymentRequired !== 'none' && amountDueNow > 0) {
      setShowCheckoutModal(true);
      return;
    }

    // No payment required - create booking request directly
    await createBooking.mutateAsync({
      coach_id: coach.id,
      session_type_id: selectedSessionType.id,
      requested_at: requestedAt.toISOString(),
      duration_minutes: selectedSessionType.duration_minutes,
      is_online: effectiveIsOnline,
      message: message || undefined,
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setStep("type");
    setSelectedType(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setIsOnline(null);
    setMessage("");
    setIsProcessingPayment(false);
    setBypassMessageFirst(false);
    setShowCheckoutModal(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  // If message first mode, show message prompt
  if (isMessageFirst && step === "type" && !bypassMessageFirst) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('bookSession.bookWith', { name: coach.display_name })}</DialogTitle>
            <DialogDescription>
              {t('bookSession.messageFirst.prefersChat')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-foreground">
                {t('bookSession.messageFirst.discussFirst', { name: coach.display_name })}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={() => {
                handleClose();
                onMessageFirst?.();
              }}>
                <MessageSquare className="h-4 w-4 mr-2" />
                {t('bookSession.messageFirst.startConversation')}
              </Button>
              <Button variant="outline" onClick={() => setBypassMessageFirst(true)}>
                {t('bookSession.messageFirst.viewSessionTypes')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{t('bookSession.bookWith', { name: coach.display_name })}</DialogTitle>
          <DialogDescription>
            {step === "type" && t('bookSession.steps.selectType')}
            {step === "datetime" && t('bookSession.steps.selectDateTime')}
            {step === "details" && t('bookSession.steps.reviewConfirm')}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Session Type */}
        {step === "type" && (
          <div className="space-y-4 py-4">
            {sessionTypes.length > 0 ? (
              <RadioGroup value={selectedType || ""} onValueChange={setSelectedType}>
                {sessionTypes.map((type) => {
                  const typeCurrency = type.currency || coach.currency || 'GBP';
                  const typeDepositAmount = calculateDepositAmount(type);
                  
                  return (
                    <label
                      key={type.id}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        selectedType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value={type.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">{type.name}</p>
                          <p className="font-bold text-primary">{formatCurrency(type.price, typeCurrency)}</p>
                        </div>
                        {type.description && (
                          <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {type.duration_minutes} {t('time.minutes', { count: type.duration_minutes })}
                          </Badge>
                          {type.is_online && (
                            <Badge variant="outline" className="text-xs">
                              <Video className="h-3 w-3 mr-1" />
                              {t('bookSession.online')}
                            </Badge>
                          )}
                          {type.is_in_person && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {t('bookSession.inPerson')}
                            </Badge>
                          )}
                          {/* Payment requirement badge */}
                          {type.payment_required === 'full' && (
                            <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              <CreditCard className="h-3 w-3 mr-1" />
                              {t('bookSession.badges.payUpfront')}
                            </Badge>
                          )}
                          {type.payment_required === 'deposit' && (
                            <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                              <Banknote className="h-3 w-3 mr-1" />
                              {t('bookSession.badges.deposit', { 
                                value: type.deposit_type === 'percentage' 
                                  ? `${type.deposit_value}%`
                                  : formatCurrency(typeDepositAmount, typeCurrency)
                              })}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {t('bookSession.noSessionTypes')}
                </p>
                {coach.hourly_rate && (
                  <p className="text-sm">
                    {t('bookSession.defaultRate')} <span className="font-bold text-primary">{formatCurrency(coach.hourly_rate, coach.currency || 'GBP')}{t('bookSession.perHour')}</span>
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep("datetime")} 
                disabled={!selectedType && sessionTypes.length > 0}
              >
                {t('bookSession.buttons.continue')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === "datetime" && (
          <div className="space-y-4 py-4 overflow-hidden">
            <AvailabilityCalendar
              availability={availability}
              bookedSessions={bookedSessions}
              onSelectSlot={handleSlotSelect}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              sessionDuration={selectedSessionType?.duration_minutes || 60}
            />

            {/* Online/In-Person Toggle */}
            {selectedSessionType && (selectedSessionType.is_online && selectedSessionType.is_in_person) && (
              <div className="space-y-2">
                <Label>{t('bookSession.sessionFormat')}</Label>
                <RadioGroup 
                  value={isOnline ? "online" : "in-person"} 
                  onValueChange={(v) => setIsOnline(v === "online")}
                  className="flex gap-4"
                >
                  <label className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border cursor-pointer",
                    isOnline ? "border-primary bg-primary/5" : "border-border"
                  )}>
                    <RadioGroupItem value="online" />
                    <Video className="h-4 w-4" />
                    <span>{t('bookSession.online')}</span>
                  </label>
                  <label className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border cursor-pointer",
                    !isOnline ? "border-primary bg-primary/5" : "border-border"
                  )}>
                    <RadioGroupItem value="in-person" />
                    <MapPin className="h-4 w-4" />
                    <span>{t('bookSession.inPerson')}</span>
                  </label>
                </RadioGroup>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("type")}>
                {t('bookSession.buttons.back')}
              </Button>
              <Button 
                onClick={() => setStep("details")} 
                disabled={!selectedDate || !selectedTime}
              >
                {t('bookSession.buttons.continue')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Details & Confirm */}
        {step === "details" && selectedDate && selectedTime && selectedSessionType && (
          <div className="space-y-4 py-4">
            {/* Booking Summary */}
            <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('bookSession.summary.session')}</span>
                <span className="font-medium text-foreground">{selectedSessionType.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('bookSession.summary.date')}</span>
                <span className="font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(selectedDate, "EEEE, MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('bookSession.summary.time')}</span>
                <span className="font-medium text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {selectedTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('bookSession.summary.format')}</span>
                <span className="font-medium text-foreground flex items-center gap-2">
                  {effectiveIsOnline ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                  {effectiveIsOnline ? t('bookSession.online') : t('bookSession.inPerson')}
                </span>
              </div>
              
              {/* Payment breakdown */}
              <div className="pt-2 border-t border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('bookSession.summary.sessionPrice')}</span>
                  <span className="font-medium text-foreground">{formatCurrency(selectedSessionType.price, currency)}</span>
                </div>
                
                {paymentRequired === 'deposit' && (
                  <>
                    <div className="flex items-center justify-between text-amber-400">
                      <span className="flex items-center gap-1">
                        <Banknote className="h-4 w-4" />
                        {t('bookSession.summary.depositDueNow')}
                      </span>
                      <span className="font-bold">{formatCurrency(depositAmount, currency)}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground text-sm">
                      <span>{t('bookSession.summary.remainingAtSession')}</span>
                      <span>{formatCurrency(remainingBalance, currency)}</span>
                    </div>
                  </>
                )}
                
                {paymentRequired === 'full' && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      {t('bookSession.summary.payNow')}
                    </span>
                    <span className="font-bold">{formatCurrency(selectedSessionType.price, currency)}</span>
                  </div>
                )}
                
                {paymentRequired === 'none' && (
                  <div className="flex items-center justify-between text-muted-foreground text-sm">
                    <span>{t('bookSession.summary.payment')}</span>
                    <span>{t('bookSession.summary.payCoachDirectly')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Optional Message */}
            <div className="space-y-2">
              <Label htmlFor="message">{t('bookSession.addMessage')}</Label>
              <Textarea
                id="message"
                placeholder={t('bookSession.messagePlaceholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("datetime")}>
                {t('bookSession.buttons.back')}
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={createBooking.isPending || isProcessingPayment}
                className={cn(
                  paymentRequired !== 'none' && "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                {(createBooking.isPending || isProcessingPayment) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isProcessingPayment ? t('bookSession.redirectingToPayment') : t('bookSession.sending')}
                  </>
                ) : paymentRequired === 'full' ? (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t('bookSession.buttons.payAndBook', { amount: formatCurrency(selectedSessionType.price, currency) })}
                  </>
                ) : paymentRequired === 'deposit' ? (
                  <>
                    <Banknote className="h-4 w-4 mr-2" />
                    {t('bookSession.buttons.payDepositAndBook', { amount: formatCurrency(depositAmount, currency) })}
                  </>
                ) : (
                  t('bookSession.requestBooking')
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Embedded Checkout Modal for Paid Sessions */}
      {selectedSessionType && selectedDate && selectedTime && (
        <BookingCheckoutModal
          open={showCheckoutModal}
          onOpenChange={(open) => {
            setShowCheckoutModal(open);
            if (!open) {
              // User closed the checkout - keep booking modal open
            }
          }}
          sessionType={{
            id: selectedSessionType.id,
            name: selectedSessionType.name,
            price: selectedSessionType.price,
            currency: selectedSessionType.currency || coach.currency || 'GBP',
            duration_minutes: selectedSessionType.duration_minutes,
            payment_required: selectedSessionType.payment_required,
            deposit_type: selectedSessionType.deposit_type,
            deposit_value: selectedSessionType.deposit_value,
          }}
          coach={{
            id: coach.id,
            display_name: coach.display_name,
            currency: coach.currency,
          }}
          bookingDetails={{
            requestedAt: selectedDate,
            requestedTime: selectedTime,
            isOnline: effectiveIsOnline,
            message: message || undefined,
          }}
          amountDue={amountDueNow}
          depositAmount={depositAmount > 0 ? depositAmount : undefined}
          remainingBalance={remainingBalance > 0 ? remainingBalance : undefined}
        />
      )}
    </Dialog>
  );
};

export default BookSessionModal;
