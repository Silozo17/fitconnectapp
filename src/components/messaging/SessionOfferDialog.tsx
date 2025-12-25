import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Video, Loader2, PoundSterling, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSessionTypes } from "@/hooks/useCoachSchedule";
import { useCreateSessionOffer } from "@/hooks/useSessionOffers";
import { useParticipantClientProfileId } from "@/hooks/useParticipantClientProfileId";
import { cn } from "@/lib/utils";
import { VenueAutocomplete } from "@/components/shared/VenueAutocomplete";

interface SessionOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId: string;
  /** The auth user_id of the participant (will be converted to client_profile.id) */
  participantUserId: string;
  onOfferCreated?: (offerId: string, offerDetails: string) => void;
}

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const min = i % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${min}`;
});

const durationOptions = [
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

const SessionOfferDialog = ({
  open,
  onOpenChange,
  coachId,
  participantUserId,
  onOfferCreated,
}: SessionOfferDialogProps) => {
  const { data: sessionTypes = [] } = useSessionTypes(coachId);
  const createOffer = useCreateSessionOffer();
  
  // Convert user_id to client_profile.id
  const { clientProfileId, hasClientProfile, isLoading: isLoadingProfile } = 
    useParticipantClientProfileId(participantUserId);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [duration, setDuration] = useState("60");
  const [sessionType, setSessionType] = useState("Personal Training");
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!selectedDate || !clientProfileId) return;

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const proposedDate = new Date(selectedDate);
    proposedDate.setHours(hours, minutes, 0, 0);

    const offer = await createOffer.mutateAsync({
      coach_id: coachId,
      client_id: clientProfileId, // Use the resolved client_profile.id
      session_type: sessionType,
      proposed_date: proposedDate,
      duration_minutes: parseInt(duration),
      price: isFree ? 0 : parseFloat(price) || 0,
      is_free: isFree,
      is_online: isOnline,
      location: !isOnline ? location : undefined,
      notes: notes || undefined,
    });

    // Create a formatted message for the chat
    const priceText = isFree ? "FREE" : `£${parseFloat(price) || 0}`;
    const formatText = isOnline ? "Online" : `In-person${location ? ` at ${location}` : ""}`;
    const offerDetails = `📅 **Session Offer**\n\n` +
      `**${sessionType}**\n` +
      `📆 ${format(proposedDate, "EEEE, MMMM do 'at' HH:mm")}\n` +
      `⏱️ ${duration} minutes\n` +
      `💰 ${priceText}\n` +
      `📍 ${formatText}\n` +
      `${notes ? `\n💬 ${notes}` : ""}\n\n` +
      `[SESSION_OFFER:${offer.id}]`;

    onOfferCreated?.(offer.id, offerDetails);
    onOpenChange(false);
    
    // Reset form
    setSelectedDate(undefined);
    setSelectedTime("10:00");
    setDuration("60");
    setSessionType("Personal Training");
    setIsFree(false);
    setPrice("");
    setIsOnline(true);
    setLocation("");
    setNotes("");
  };

  const canSubmit = selectedDate && hasClientProfile && !isLoadingProfile;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Session Offer</DialogTitle>
          <DialogDescription>
            Send a session proposal for the client to accept or decline
          </DialogDescription>
        </DialogHeader>

        {/* Show error if user doesn't have a client profile */}
        {!isLoadingProfile && !hasClientProfile && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This user doesn't have a client profile. They need to create one to receive session offers.
            </AlertDescription>
          </Alert>
        )}

        {/* Show loading state while checking profile */}
        {isLoadingProfile && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Checking client profile...</span>
          </div>
        )}

        <div className="space-y-4 py-4">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                    disabled={!hasClientProfile}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime} disabled={!hasClientProfile}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration & Session Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Duration</Label>
              <Select value={duration} onValueChange={setDuration} disabled={!hasClientProfile}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Session Type</Label>
              <Select value={sessionType} onValueChange={setSessionType} disabled={!hasClientProfile}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sessionTypes.length > 0 ? (
                    sessionTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="Personal Training">Personal Training</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Free Session</Label>
              <Switch checked={isFree} onCheckedChange={setIsFree} disabled={!hasClientProfile} />
            </div>
            {!isFree && (
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-9 h-9"
                  disabled={!hasClientProfile}
                />
              </div>
            )}
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label className="text-xs">Format</Label>
            <RadioGroup
              value={isOnline ? "online" : "in-person"}
              onValueChange={(v) => setIsOnline(v === "online")}
              className="flex gap-4"
              disabled={!hasClientProfile}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="offer-online" disabled={!hasClientProfile} />
                <Label htmlFor="offer-online" className="cursor-pointer flex items-center gap-1 text-sm">
                  <Video className="w-3 h-3" /> Online
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-person" id="offer-inperson" disabled={!hasClientProfile} />
                <Label htmlFor="offer-inperson" className="cursor-pointer flex items-center gap-1 text-sm">
                  <MapPin className="w-3 h-3" /> In-Person
                </Label>
              </div>
            </RadioGroup>
          </div>

          {!isOnline && (
            <div className="space-y-2">
              <Label className="text-xs">Location</Label>
              <VenueAutocomplete
                value={location}
                onVenueChange={(loc) => setLocation(loc)}
                placeholder="Search for gym or venue..."
                disabled={!hasClientProfile}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-xs">Message (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a personal message..."
              rows={2}
              className="resize-none"
              disabled={!hasClientProfile}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || createOffer.isPending}
            size="sm"
          >
            {createOffer.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1" />
                Send Offer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionOfferDialog;
