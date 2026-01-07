/**
 * Event Date Input - For tracking event/competition dates
 */

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EventDateInputProps {
  value: { date: string; eventName?: string; location?: string } | null;
  onChange: (value: { date: string; eventName?: string; location?: string }) => void;
  label?: string;
  showEventName?: boolean;
  showLocation?: boolean;
  className?: string;
}

export function EventDateInput({
  value,
  onChange,
  label,
  showEventName = true,
  showLocation = false,
  className,
}: EventDateInputProps) {
  const [date, setDate] = useState<Date | undefined>(
    value?.date ? new Date(value.date) : undefined
  );
  const [eventName, setEventName] = useState(value?.eventName || '');
  const [location, setLocation] = useState(value?.location || '');

  useEffect(() => {
    if (date) {
      onChange({
        date: date.toISOString(),
        eventName: showEventName ? eventName : undefined,
        location: showLocation ? location : undefined,
      });
    }
  }, [date, eventName, location]);

  return (
    <div className={cn("space-y-4", className)}>
      {label && <Label>{label}</Label>}

      {/* Date Selection */}
      <div className="space-y-2">
        <Label className="text-xs">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Event Name */}
      {showEventName && (
        <div className="space-y-2">
          <Label className="text-xs">Event Name (optional)</Label>
          <Input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="e.g., Local Championship"
          />
        </div>
      )}

      {/* Location */}
      {showLocation && (
        <div className="space-y-2">
          <Label className="text-xs">Location (optional)</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., London, UK"
              className="pl-10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
