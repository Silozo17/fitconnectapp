import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarDays, Clock } from "lucide-react";
import { format } from "date-fns";

interface RescheduleSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: Date;
  onReschedule: (newDateTime: string) => Promise<void>;
  isLoading?: boolean;
}

const TIME_SLOTS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
];

export function RescheduleSessionModal({
  open,
  onOpenChange,
  currentDate,
  onReschedule,
  isLoading,
}: RescheduleSessionModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(currentDate);
  const [selectedTime, setSelectedTime] = useState<string>(
    format(currentDate, "HH:mm")
  );

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) return;

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const newDateTime = new Date(selectedDate);
    newDateTime.setHours(hours, minutes, 0, 0);

    await onReschedule(newDateTime.toISOString());
    onOpenChange(false);
  };

  const disabledDays = { before: new Date() };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CalendarDays className="h-5 w-5 text-primary" />
            Reschedule Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 min-w-0">
          <div className="text-sm text-muted-foreground">
            Current: {format(currentDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
          </div>

          <div className="space-y-3 min-w-0">
            <Label>Select New Date</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={disabledDays}
                className="rounded-md border border-border"
              />
            </div>
          </div>

          <div className="space-y-3 min-w-0">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Select New Time
            </Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="w-full bg-background border-border">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {TIME_SLOTS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDate && selectedTime && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium text-foreground">New Schedule:</p>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!selectedDate || !selectedTime || isLoading}
          >
            {isLoading ? "Rescheduling..." : "Confirm Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
