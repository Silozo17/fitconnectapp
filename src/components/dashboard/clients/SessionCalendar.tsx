import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

interface Session {
  id: string;
  date: Date;
  type: string;
  status: "scheduled" | "completed" | "cancelled";
}

interface SessionCalendarProps {
  sessions: Session[];
  onDateClick: (date: Date) => void;
  onSessionClick: (session: Session) => void;
}

const statusColors = {
  scheduled: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

export function SessionCalendar({ sessions, onDateClick, onSessionClick }: SessionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => isSameDay(new Date(session.date), date));
  };

  const startPadding = monthStart.getDay();
  const paddedDays = [...Array(startPadding).fill(null), ...days];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Session Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {paddedDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const daySessions = getSessionsForDate(day);
            const isToday = isSameDay(day, new Date());
            const hasScheduled = daySessions.some(s => s.status === "scheduled");

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDateClick(day)}
                className={`
                  aspect-square p-1 rounded-lg cursor-pointer transition-colors
                  ${isToday ? 'bg-primary/20 border border-primary' : 'hover:bg-muted/50'}
                  ${hasScheduled ? 'ring-2 ring-blue-500/50' : ''}
                `}
              >
                <div className="text-xs text-foreground mb-1 text-center">
                  {format(day, "d")}
                </div>
                <div className="flex flex-wrap gap-0.5 justify-center">
                  {daySessions.slice(0, 3).map(session => (
                    <div
                      key={session.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSessionClick(session);
                      }}
                      className={`h-1.5 w-1.5 rounded-full ${statusColors[session.status]}`}
                      title={session.type}
                    />
                  ))}
                  {daySessions.length > 3 && (
                    <span className="text-[8px] text-muted-foreground">+{daySessions.length - 3}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Cancelled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
