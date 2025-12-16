import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, addDays, startOfWeek, isSameDay, isAfter, setHours, setMinutes, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { CoachAvailability } from "@/hooks/useCoachSchedule";

interface AvailabilityCalendarProps {
  availability: CoachAvailability[];
  bookedSlots?: { date: string; time: string }[];
  onSelectSlot?: (date: Date, time: string) => void;
  selectedDate?: Date | null;
  selectedTime?: string | null;
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AvailabilityCalendar = ({
  availability,
  bookedSlots = [],
  onSelectSlot,
  selectedDate,
  selectedTime,
}: AvailabilityCalendarProps) => {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const isSlotAvailable = (date: Date, time: string) => {
    const dayOfWeek = date.getDay();
    const dayAvailability = availability.find(a => a.day_of_week === dayOfWeek && a.is_active);
    
    if (!dayAvailability) return false;
    
    // Check if time is within available hours
    const [hours, minutes] = time.split(":").map(Number);
    const slotTime = setMinutes(setHours(new Date(), hours), minutes);
    
    const [startHours, startMinutes] = dayAvailability.start_time.split(":").map(Number);
    const startTime = setMinutes(setHours(new Date(), startHours), startMinutes);
    
    const [endHours, endMinutes] = dayAvailability.end_time.split(":").map(Number);
    const endTime = setMinutes(setHours(new Date(), endHours), endMinutes);
    
    if (slotTime < startTime || slotTime >= endTime) return false;
    
    // Check if slot is not booked
    const isBooked = bookedSlots.some(
      slot => isSameDay(parseISO(slot.date), date) && slot.time === time
    );
    
    // Check if slot is not in the past
    const slotDateTime = setMinutes(setHours(date, hours), minutes);
    const isPast = !isAfter(slotDateTime, new Date());
    
    return !isBooked && !isPast;
  };

  const isSelected = (date: Date, time: string) => {
    return selectedDate && isSameDay(selectedDate, date) && selectedTime === time;
  };

  const handlePrevWeek = () => {
    setWeekStart(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setWeekStart(prev => addDays(prev, 7));
  };

  const canGoPrev = isAfter(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePrevWeek}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium text-foreground">
          {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </span>
        <Button variant="outline" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, new Date());
          const dayAvailability = availability.find(a => a.day_of_week === day.getDay() && a.is_active);
          
          return (
            <div 
              key={i} 
              className={cn(
                "text-center p-2 rounded-lg",
                isToday && "bg-primary/10"
              )}
            >
              <p className="text-xs text-muted-foreground">{dayNames[day.getDay()]}</p>
              <p className={cn(
                "text-lg font-bold",
                isToday ? "text-primary" : "text-foreground"
              )}>
                {format(day, "d")}
              </p>
              {dayAvailability && (
                <Badge variant="outline" className="text-[10px] mt-1">
                  {dayAvailability.start_time.slice(0, 5)} - {dayAvailability.end_time.slice(0, 5)}
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Time Slots Grid */}
      <div className="max-h-[300px] overflow-y-auto space-y-2">
        {timeSlots.map((time) => (
          <div key={time} className="grid grid-cols-7 gap-1">
            {weekDays.map((day, dayIndex) => {
              const available = isSlotAvailable(day, time);
              const selected = isSelected(day, time);
              
              return (
                <button
                  key={dayIndex}
                  onClick={() => available && onSelectSlot?.(day, time)}
                  disabled={!available}
                  className={cn(
                    "py-2 text-xs rounded-md transition-colors",
                    available
                      ? selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                      : "bg-muted/30 text-muted-foreground cursor-not-allowed",
                  )}
                >
                  {time}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-secondary" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-muted/30" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
