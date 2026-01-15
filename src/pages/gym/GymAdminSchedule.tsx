import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGymClasses, useGymClassTypes } from "@/hooks/gym/useGymClasses";
import { useClassBooking } from "@/hooks/gym/useClassBooking";
import { useGym } from "@/contexts/GymContext";
import { useLocationFilter } from "@/hooks/gym/useLocationFilter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { GymClassCard } from "@/components/gym/classes/GymClassCard";
import { ClassBookingDialog } from "@/components/gym/classes/ClassBookingDialog";
import { ClassAttendanceSheet } from "@/components/gym/classes/ClassAttendanceSheet";
import { ClassFormDialog } from "@/components/gym/classes/ClassFormDialog";
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
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GymAdminSchedule() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym, isStaff } = useGym();
  const { locationId: currentLocationId, location: currentLocation, isAllLocations, getLocationName } = useLocationFilter();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedClassType, setSelectedClassType] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
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
  const { isBooked, getBooking } = useClassBooking(gym?.id || "");

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

  const handleClassClick = (classItem: any) => {
    setSelectedClass({
      ...classItem,
      gym_id: gym?.id,
      max_capacity: classItem.capacity,
      current_bookings: classItem.booked_count,
      class_type: classItem.class_type,
      instructor: classItem.instructor ? {
        first_name: classItem.instructor.display_name?.split(" ")[0] || null,
        last_name: classItem.instructor.display_name?.split(" ").slice(1).join(" ") || null,
      } : null,
      location: classItem.location,
    });
    setBookingDialogOpen(true);
  };

  const handleViewAttendance = (classItem: any) => {
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

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayClasses = classesByDay[dateKey] || [];
          const today = isToday(day);

          return (
            <Card
              key={dateKey}
              className={cn(
                "min-h-[300px] md:min-h-[400px]",
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
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : dayClasses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-xs text-muted-foreground">No classes</p>
                  </div>
                ) : (
                  dayClasses.map((classItem) => {
                    const booking = getBooking(classItem.id);
                    
                    return (
                      <GymClassCard
                        key={classItem.id}
                        classInfo={{
                          id: classItem.id,
                          gym_id: gym?.id || "",
                          start_time: classItem.start_time,
                          end_time: classItem.end_time,
                          max_capacity: classItem.capacity,
                          current_bookings: classItem.booked_count,
                          status: classItem.status,
                          notes: null,
                          class_type: classItem.class_type,
                          instructor: classItem.instructor ? {
                            first_name: classItem.instructor.display_name?.split(" ")[0] || null,
                            last_name: classItem.instructor.display_name?.split(" ").slice(1).join(" ") || null,
                          } : null,
                          location: classItem.location,
                        }}
                        isStaff={isStaff}
                        onBook={() => handleClassClick(classItem)}
                        onViewAttendance={() => handleViewAttendance(classItem)}
                        isBooked={isBooked(classItem.id)}
                        bookingStatus={booking?.status}
                      />
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Booking Dialog */}
      <ClassBookingDialog
        classInfo={selectedClass}
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
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
