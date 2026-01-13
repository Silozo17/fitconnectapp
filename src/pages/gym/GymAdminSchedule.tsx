import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGymClasses, useGymClassTypes } from "@/hooks/gym/useGymClasses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Users,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GymAdminSchedule() {
  const { slug } = useParams<{ slug: string }>();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedClassType, setSelectedClassType] = useState<string>("all");

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const { data: classes, isLoading } = useGymClasses({
    startDate: weekStart,
    endDate: weekEnd,
    classTypeId: selectedClassType !== "all" ? selectedClassType : undefined,
  });

  const { data: classTypes } = useGymClassTypes();

  const weekDays = useMemo(() => {
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [weekStart, weekEnd]);

  // Group classes by day
  const classesByDay = useMemo(() => {
    const grouped: Record<string, typeof classes> = {};
    weekDays.forEach((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      grouped[dateKey] = (classes || []).filter((c) =>
        isSameDay(new Date(c.start_time), day)
      );
    });
    return grouped;
  }, [classes, weekDays]);

  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToToday = () => setCurrentWeek(new Date());

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">
            View and manage your class schedule.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Week Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="ml-2 font-medium">
                {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Select value={selectedClassType} onValueChange={setSelectedClassType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All class types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Class Types</SelectItem>
                  {classTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayClasses = classesByDay[dateKey] || [];
          const today = isToday(day);

          return (
            <Card
              key={dateKey}
              className={cn(
                "min-h-[400px]",
                today && "ring-2 ring-primary"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      {format(day, "EEE")}
                    </p>
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        today && "text-primary"
                      )}
                    >
                      {format(day, "d")}
                    </p>
                  </div>
                  {today && (
                    <Badge variant="default" className="text-xs">
                      Today
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  <>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </>
                ) : dayClasses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-xs text-muted-foreground">No classes</p>
                  </div>
                ) : (
                  dayClasses.map((classItem) => {
                    const startTime = new Date(classItem.start_time);
                    const isCancelled = classItem.status === "cancelled";
                    const spotsLeft = classItem.capacity - classItem.booked_count;

                    return (
                      <div
                        key={classItem.id}
                        className={cn(
                          "p-2 rounded-lg border text-xs cursor-pointer hover:shadow-sm transition-shadow",
                          isCancelled && "opacity-50"
                        )}
                        style={{
                          borderLeftWidth: 3,
                          borderLeftColor: classItem.class_type?.color || "#FF6B35",
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-[10px] uppercase text-muted-foreground">
                            {format(startTime, "HH:mm")}
                          </span>
                          {isCancelled && (
                            <Badge variant="destructive" className="text-[8px] px-1 py-0">
                              Cancelled
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium truncate">{classItem.name}</p>
                        {classItem.instructor && (
                          <p className="text-muted-foreground truncate">
                            {classItem.instructor.display_name}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>
                              {classItem.booked_count}/{classItem.capacity}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{classItem.duration_minutes}m</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
