import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, Users, ClipboardList } from "lucide-react";

interface ClassInfo {
  id: string;
  gym_id: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_bookings: number;
  status: string;
  notes: string | null;
  class_type?: {
    name: string;
    description: string | null;
    color: string | null;
  };
  instructor?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  location?: {
    name: string;
  } | null;
}

interface GymClassCardProps {
  classInfo: ClassInfo;
  isStaff?: boolean;
  onBook?: () => void;
  onViewAttendance?: () => void;
  isBooked?: boolean;
  bookingStatus?: string;
}

export function GymClassCard({ 
  classInfo, 
  isStaff, 
  onBook, 
  onViewAttendance,
  isBooked,
  bookingStatus
}: GymClassCardProps) {
  const startTime = new Date(classInfo.start_time);
  const endTime = new Date(classInfo.end_time);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  const spotsLeft = classInfo.max_capacity - classInfo.current_bookings;
  const isFull = spotsLeft <= 0;
  const isPast = startTime < new Date();

  return (
    <Card className={`overflow-hidden ${isPast ? "opacity-60" : ""}`}>
      <div 
        className="h-1"
        style={{ backgroundColor: classInfo.class_type?.color || "#888" }}
      />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {classInfo.class_type?.name || "Class"}
            </h3>
            
            <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")} ({duration}m)
                </span>
              </div>
              
              {classInfo.instructor && (
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {classInfo.instructor.first_name} {classInfo.instructor.last_name}
                  </span>
                </div>
              )}
              
              {classInfo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{classInfo.location.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{classInfo.current_bookings}/{classInfo.max_capacity}</span>
                {isFull && <Badge variant="destructive" className="text-xs">Full</Badge>}
                {!isFull && spotsLeft <= 3 && (
                  <Badge variant="secondary" className="text-xs">{spotsLeft} left</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {isBooked && (
              <Badge 
                variant={bookingStatus === "confirmed" ? "default" : "outline"}
                className="text-xs"
              >
                {bookingStatus === "confirmed" ? "Booked" : "Waitlisted"}
              </Badge>
            )}
            
            {!isPast && onBook && (
              <Button 
                size="sm" 
                variant={isBooked ? "outline" : "default"}
                onClick={onBook}
              >
                {isBooked ? "View" : isFull ? "Waitlist" : "Book"}
              </Button>
            )}
            
            {isStaff && onViewAttendance && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={onViewAttendance}
              >
                <ClipboardList className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
