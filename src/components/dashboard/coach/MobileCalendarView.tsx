import { useState, useMemo, useRef, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Video, 
  MapPin, 
  RefreshCw,
  Calendar as CalendarIcon,
  CalendarDays,
  List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  format, 
  addDays, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameDay, 
  isSameMonth, 
  isToday,
  parseISO,
  getDay,
  eachDayOfInterval,
  startOfYear,
  addYears,
  subYears
} from "date-fns";

type CalendarView = "year" | "month" | "week" | "day";

interface Session {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: string;
  is_online: boolean;
  location?: string;
  client?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  external_client_id?: string | null;
}

interface ExternalEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  source: string;
}

interface MobileCalendarViewProps {
  sessions: Session[];
  externalEvents: ExternalEvent[];
  onAddSession: (date: Date, time?: string) => void;
  onSync: () => void;
  isSyncing: boolean;
}

const HOUR_HEIGHT = 60; // pixels per hour

export const MobileCalendarView = ({
  sessions,
  externalEvents,
  onAddSession,
  onSync,
  isSyncing
}: MobileCalendarViewProps) => {
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to 8am on day/week view mount
  useEffect(() => {
    if ((view === "day" || view === "week") && scrollRef.current) {
      scrollRef.current.scrollTop = 8 * HOUR_HEIGHT;
    }
  }, [view, currentDate]);

  const goToToday = () => setCurrentDate(new Date());

  const navigate = (direction: "prev" | "next") => {
    const offset = direction === "prev" ? -1 : 1;
    switch (view) {
      case "year":
        setCurrentDate(prev => direction === "prev" ? subYears(prev, 1) : addYears(prev, 1));
        break;
      case "month":
        setCurrentDate(prev => direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1));
        break;
      case "week":
        setCurrentDate(prev => addDays(prev, offset * 7));
        break;
      case "day":
        setCurrentDate(prev => addDays(prev, offset));
        break;
    }
  };

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    return sessions.filter(s => isSameDay(parseISO(s.scheduled_at), date));
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return externalEvents.filter(e => {
      const eventStart = new Date(e.start_time);
      const eventEnd = new Date(e.end_time);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
  };

  // Check if date has events
  const hasEvents = (date: Date) => {
    return getSessionsForDate(date).length > 0 || getEventsForDate(date).length > 0;
  };

  // Year View
  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

    return (
      <div className="p-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-foreground">{year}</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {months.map((month, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentDate(month);
                setView("month");
              }}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <p className="text-sm font-medium text-foreground mb-2">
                {format(month, "MMM")}
              </p>
              <MiniMonthGrid month={month} hasEvents={hasEvents} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <div key={i} className="text-center text-xs text-muted-foreground font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDate(day);
            const daySessions = getSessionsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const todayClass = isToday(day) ? "bg-primary text-primary-foreground" : "";

            return (
              <button
                key={idx}
                onClick={() => {
                  setCurrentDate(day);
                  setView("day");
                }}
                className={`aspect-square p-1 rounded-lg transition-colors ${
                  isCurrentMonth ? "hover:bg-secondary/50" : "opacity-40"
                }`}
              >
                <div className={`w-7 h-7 mx-auto flex items-center justify-center rounded-full text-sm ${todayClass}`}>
                  {format(day, "d")}
                </div>
                {(dayEvents.length > 0 || daySessions.length > 0) && (
                  <div className="flex justify-center gap-0.5 mt-1">
                    {daySessions.length > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                    {dayEvents.length > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Event list for selected date */}
        <div className="mt-6 border-t border-border pt-4">
          <h3 className="font-medium text-foreground mb-3">
            {format(currentDate, "EEEE, MMMM d")}
          </h3>
          <EventList 
            sessions={getSessionsForDate(currentDate)} 
            events={getEventsForDate(currentDate)}
            onAddSession={() => onAddSession(currentDate)}
          />
        </div>
      </div>
    );
  };

  // Week View (2-day on mobile)
  const renderWeekView = () => {
    const days = [currentDate, addDays(currentDate, 1)];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex flex-col h-full">
        {/* Day headers */}
        <div className="grid grid-cols-[50px_1fr_1fr] border-b border-border bg-background sticky top-0 z-10">
          <div className="p-2" />
          {days.map((day, i) => (
            <div
              key={i}
              onClick={() => {
                setCurrentDate(day);
                setView("day");
              }}
              className="p-2 text-center border-l border-border cursor-pointer hover:bg-secondary/30"
            >
              <p className="text-xs text-muted-foreground">{format(day, "EEE")}</p>
              <p className={`text-lg font-bold ${isToday(day) ? "text-primary" : "text-foreground"}`}>
                {format(day, "d")}
              </p>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="relative">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-[50px_1fr_1fr] border-b border-border" style={{ height: HOUR_HEIGHT }}>
                <div className="p-1 text-xs text-muted-foreground text-right pr-2">
                  {format(new Date().setHours(hour, 0), "ha")}
                </div>
                {days.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className="relative border-l border-border hover:bg-secondary/20 cursor-pointer"
                    onClick={() => onAddSession(day, `${String(hour).padStart(2, "0")}:00`)}
                  />
                ))}
              </div>
            ))}

            {/* Overlay sessions */}
            {days.map((day, dayIdx) => {
              const daySessions = getSessionsForDate(day);
              const dayEvents = getEventsForDate(day).filter(e => !e.is_all_day);

              return (
                <div key={dayIdx} className="absolute top-0" style={{ 
                  left: `calc(50px + ${dayIdx * 50}%)`,
                  width: "calc(50% - 25px)",
                  height: "100%",
                  pointerEvents: "none"
                }}>
                  {daySessions.map(session => {
                    const startTime = parseISO(session.scheduled_at);
                    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                    const durationHours = session.duration_minutes / 60;

                    return (
                      <div
                        key={session.id}
                        className="absolute left-1 right-1 rounded-md p-1 text-xs pointer-events-auto"
                        style={{
                          top: startHour * HOUR_HEIGHT,
                          height: durationHours * HOUR_HEIGHT - 2,
                          backgroundColor: session.is_online ? "hsl(var(--primary) / 0.2)" : "hsl(var(--accent) / 0.2)",
                          borderLeft: `3px solid hsl(var(--${session.is_online ? "primary" : "accent"}))`
                        }}
                      >
                        <p className="font-medium truncate text-foreground">
                          {session.client?.first_name || "External"}
                        </p>
                        <p className="truncate text-muted-foreground">{session.session_type}</p>
                      </div>
                    );
                  })}
                  {dayEvents.map(event => {
                    const startTime = new Date(event.start_time);
                    const endTime = new Date(event.end_time);
                    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

                    return (
                      <div
                        key={event.id}
                        className="absolute left-1 right-1 rounded-md p-1 text-xs pointer-events-auto bg-muted/50 border-l-3"
                        style={{
                          top: startHour * HOUR_HEIGHT,
                          height: Math.max(durationHours * HOUR_HEIGHT - 2, 20),
                          borderLeft: "3px solid hsl(var(--muted-foreground))"
                        }}
                      >
                        <p className="font-medium truncate text-muted-foreground">
                          {event.title || "Busy"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Day View
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const daySessions = getSessionsForDate(currentDate);
    const dayEvents = getEventsForDate(currentDate);
    const allDayEvents = dayEvents.filter(e => e.is_all_day);
    const timedEvents = dayEvents.filter(e => !e.is_all_day);

    return (
      <div className="flex flex-col h-full">
        {/* All day events */}
        {allDayEvents.length > 0 && (
          <div className="border-b border-border p-2 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">All Day</p>
            {allDayEvents.map(event => (
              <div key={event.id} className="p-2 rounded bg-warning/20 border border-warning/30 text-xs mb-1">
                <p className="font-medium text-foreground">{event.title || "Busy"}</p>
              </div>
            ))}
          </div>
        )}

        {/* Time grid */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="relative">
            {hours.map(hour => (
              <div key={hour} className="flex border-b border-border" style={{ height: HOUR_HEIGHT }}>
                <div className="w-14 p-1 text-xs text-muted-foreground text-right pr-2 shrink-0">
                  {format(new Date().setHours(hour, 0), "ha")}
                </div>
                <div 
                  className="flex-1 hover:bg-secondary/20 cursor-pointer"
                  onClick={() => onAddSession(currentDate, `${String(hour).padStart(2, "0")}:00`)}
                />
              </div>
            ))}

            {/* Overlay sessions */}
            <div className="absolute top-0 left-14 right-0" style={{ height: 24 * HOUR_HEIGHT }}>
              {daySessions.map(session => {
                const startTime = parseISO(session.scheduled_at);
                const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                const durationHours = session.duration_minutes / 60;

                return (
                  <div
                    key={session.id}
                    className="absolute left-1 right-1 rounded-lg p-2 text-xs shadow-sm"
                    style={{
                      top: startHour * HOUR_HEIGHT,
                      height: durationHours * HOUR_HEIGHT - 4,
                      backgroundColor: session.is_online ? "hsl(var(--primary) / 0.2)" : "hsl(var(--accent) / 0.2)",
                      borderLeft: `4px solid hsl(var(--${session.is_online ? "primary" : "accent"}))`
                    }}
                  >
                    <p className="font-medium text-foreground">
                      {session.client?.first_name} {session.client?.last_name || "External Client"}
                    </p>
                    <p className="text-muted-foreground">{session.session_type}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {session.is_online ? (
                        <Video className="w-3 h-3 text-primary" />
                      ) : (
                        <MapPin className="w-3 h-3 text-accent" />
                      )}
                      <span className="text-muted-foreground">{session.duration_minutes}m</span>
                    </div>
                  </div>
                );
              })}
              {timedEvents.map(event => {
                const startTime = new Date(event.start_time);
                const endTime = new Date(event.end_time);
                const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

                return (
                  <div
                    key={event.id}
                    className="absolute left-1 right-1 rounded-lg p-2 text-xs bg-muted/50 shadow-sm"
                    style={{
                      top: startHour * HOUR_HEIGHT,
                      height: Math.max(durationHours * HOUR_HEIGHT - 4, 30),
                      borderLeft: "4px solid hsl(var(--muted-foreground))"
                    }}
                  >
                    <p className="font-medium text-muted-foreground">{event.title || "Busy"}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getTitle = () => {
    switch (view) {
      case "year":
        return format(currentDate, "yyyy");
      case "month":
        return format(currentDate, "MMMM yyyy");
      case "week":
        return `${format(currentDate, "MMM d")} - ${format(addDays(currentDate, 1), "d, yyyy")}`;
      case "day":
        return format(currentDate, "EEEE, MMMM d");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-background rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate("prev")}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-foreground">{getTitle()}</h2>
          <Button variant="ghost" size="icon" onClick={onSync} disabled={isSyncing}>
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate("next")}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === "year" && renderYearView()}
        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between p-2 border-t border-border bg-card">
        <Button variant="ghost" size="sm" onClick={goToToday}>
          Today
        </Button>
        
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button 
            variant={view === "year" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => setView("year")}
            className="px-2"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button 
            variant={view === "month" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => setView("month")}
            className="px-2"
          >
            <CalendarIcon className="w-4 h-4" />
          </Button>
          <Button 
            variant={view === "week" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => setView("week")}
            className="px-2"
          >
            <CalendarDays className="w-4 h-4" />
          </Button>
        </div>

        <Button 
          size="sm" 
          onClick={() => onAddSession(currentDate)}
          className="bg-primary text-primary-foreground"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Mini month grid for year view
const MiniMonthGrid = ({ month, hasEvents }: { month: Date; hasEvents: (date: Date) => boolean }) => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd }).slice(0, 35);

  return (
    <div className="grid grid-cols-7 gap-0.5">
      {days.map((day, idx) => {
        const isCurrentMonth = isSameMonth(day, month);
        const hasEvent = hasEvents(day);
        
        return (
          <div
            key={idx}
            className={`w-3 h-3 text-[8px] flex items-center justify-center rounded-full ${
              isToday(day) ? "bg-primary text-primary-foreground" :
              hasEvent && isCurrentMonth ? "bg-primary/30" :
              isCurrentMonth ? "" : "opacity-20"
            }`}
          >
            {isCurrentMonth ? format(day, "d") : ""}
          </div>
        );
      })}
    </div>
  );
};

// Event list component
const EventList = ({ 
  sessions, 
  events, 
  onAddSession 
}: { 
  sessions: Session[]; 
  events: ExternalEvent[];
  onAddSession: () => void;
}) => {
  const allItems = [
    ...sessions.map(s => ({ type: "session" as const, data: s, time: parseISO(s.scheduled_at) })),
    ...events.map(e => ({ type: "event" as const, data: e, time: new Date(e.start_time) }))
  ].sort((a, b) => a.time.getTime() - b.time.getTime());

  if (allItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No events scheduled</p>
        <Button onClick={onAddSession} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Session
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {allItems.map((item, idx) => {
        if (item.type === "session") {
          const session = item.data as Session;
          return (
            <div
              key={session.id}
              className={`p-3 rounded-lg border ${
                session.is_online 
                  ? "bg-primary/10 border-primary/30" 
                  : "bg-accent/10 border-accent/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {session.client?.first_name} {session.client?.last_name || "External Client"}
                  </p>
                  <p className="text-sm text-muted-foreground">{session.session_type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {format(parseISO(session.scheduled_at), "h:mm a")}
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    {session.is_online ? (
                      <Video className="w-3 h-3 text-primary" />
                    ) : (
                      <MapPin className="w-3 h-3 text-accent" />
                    )}
                    <span className="text-xs text-muted-foreground">{session.duration_minutes}m</span>
                  </div>
                </div>
              </div>
            </div>
          );
        } else {
          const event = item.data as ExternalEvent;
          return (
            <div
              key={event.id}
              className="p-3 rounded-lg border bg-muted/30 border-muted-foreground/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-muted-foreground">{event.title || "Busy"}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.source === "apple_calendar" ? "iCloud" : "Google Calendar"}
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {event.is_all_day ? (
                    <Badge variant="outline">All Day</Badge>
                  ) : (
                    <>
                      {format(new Date(event.start_time), "h:mm a")} - {format(new Date(event.end_time), "h:mm a")}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};

export default MobileCalendarView;
