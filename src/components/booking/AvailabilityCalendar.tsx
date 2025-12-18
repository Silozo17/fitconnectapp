import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format, addDays, startOfWeek, isSameDay, isAfter, setHours, setMinutes, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { CoachAvailability } from "@/hooks/useCoachSchedule";

interface BookedSession {
  date: string;
  time: string;
  duration_minutes: number;
}

interface ExternalEvent {
  start_time: string;
  end_time: string;
  is_all_day: boolean;
}

interface AvailabilityCalendarProps {
  availability: CoachAvailability[];
  bookedSessions?: BookedSession[];
  externalEvents?: ExternalEvent[];
  onSelectSlot?: (date: Date, time: string) => void;
  selectedDate?: Date | null;
  selectedTime?: string | null;
  sessionDuration?: number;
  preBookingBuffer?: number;
  postBookingBuffer?: number;
}

const timeSlots = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const AvailabilityCalendar = ({
  availability,
  bookedSessions = [],
  externalEvents = [],
  onSelectSlot,
  selectedDate,
  selectedTime,
  sessionDuration = 60,
  preBookingBuffer = 60,
  postBookingBuffer = 15,
}: AvailabilityCalendarProps) => {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Check if a slot overlaps with any booked session (including post-buffer)
  const isSlotBlockedByBooking = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const slotStart = setMinutes(setHours(date, hours), minutes);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);

    return bookedSessions.some((session) => {
      const sessionDate = parseISO(session.date);
      if (!isSameDay(sessionDate, date)) return false;

      const [sessionHours, sessionMinutes] = session.time.split(":").map(Number);
      const sessionStart = setMinutes(setHours(sessionDate, sessionHours), sessionMinutes);
      // Add post-booking buffer to session end
      const sessionEnd = new Date(sessionStart.getTime() + (session.duration_minutes + postBookingBuffer) * 60 * 1000);

      return slotStart < sessionEnd && slotEnd > sessionStart;
    });
  };

  // Check if a slot overlaps with any external calendar event
  const isSlotBlockedByExternalEvent = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const slotStart = setMinutes(setHours(date, hours), minutes);
    const slotEnd = new Date(slotStart.getTime() + sessionDuration * 60 * 1000);

    return externalEvents.some((event) => {
      const eventStart = parseISO(event.start_time);
      const eventEnd = parseISO(event.end_time);

      // For all-day events, block the entire day
      if (event.is_all_day && isSameDay(slotStart, eventStart)) {
        return true;
      }

      return slotStart < eventEnd && slotEnd > eventStart;
    });
  };

  // Check if booking a session at this slot would fit without overlapping
  const wouldSessionFit = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const proposedStart = setMinutes(setHours(date, hours), minutes);
    const proposedEnd = new Date(proposedStart.getTime() + sessionDuration * 60 * 1000);

    return !bookedSessions.some((session) => {
      const sessionDate = parseISO(session.date);
      if (!isSameDay(sessionDate, date)) return false;

      const [sessionHours, sessionMinutes] = session.time.split(":").map(Number);
      const sessionStart = setMinutes(setHours(sessionDate, sessionHours), sessionMinutes);
      const sessionEnd = new Date(sessionStart.getTime() + (session.duration_minutes + postBookingBuffer) * 60 * 1000);

      return proposedStart < sessionEnd && proposedEnd > sessionStart;
    });
  };

  const isSlotAvailable = (date: Date, time: string) => {
    const dayOfWeek = date.getDay();
    const dayAvailability = availability.find(a => a.day_of_week === dayOfWeek && a.is_active);
    
    if (!dayAvailability) return false;
    
    const [hours, minutes] = time.split(":").map(Number);
    const slotTime = setMinutes(setHours(new Date(), hours), minutes);
    
    const [startHours, startMinutes] = dayAvailability.start_time.split(":").map(Number);
    const startTime = setMinutes(setHours(new Date(), startHours), startMinutes);
    
    const [endHours, endMinutes] = dayAvailability.end_time.split(":").map(Number);
    const endTime = setMinutes(setHours(new Date(), endHours), endMinutes);
    
    const sessionEndTime = new Date(slotTime.getTime() + sessionDuration * 60 * 1000);
    const sessionEndHours = sessionEndTime.getHours();
    const sessionEndMinutes = sessionEndTime.getMinutes();
    const sessionEndTimeOnly = setMinutes(setHours(new Date(), sessionEndHours), sessionEndMinutes);
    
    if (slotTime < startTime || sessionEndTimeOnly > endTime) return false;
    if (isSlotBlockedByBooking(date, time)) return false;
    if (isSlotBlockedByExternalEvent(date, time)) return false;
    if (!wouldSessionFit(date, time)) return false;
    
    // Check pre-booking buffer (minimum notice)
    const slotDateTime = setMinutes(setHours(date, hours), minutes);
    const minBookingTime = new Date(Date.now() + preBookingBuffer * 60 * 1000);
    
    return isAfter(slotDateTime, minBookingTime);
  };

  const isSelected = (date: Date, time: string) => {
    return selectedDate && isSameDay(selectedDate, date) && selectedTime === time;
  };

  const handlePrevWeek = () => {
    setWeekStart(prev => addDays(prev, -7));
    setSelectedDayIndex(null);
  };

  const handleNextWeek = () => {
    setWeekStart(prev => addDays(prev, 7));
    setSelectedDayIndex(null);
  };

  const canGoPrev = isAfter(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Check if a day has any available slots
  const dayHasAvailability = (dayIndex: number) => {
    const date = weekDays[dayIndex];
    return timeSlots.some(time => isSlotAvailable(date, time));
  };

  // Get available slots for a specific day
  const getAvailableSlotsForDay = (dayIndex: number) => {
    const date = weekDays[dayIndex];
    return timeSlots.filter(time => isSlotAvailable(date, time));
  };

  // Mobile: Selected day or first available day
  const activeDayIndex = selectedDayIndex ?? weekDays.findIndex((_, i) => dayHasAvailability(i));
  const activeDay = activeDayIndex >= 0 ? weekDays[activeDayIndex] : null;
  const activeDaySlots = activeDayIndex >= 0 ? getAvailableSlotsForDay(activeDayIndex) : [];

  return (
    <div className="space-y-4 w-full overflow-hidden">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePrevWeek}
          disabled={!canGoPrev}
          className="h-9 w-9 flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium text-foreground text-sm sm:text-base text-center">
          {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </span>
        <Button variant="outline" size="icon" onClick={handleNextWeek} className="h-9 w-9 flex-shrink-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile View: Day Selector + Time List */}
      <div className="block sm:hidden space-y-4 w-full overflow-hidden">
        {/* Day Pills - Horizontal Scroll */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2 px-1">
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, new Date());
              const hasSlots = dayHasAvailability(i);
              const isActive = activeDayIndex === i;
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDayIndex(i)}
                  disabled={!hasSlots}
                  className={cn(
                    "flex flex-col items-center min-w-[52px] py-2 px-2 rounded-xl transition-all flex-shrink-0",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : hasSlots
                        ? "bg-secondary hover:bg-secondary/80 text-foreground"
                        : "bg-muted/30 text-muted-foreground cursor-not-allowed",
                    isToday && !isActive && hasSlots && "ring-2 ring-primary/50"
                  )}
                >
                  <span className="text-[10px] uppercase tracking-wide opacity-80">
                    {dayNames[day.getDay()]}
                  </span>
                  <span className="text-lg font-bold">{format(day, "d")}</span>
                  {hasSlots && (
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1",
                      isActive ? "bg-primary-foreground" : "bg-primary"
                    )} />
                  )}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>

        {/* Selected Day Header */}
        {activeDay && (
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="font-medium text-foreground">
              {fullDayNames[activeDay.getDay()]}, {format(activeDay, "MMM d")}
            </p>
            <p className="text-sm text-muted-foreground">
              {activeDaySlots.length} slots available
            </p>
          </div>
        )}

        {/* Time Slots List */}
        <div className="space-y-2 max-h-[280px] overflow-y-auto overflow-x-hidden">
          {activeDaySlots.length > 0 ? (
            activeDaySlots.map((time) => {
              const selected = activeDay && isSelected(activeDay, time);
              
              return (
                <button
                  key={time}
                  onClick={() => activeDay && onSelectSlot?.(activeDay, time)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80 text-foreground"
                  )}
                >
                  <span className="text-lg font-medium">{time}</span>
                  {selected && <Check className="h-5 w-5" />}
                </button>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No available slots for this day
            </div>
          )}
        </div>
      </div>

      {/* Desktop/Tablet View: Two-Step Selection */}
      <div className="hidden sm:block space-y-6">
        {/* Day Cards - Clickable */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            const hasSlots = dayHasAvailability(i);
            const slotCount = getAvailableSlotsForDay(i).length;
            const isActive = activeDayIndex === i;
            
            return (
              <button
                key={i}
                onClick={() => setSelectedDayIndex(i)}
                disabled={!hasSlots}
                className={cn(
                  "flex flex-col items-center p-3 md:p-4 rounded-xl border transition-all",
                  isActive 
                    ? "border-primary bg-primary/10 ring-2 ring-primary shadow-sm" 
                    : hasSlots
                      ? "border-border bg-card hover:bg-accent hover:border-accent-foreground/20"
                      : "border-border/50 bg-muted/20 cursor-not-allowed opacity-50",
                  isToday && !isActive && hasSlots && "border-primary/50"
                )}
              >
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  {dayNames[day.getDay()]}
                </span>
                <span className={cn(
                  "text-2xl md:text-3xl font-bold mt-1",
                  isActive ? "text-primary" : isToday ? "text-primary" : "text-foreground"
                )}>
                  {format(day, "d")}
                </span>
                {hasSlots ? (
                  <span className={cn(
                    "text-xs mt-1.5",
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  )}>
                    {slotCount} slot{slotCount !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-xs mt-1.5 text-muted-foreground/50">—</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Header */}
        {activeDay && (
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {fullDayNames[activeDay.getDay()]}, {format(activeDay, "MMMM d")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeDaySlots.length} available time{activeDaySlots.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Time Slots Grid - Only Available */}
        {activeDaySlots.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {activeDaySlots.map((time) => {
              const selected = activeDay && isSelected(activeDay, time);
              
              return (
                <button
                  key={time}
                  onClick={() => activeDay && onSelectSlot?.(activeDay, time)}
                  className={cn(
                    "py-3 px-4 rounded-lg font-medium text-sm transition-all",
                    selected
                      ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2"
                      : "bg-secondary hover:bg-secondary/80 hover:shadow-sm text-foreground"
                  )}
                >
                  {time}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">
            <p className="text-lg font-medium mb-1">No availability</p>
            <p className="text-sm">Select a different day to see available times</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;