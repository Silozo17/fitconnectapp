import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Send,
  CheckCircle,
} from "lucide-react";
import { format, startOfWeek, endOfWeek, addDays, startOfDay, endOfDay, isToday } from "date-fns";
import { ClassRegister } from "@/components/gym/coach/ClassRegister";
import { ClassBroadcast } from "@/components/gym/coach/ClassBroadcast";

interface CoachClass {
  id: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  status: string;
  notes: string | null;
  class_type: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  location: {
    id: string;
    name: string;
  } | null;
}

export default function CoachClasses() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym, staffRecord: staff } = useGym();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<CoachClass | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  // Fetch classes assigned to this coach
  const { data: classes, isLoading } = useQuery({
    queryKey: ["coach-classes", gymId, staff?.id, weekStart.toISOString()],
    queryFn: async () => {
      if (!gymId || !staff?.id) return [];

      const { data, error } = await supabase
        .from("gym_classes")
        .select(`
          id,
          start_time,
          end_time,
          capacity,
          booked_count,
          status,
          notes,
          class_type:class_type_id (
            id,
            name,
            color
          ),
          location:location_id (
            id,
            name
          )
        `)
        .eq("gym_id", gymId)
        .eq("instructor_id", staff.id)
        .gte("start_time", weekStart.toISOString())
        .lte("start_time", weekEnd.toISOString())
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data as unknown as CoachClass[];
    },
    enabled: !!gymId && !!staff?.id,
  });

  const goToPreviousWeek = () => setSelectedDate(addDays(selectedDate, -7));
  const goToNextWeek = () => setSelectedDate(addDays(selectedDate, 7));
  const goToToday = () => setSelectedDate(new Date());

  // Group classes by day
  const todayClasses = classes?.filter(c => {
    const classDate = new Date(c.start_time);
    return classDate >= startOfDay(new Date()) && classDate <= endOfDay(new Date());
  }) || [];

  const upcomingClasses = classes?.filter(c => {
    const classDate = new Date(c.start_time);
    return classDate > endOfDay(new Date());
  }) || [];

  const pastClasses = classes?.filter(c => {
    const classDate = new Date(c.start_time);
    return classDate < startOfDay(new Date());
  }) || [];

  const handleOpenRegister = (classItem: CoachClass) => {
    setSelectedClass(classItem);
    setShowRegister(true);
  };

  const handleOpenBroadcast = (classItem: CoachClass) => {
    setSelectedClass(classItem);
    setShowBroadcast(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
          <p className="text-muted-foreground">
            View and manage your assigned classes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-sm text-muted-foreground">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayClasses.length}</p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingClasses.length}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {classes?.reduce((sum, c) => sum + (c.booked_count || 0), 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-500/10">
                <CheckCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classes?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Tabs */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today" className="gap-2">
            Today
            {todayClasses.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {todayClasses.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
            </div>
          ) : todayClasses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg">No Classes Today</h3>
                <p className="text-muted-foreground">You don't have any classes scheduled for today.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayClasses.map(classItem => (
                <CoachClassCard
                  key={classItem.id}
                  classItem={classItem}
                  onOpenRegister={() => handleOpenRegister(classItem)}
                  onOpenBroadcast={() => handleOpenBroadcast(classItem)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingClasses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming classes this week.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingClasses.map(classItem => (
                <CoachClassCard
                  key={classItem.id}
                  classItem={classItem}
                  onOpenRegister={() => handleOpenRegister(classItem)}
                  onOpenBroadcast={() => handleOpenBroadcast(classItem)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastClasses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No past classes this week.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastClasses.map(classItem => (
                <CoachClassCard
                  key={classItem.id}
                  classItem={classItem}
                  onOpenRegister={() => handleOpenRegister(classItem)}
                  onOpenBroadcast={() => handleOpenBroadcast(classItem)}
                  isPast
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Class Register Dialog */}
      {selectedClass && (
        <ClassRegister
          open={showRegister}
          onOpenChange={setShowRegister}
          classId={selectedClass.id}
          className={selectedClass.class_type?.name || "Class"}
          classTime={selectedClass.start_time}
        />
      )}

      {/* Class Broadcast Dialog */}
      {selectedClass && (
        <ClassBroadcast
          open={showBroadcast}
          onOpenChange={setShowBroadcast}
          classId={selectedClass.id}
          className={selectedClass.class_type?.name || "Class"}
        />
      )}
    </div>
  );
}

function CoachClassCard({
  classItem,
  onOpenRegister,
  onOpenBroadcast,
  isPast = false,
}: {
  classItem: CoachClass;
  onOpenRegister: () => void;
  onOpenBroadcast: () => void;
  isPast?: boolean;
}) {
  const startTime = new Date(classItem.start_time);
  const endTime = new Date(classItem.end_time);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  const isFull = classItem.booked_count >= classItem.capacity;

  return (
    <Card className={isPast ? "opacity-60" : ""}>
      <div
        className="h-1"
        style={{ backgroundColor: classItem.class_type?.color || "#888" }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {classItem.class_type?.name || "Class"}
            </CardTitle>
            <CardDescription>
              {format(startTime, "EEEE, MMMM d")}
            </CardDescription>
          </div>
          {isToday(startTime) && (
            <Badge variant="default">Today</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")} ({duration}m)
            </span>
          </div>
          {classItem.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{classItem.location.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{classItem.booked_count}/{classItem.capacity} booked</span>
            {isFull && <Badge variant="destructive" className="text-xs">Full</Badge>}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onOpenRegister}
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Register
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onOpenBroadcast}
            disabled={classItem.booked_count === 0}
          >
            <Send className="mr-2 h-4 w-4" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
