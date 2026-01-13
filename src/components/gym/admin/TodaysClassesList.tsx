import { useTodaysClasses } from "@/hooks/gym/useGymClasses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  Clock,
  Users,
  MapPin,
  ChevronRight,
  CalendarX,
} from "lucide-react";

export function TodaysClassesList() {
  const { slug } = useParams<{ slug: string }>();
  const { data: classes, isLoading } = useTodaysClasses();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Classes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarX className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium">No classes scheduled today</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add classes to your schedule to see them here.
            </p>
            <Button className="mt-4" asChild>
              <Link to={`/gym/${slug}/admin/schedule`}>
                Go to Schedule
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Today's Classes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/gym/${slug}/admin/schedule`}>
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classes.map((classItem) => {
            const startTime = new Date(classItem.start_time);
            const isPast = startTime < new Date();
            const isCancelled = classItem.status === "cancelled";
            const spotsLeft = classItem.capacity - classItem.booked_count;

            return (
              <Link
                key={classItem.id}
                to={`/gym/${slug}/admin/classes/${classItem.id}`}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                {/* Time Badge */}
                <div
                  className="h-12 w-12 rounded-lg flex flex-col items-center justify-center text-white"
                  style={{ backgroundColor: classItem.class_type?.color || "#FF6B35" }}
                >
                  <span className="text-xs font-medium">
                    {format(startTime, "HH:mm")}
                  </span>
                </div>

                {/* Class Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{classItem.name}</h4>
                    {isCancelled && (
                      <Badge variant="destructive" className="text-xs">
                        Cancelled
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {classItem.instructor && (
                      <div className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={classItem.instructor.avatar_url || undefined} />
                          <AvatarFallback className="text-[8px]">
                            {classItem.instructor.display_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{classItem.instructor.display_name}</span>
                      </div>
                    )}
                    {classItem.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{classItem.location.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{classItem.duration_minutes || 60} min</span>
                    </div>
                  </div>
                </div>

                {/* Attendance */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {isPast ? classItem.attended_count : classItem.booked_count}
                    </span>
                    <span className="text-muted-foreground">/ {classItem.capacity}</span>
                  </div>
                  {!isPast && !isCancelled && (
                    <p className="text-xs text-muted-foreground">
                      {spotsLeft > 0
                        ? `${spotsLeft} spots left`
                        : classItem.waitlist_count > 0
                        ? `${classItem.waitlist_count} on waitlist`
                        : "Full"}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
