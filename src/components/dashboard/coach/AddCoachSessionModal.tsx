import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, User, Mail, Phone, Clock, MapPin, Video, Loader2, Send } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachClients } from "@/hooks/useCoachClients";
import { useSessionTypes } from "@/hooks/useCoachSchedule";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { VenueAutocomplete } from "@/components/shared/VenueAutocomplete";

interface AddCoachSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedDate?: Date;
  preselectedTime?: string;
  coachId: string | null;
}

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const min = i % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${min}`;
});

const durationOptions = [
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

export const AddCoachSessionModal = ({
  open,
  onOpenChange,
  preselectedDate,
  preselectedTime,
  coachId,
}: AddCoachSessionModalProps) => {
  const { user } = useAuth();
  const { data: clients = [] } = useCoachClients();
  const { data: sessionTypes = [] } = useSessionTypes(coachId || "");

  // Client type selection
  const [clientType, setClientType] = useState<"platform" | "external">("platform");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  
  // External client details
  const [externalName, setExternalName] = useState("");
  const [externalEmail, setExternalEmail] = useState("");
  const [externalPhone, setExternalPhone] = useState("");

  // Session details
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(preselectedDate);
  const [selectedTime, setSelectedTime] = useState(preselectedTime || "10:00");
  const [duration, setDuration] = useState("60");
  const [sessionTypeId, setSessionTypeId] = useState<string>("");
  const [isOnline, setIsOnline] = useState(true);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [sendPlatformInvite, setSendPlatformInvite] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update when preselected values change
  useEffect(() => {
    if (preselectedDate) setSelectedDate(preselectedDate);
    if (preselectedTime) setSelectedTime(preselectedTime);
  }, [preselectedDate, preselectedTime]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setClientType("platform");
      setSelectedClientId("");
      setExternalName("");
      setExternalEmail("");
      setExternalPhone("");
      setSessionTypeId("");
      setIsOnline(true);
      setLocation("");
      setNotes("");
      setSendPlatformInvite(false);
      if (!preselectedDate) setSelectedDate(undefined);
      if (!preselectedTime) setSelectedTime("10:00");
    }
  }, [open, preselectedDate, preselectedTime]);

  const handleSubmit = async () => {
    if (!coachId || !selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }

    if (clientType === "platform" && !selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    if (clientType === "external" && (!externalName || !externalEmail)) {
      toast.error("Please enter the client's name and email");
      return;
    }

    setIsSubmitting(true);

    try {
      let externalClientId: string | null = null;

      // Create external client if needed
      if (clientType === "external") {
        const { data: externalClient, error: extError } = await supabase
          .from("external_session_clients")
          .insert({
            coach_id: coachId,
            name: externalName,
            email: externalEmail,
            phone: externalPhone || null,
          })
          .select("id")
          .single();

        if (extError) throw extError;
        externalClientId = externalClient.id;
      }

      // Combine date and time
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      // Get session type name
      const selectedSessionType = sessionTypes.find(st => st.id === sessionTypeId);

      // Create the session
      const { data: newSession, error: sessionError } = await supabase
        .from("coaching_sessions")
        .insert({
          coach_id: coachId,
          client_id: clientType === "platform" ? selectedClientId : null,
          external_client_id: externalClientId,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: parseInt(duration),
          session_type: selectedSessionType?.name || "General Session",
          is_online: isOnline,
          location: !isOnline ? location : null,
          notes: notes || null,
          status: "scheduled",
        })
        .select("id")
        .single();

      if (sessionError) throw sessionError;

      // Create video meeting for online sessions
      if (isOnline && newSession) {
        try {
          // Get coach's active video provider
          const { data: videoSettings } = await supabase
            .from("video_conference_settings")
            .select("provider")
            .eq("coach_id", coachId)
            .eq("is_active", true)
            .single();

          if (videoSettings?.provider) {
            await supabase.functions.invoke("video-create-meeting", {
              body: { sessionId: newSession.id, provider: videoSettings.provider },
            });
            console.log("Video meeting created for online session");
          }
        } catch (videoError) {
          console.error("Video meeting creation failed (non-blocking):", videoError);
          // Non-blocking - session is still created
        }
      }

      // Send email confirmation to external client
      if (clientType === "external" && externalClientId) {
        try {
          await supabase.functions.invoke("send-session-confirmation", {
            body: {
              externalClientId,
              sessionDate: scheduledAt.toISOString(),
              duration: parseInt(duration),
              isOnline,
              location: !isOnline ? location : null,
              sessionType: selectedSessionType?.name || "General Session",
            },
          });
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
          // Don't fail the whole operation if email fails
        }

        // Send platform invite if requested
        if (sendPlatformInvite) {
          try {
            await supabase.functions.invoke("send-platform-invite", {
              body: {
                email: externalEmail,
                name: externalName,
                coachId,
              },
            });
            toast.success("Platform invitation sent!");
          } catch (inviteError) {
            console.error("Failed to send platform invite:", inviteError);
            toast.error("Session created but failed to send platform invite");
          }
        }
      }

      toast.success("Session scheduled successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create session:", error);
      toast.error("Failed to schedule session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Session</DialogTitle>
          <DialogDescription>
            Schedule a session with a platform client or an external client
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Client Type</Label>
            <RadioGroup
              value={clientType}
              onValueChange={(value) => setClientType(value as "platform" | "external")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="platform" id="platform" />
                <Label htmlFor="platform" className="cursor-pointer">Platform Client</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="external" id="external" />
                <Label htmlFor="external" className="cursor-pointer">External Client</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Platform Client Selection */}
          {clientType === "platform" && (
            <div className="space-y-2">
              <Label>Select Client</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.client_id} value={client.client_id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {client.client_profile?.first_name} {client.client_profile?.last_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* External Client Details */}
          {clientType === "external" && (
            <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={externalName}
                    onChange={(e) => setExternalName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={externalEmail}
                    onChange={(e) => setExternalEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    value={externalPhone}
                    onChange={(e) => setExternalPhone(e.target.value)}
                    placeholder="+44 7700 900000"
                    className="pl-10"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                The client will receive an email confirmation with session details.
              </p>
              
              {/* Platform Invite Checkbox */}
              <div className="flex items-center space-x-2 pt-2 border-t border-border/50">
                <Checkbox
                  id="platform-invite"
                  checked={sendPlatformInvite}
                  onCheckedChange={(checked) => setSendPlatformInvite(checked === true)}
                />
                <Label 
                  htmlFor="platform-invite" 
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3 h-3" />
                  Invite to join the platform
                </Label>
              </div>
              {sendPlatformInvite && (
                <p className="text-xs text-muted-foreground pl-6">
                  They'll receive an email invitation to create an account and become your client.
                </p>
              )}
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
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
              <Label>Session Type</Label>
              <Select value={sessionTypeId} onValueChange={setSessionTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {sessionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Online / In-Person */}
          <div className="space-y-3">
            <Label>Session Format</Label>
            <RadioGroup
              value={isOnline ? "online" : "in-person"}
              onValueChange={(value) => setIsOnline(value === "online")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="cursor-pointer flex items-center gap-1">
                  <Video className="w-4 h-4" /> Online
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-person" id="in-person" />
                <Label htmlFor="in-person" className="cursor-pointer flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> In-Person
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Location (if in-person) */}
          {!isOnline && (
            <div className="space-y-2">
              <Label>Location</Label>
              <VenueAutocomplete
                value={location}
                onVenueChange={(loc) => setLocation(loc)}
                placeholder="Search for gym or venue..."
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes for this session..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Schedule Session
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
