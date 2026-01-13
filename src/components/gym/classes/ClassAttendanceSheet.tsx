import { format } from "date-fns";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Clock, Users, UserCheck, Loader2 } from "lucide-react";
import { useClassAttendance } from "@/hooks/gym/useClassAttendance";

interface ClassInfo {
  id: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_bookings: number;
  class_type?: {
    name: string;
    color: string | null;
  };
}

interface ClassAttendanceSheetProps {
  classInfo: ClassInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClassAttendanceSheet({ classInfo, open, onOpenChange }: ClassAttendanceSheetProps) {
  const { 
    attendees, 
    isLoading, 
    markAttendance, 
    markAllAttended,
    confirmedCount,
    waitlistedCount,
    attendedCount 
  } = useClassAttendance(classInfo?.id || "");

  if (!classInfo) return null;

  const startTime = new Date(classInfo.start_time);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-2">
            {classInfo.class_type?.color && (
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: classInfo.class_type.color }}
              />
            )}
            <SheetTitle>{classInfo.class_type?.name || "Class"} Attendance</SheetTitle>
          </div>
          <SheetDescription>
            {format(startTime, "EEEE, MMMM d 'at' h:mm a")}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted">
              <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{confirmedCount}</p>
              <p className="text-xs text-muted-foreground">Booked</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{waitlistedCount}</p>
              <p className="text-xs text-muted-foreground">Waitlisted</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/10">
              <UserCheck className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-primary">{attendedCount}</p>
              <p className="text-xs text-muted-foreground">Attended</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => markAllAttended.mutate()}
              disabled={markAllAttended.isPending || confirmedCount === 0}
            >
              {markAllAttended.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Mark All Present
            </Button>
          </div>

          {/* Attendee List */}
          <div>
            <h3 className="font-medium mb-3">Attendees</h3>
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Skeleton className="h-5 w-5" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : attendees?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Confirmed bookings first */}
                  {attendees?.filter(a => a.status === "confirmed").map(attendee => (
                    <div 
                      key={attendee.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        checked={attendee.attended === true}
                        onCheckedChange={(checked) => {
                          markAttendance.mutate({
                            bookingId: attendee.id,
                            attended: checked === true
                          });
                        }}
                        disabled={markAttendance.isPending}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {attendee.member?.first_name || ""} {attendee.member?.last_name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {attendee.member?.email}
                        </p>
                      </div>
                      {attendee.attended && (
                        <Badge variant="default" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Present
                        </Badge>
                      )}
                      {attendee.checked_in_at && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(attendee.checked_in_at), "h:mm a")}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Waitlisted */}
                  {waitlistedCount > 0 && (
                    <>
                      <div className="py-2">
                        <p className="text-sm font-medium text-muted-foreground">Waitlist</p>
                      </div>
                      {attendees?.filter(a => a.status === "waitlisted").map(attendee => (
                        <div 
                          key={attendee.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-dashed opacity-75"
                        >
                          <div className="w-5 h-5 rounded border flex items-center justify-center text-xs text-muted-foreground">
                            {attendee.id}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {attendee.member?.first_name || ""} {attendee.member?.last_name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {attendee.member?.email}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">Waitlisted</Badge>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
