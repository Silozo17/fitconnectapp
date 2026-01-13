import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Users, Loader2 } from "lucide-react";
import { useClassBooking } from "@/hooks/gym/useClassBooking";

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

interface ClassBookingDialogProps {
  classInfo: ClassInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClassBookingDialog({ classInfo, open, onOpenChange }: ClassBookingDialogProps) {
  const { bookClass, cancelBooking, isBooked, getBooking, memberId } = useClassBooking(classInfo?.gym_id || "");

  if (!classInfo) return null;

  const booking = getBooking(classInfo.id);
  const hasBooked = isBooked(classInfo.id);
  const spotsLeft = classInfo.max_capacity - classInfo.current_bookings;
  const isFull = spotsLeft <= 0;

  const handleBook = async () => {
    await bookClass.mutateAsync(classInfo.id);
    onOpenChange(false);
  };

  const handleCancel = async () => {
    if (booking) {
      await cancelBooking.mutateAsync(booking.id);
      onOpenChange(false);
    }
  };

  const startTime = new Date(classInfo.start_time);
  const endTime = new Date(classInfo.end_time);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {classInfo.class_type?.color && (
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: classInfo.class_type.color }}
              />
            )}
            <DialogTitle>{classInfo.class_type?.name || "Class"}</DialogTitle>
          </div>
          <DialogDescription>
            {classInfo.class_type?.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date & Time */}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(startTime, "EEEE, MMMM d, yyyy")}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")} ({duration} min)
            </span>
          </div>

          {/* Instructor */}
          {classInfo.instructor && (
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>
                {classInfo.instructor.first_name} {classInfo.instructor.last_name}
              </span>
            </div>
          )}

          {/* Location */}
          {classInfo.location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{classInfo.location.name}</span>
            </div>
          )}

          {/* Capacity */}
          <div className="flex items-center gap-3 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span>
                {classInfo.current_bookings} / {classInfo.max_capacity} booked
              </span>
              {isFull ? (
                <Badge variant="destructive" className="text-xs">Full</Badge>
              ) : spotsLeft <= 3 ? (
                <Badge variant="secondary" className="text-xs">{spotsLeft} spots left</Badge>
              ) : null}
            </div>
          </div>

          {/* Current booking status */}
          {hasBooked && booking && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium text-primary">
                {booking.status === "confirmed" 
                  ? "✓ You're booked for this class"
                  : `You're on the waitlist (position ${booking.waitlist_position})`
                }
              </p>
            </div>
          )}

          {/* Notes */}
          {classInfo.notes && (
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">{classInfo.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {!memberId ? (
            <p className="text-sm text-muted-foreground">
              You must be a member to book classes
            </p>
          ) : hasBooked ? (
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={cancelBooking.isPending}
            >
              {cancelBooking.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel Booking
            </Button>
          ) : (
            <Button 
              onClick={handleBook}
              disabled={bookClass.isPending}
            >
              {bookClass.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isFull ? "Join Waitlist" : "Book Class"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
