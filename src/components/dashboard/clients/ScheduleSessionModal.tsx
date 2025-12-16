import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, MapPin, Video } from "lucide-react";
import { useScheduleSession } from "@/hooks/useCoachClients";

interface ScheduleSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName?: string;
  clientId?: string;
}

export function ScheduleSessionModal({ open, onOpenChange, clientName, clientId }: ScheduleSessionModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [sessionType, setSessionType] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const scheduleSessionMutation = useScheduleSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId) return;

    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    
    scheduleSessionMutation.mutate({
      clientId,
      scheduledAt,
      duration: parseInt(duration),
      sessionType,
      isOnline,
      location: isOnline ? undefined : location,
      notes: notes || undefined,
    }, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      },
    });
  };

  const resetForm = () => {
    setDate("");
    setTime("");
    setDuration("60");
    setSessionType("");
    setIsOnline(false);
    setLocation("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            Schedule Session {clientName && `with ${clientName}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-background border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10 bg-background border-border"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionType">Session Type</Label>
              <Select value={sessionType} onValueChange={setSessionType} required>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-on-1">1-on-1 Training</SelectItem>
                  <SelectItem value="group">Group Session</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="nutrition-review">Nutrition Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="isOnline" className="cursor-pointer">Online Session</Label>
            </div>
            <Switch
              id="isOnline"
              checked={isOnline}
              onCheckedChange={setIsOnline}
            />
          </div>

          {!isOnline && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Gym address or meeting point"
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">Session Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific focus areas or notes for this session..."
              className="bg-background border-border resize-none"
              rows={3}
            />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={scheduleSessionMutation.isPending || !clientId || !sessionType}>
              {scheduleSessionMutation.isPending ? "Scheduling..." : "Schedule Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}