import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGymClasses, useGymClassTypes } from "@/hooks/gym/useGymClasses";
import { useGym } from "@/contexts/GymContext";
import { useLocationFilter } from "@/hooks/gym/useLocationFilter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassAttendanceSheet } from "@/components/gym/classes/ClassAttendanceSheet";
import { ClassFormDialog } from "@/components/gym/classes/ClassFormDialog";
import { ScheduleTimeGrid } from "@/components/gym/classes/ScheduleTimeGrid";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GymAdminSchedule() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym, isStaff } = useGym();
  const { locationId: currentLocationId, location: currentLocation, isAllLocations } = useLocationFilter();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedClassType, setSelectedClassType] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [attendanceSheetOpen, setAttendanceSheetOpen] = useState(false);
  const [classFormOpen, setClassFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const { data: classes, isLoading } = useGymClasses({
    startDate: weekStart,
    endDate: weekEnd,
    classTypeId: selectedClassType !== "all" ? selectedClassType : undefined,
    locationId: currentLocationId || undefined,
  });

  const { data: classTypes } = useGymClassTypes();

  const weekDays = useMemo(() => {
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [weekStart, weekEnd]);

  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToToday = () => setCurrentWeek(new Date());

  const handleClassClick = (classItem: any) => {
    setSelectedClass({
      ...classItem,
      max_capacity: classItem.capacity,
      current_bookings: classItem.booked_count,
      class_type: classItem.class_type,
    });
    setAttendanceSheetOpen(true);
  };

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
        {isStaff && (
          <Button onClick={() => {
            setEditingClass(null);
            setClassFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        )}
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
            <div className="flex items-center gap-4">
              {/* Location indicator */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className={cn(!isAllLocations && "font-medium text-foreground")}>
                  {isAllLocations ? "All Locations" : currentLocation?.name}
                </span>
              </div>

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

      {/* Schedule Grid - New timetable layout */}
      <ScheduleTimeGrid
        weekDays={weekDays}
        classes={classes || []}
        isLoading={isLoading}
        onClassClick={handleClassClick}
      />

      {/* Attendance Sheet */}
      <ClassAttendanceSheet
        classInfo={selectedClass}
        open={attendanceSheetOpen}
        onOpenChange={setAttendanceSheetOpen}
      />

      {/* Class Form Dialog */}
      <ClassFormDialog
        open={classFormOpen}
        onOpenChange={setClassFormOpen}
        classToEdit={editingClass}
        defaultLocationId={currentLocationId || undefined}
      />
    </div>
  );
}
