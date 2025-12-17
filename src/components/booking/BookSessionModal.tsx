import { useState, useMemo } from "react";
import { format, setHours, setMinutes, parseISO } from "date-fns";
import { Calendar, Clock, Video, MapPin, MessageSquare, Loader2 } from "lucide-react";
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
import { useCoachAvailability, useSessionTypes, useCreateBookingRequest } from "@/hooks/useCoachSchedule";
import AvailabilityCalendar from "./AvailabilityCalendar";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BookSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coach: {
    id: string;
    display_name: string | null;
    booking_mode?: string | null;
    hourly_rate?: number | null;
  };
  onMessageFirst?: () => void;
}

const BookSessionModal = ({ open, onOpenChange, coach, onMessageFirst }: BookSessionModalProps) => {
  const [step, setStep] = useState<"type" | "datetime" | "details">("type");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [message, setMessage] = useState("");

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

  const handleSlotSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedSessionType) return;

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const requestedAt = setMinutes(setHours(selectedDate, hours), minutes);

    await createBooking.mutateAsync({
      coach_id: coach.id,
      session_type_id: selectedSessionType.id,
      requested_at: requestedAt.toISOString(),
      duration_minutes: selectedSessionType.duration_minutes,
      is_online: isOnline,
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
    setIsOnline(true);
    setMessage("");
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  // If message first mode, show message prompt
  if (isMessageFirst && step === "type") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book with {coach.display_name}</DialogTitle>
            <DialogDescription>
              This coach prefers to chat before booking sessions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-foreground">
                {coach.display_name} likes to discuss your goals and preferences before scheduling sessions.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={() => {
                handleClose();
                onMessageFirst?.();
              }}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Conversation
              </Button>
              <Button variant="outline" onClick={() => setStep("type")}>
                View Session Types Anyway
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book with {coach.display_name}</DialogTitle>
          <DialogDescription>
            {step === "type" && "Select a session type"}
            {step === "datetime" && "Choose your preferred date and time"}
            {step === "details" && "Review and confirm your booking"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Session Type */}
        {step === "type" && (
          <div className="space-y-4 py-4">
            {sessionTypes.length > 0 ? (
              <RadioGroup value={selectedType || ""} onValueChange={setSelectedType}>
                {sessionTypes.map((type) => (
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
                        <p className="font-bold text-primary">${type.price}</p>
                      </div>
                      {type.description && (
                        <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {type.duration_minutes} min
                        </Badge>
                        {type.is_online && (
                          <Badge variant="outline" className="text-xs">
                            <Video className="h-3 w-3 mr-1" />
                            Online
                          </Badge>
                        )}
                        {type.is_in_person && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            In-Person
                          </Badge>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No session types available yet.
                </p>
                {coach.hourly_rate && (
                  <p className="text-sm">
                    Default rate: <span className="font-bold text-primary">${coach.hourly_rate}/hour</span>
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep("datetime")} 
                disabled={!selectedType && sessionTypes.length > 0}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === "datetime" && (
          <div className="space-y-4 py-4">
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
                <Label>Session Format</Label>
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
                    <span>Online</span>
                  </label>
                  <label className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border cursor-pointer",
                    !isOnline ? "border-primary bg-primary/5" : "border-border"
                  )}>
                    <RadioGroupItem value="in-person" />
                    <MapPin className="h-4 w-4" />
                    <span>In-Person</span>
                  </label>
                </RadioGroup>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("type")}>
                Back
              </Button>
              <Button 
                onClick={() => setStep("details")} 
                disabled={!selectedDate || !selectedTime}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Details & Confirm */}
        {step === "details" && selectedDate && selectedTime && (
          <div className="space-y-4 py-4">
            {/* Booking Summary */}
            <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Session</span>
                <span className="font-medium text-foreground">{selectedSessionType?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(selectedDate, "EEEE, MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {selectedTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium text-foreground flex items-center gap-2">
                  {isOnline ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                  {isOnline ? "Online" : "In-Person"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-medium text-foreground">Total</span>
                <span className="font-bold text-lg text-primary">${selectedSessionType?.price}</span>
              </div>
            </div>

            {/* Optional Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Tell the coach about your goals or any specific needs..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("datetime")}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={createBooking.isPending}>
                {createBooking.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Request Booking"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookSessionModal;
