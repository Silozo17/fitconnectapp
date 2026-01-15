import { useMemo } from "react";
import { format, isSameDay, isToday as checkIsToday } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassData {
  id: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  status: string;
  class_type?: {
    name: string;
    color: string | null;
  };
  instructor?: {
    display_name: string | null;
  } | null;
  location?: {
    name: string;
  } | null;
}

interface ScheduleTimeGridProps {
  weekDays: Date[];
  classes: ClassData[];
  isLoading?: boolean;
  onClassClick?: (classItem: ClassData) => void;
}

export function ScheduleTimeGrid({
  weekDays,
  classes,
  isLoading,
  onClassClick,
}: ScheduleTimeGridProps) {
  // Extract unique time slots from classes and sort them
  const timeSlots = useMemo(() => {
    const times = new Set<string>();
    classes.forEach((c) => {
      const startTime = new Date(c.start_time);
      const timeKey = format(startTime, "HH:mm");
      times.add(timeKey);
    });
    return Array.from(times).sort();
  }, [classes]);

  // Group classes by day and time for quick lookup
  const classesGrid = useMemo(() => {
    const grid: Record<string, Record<string, ClassData[]>> = {};
    
    weekDays.forEach((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      grid[dateKey] = {};
      
      timeSlots.forEach((time) => {
        grid[dateKey][time] = [];
      });
    });

    classes.forEach((c) => {
      const startDate = new Date(c.start_time);
      const dateKey = format(startDate, "yyyy-MM-dd");
      const timeKey = format(startDate, "HH:mm");
      
      if (grid[dateKey] && grid[dateKey][timeKey]) {
        grid[dateKey][timeKey].push(c);
      }
    });

    return grid;
  }, [classes, weekDays, timeSlots]);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-full" />
          <div className="h-32 bg-muted rounded w-full" />
          <div className="h-32 bg-muted rounded w-full" />
        </div>
      </Card>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No classes scheduled this week</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-3 text-left text-sm font-medium text-muted-foreground border-b w-20">
                Time
              </th>
              {weekDays.map((day) => {
                const isToday = checkIsToday(day);
                return (
                  <th
                    key={day.toISOString()}
                    className={cn(
                      "p-3 text-center border-b border-l",
                      isToday && "bg-primary/5"
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs uppercase text-muted-foreground">
                        {format(day, "EEE")}
                      </span>
                      <span
                        className={cn(
                          "text-lg font-bold",
                          isToday && "text-primary"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {isToday && (
                        <Badge variant="default" className="text-xs px-1.5 py-0">
                          Today
                        </Badge>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => (
              <tr key={time} className="hover:bg-muted/30">
                <td className="p-3 text-sm font-medium text-muted-foreground border-b whitespace-nowrap">
                  {format(new Date(`2000-01-01T${time}`), "h:mm a")}
                </td>
                {weekDays.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const cellClasses = classesGrid[dateKey]?.[time] || [];
                  const isToday = checkIsToday(day);

                  return (
                    <td
                      key={`${dateKey}-${time}`}
                      className={cn(
                        "p-2 border-b border-l align-top min-w-[120px]",
                        isToday && "bg-primary/5"
                      )}
                    >
                      <div className="space-y-1">
                        {cellClasses.map((classItem) => (
                          <ScheduleClassCell
                            key={classItem.id}
                            classItem={classItem}
                            onClick={() => onClassClick?.(classItem)}
                          />
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface ScheduleClassCellProps {
  classItem: ClassData;
  onClick?: () => void;
}

function ScheduleClassCell({ classItem, onClick }: ScheduleClassCellProps) {
  const startTime = new Date(classItem.start_time);
  const endTime = new Date(classItem.end_time);
  const isPast = startTime < new Date();
  const isFull = classItem.booked_count >= classItem.capacity;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-2 rounded-md border transition-all",
        "hover:shadow-md hover:scale-[1.02] cursor-pointer",
        isPast && "opacity-50"
      )}
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: classItem.class_type?.color || "#888",
        backgroundColor: `${classItem.class_type?.color}10` || "transparent",
      }}
    >
      <div className="space-y-1">
        <p className="font-medium text-sm truncate">
          {classItem.class_type?.name || "Class"}
        </p>
        
        {classItem.instructor?.display_name && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{classItem.instructor.display_name}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{classItem.booked_count}/{classItem.capacity}</span>
          </div>
          {isFull && (
            <Badge variant="destructive" className="text-[10px] px-1 py-0">
              Full
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
