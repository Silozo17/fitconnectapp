import { useParams } from "react-router-dom";
import { useGym } from "@/contexts/GymContext";
import { useClassAttendance } from "@/hooks/gym/useClassAttendance";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QRScanner } from "@/components/gym/member/QRScanner";
import { useTodaysClasses } from "@/hooks/gym/useGymClasses";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { QrCode, Users, Clock } from "lucide-react";

export default function GymCheckIn() {
  const { slug } = useParams<{ slug: string }>();
  const { gym, isStaff, isLoading: gymLoading } = useGym();
  const { data: todaysClasses, isLoading: classesLoading } = useTodaysClasses();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  
  const { markAttendance } = useClassAttendance(selectedClassId);

  const handleCheckIn = async (data: { userId: string; gymId: string; classId?: string }) => {
    const classId = data.classId || selectedClassId;
    
    if (!classId) {
      // General gym check-in without class
      toast.success("Member checked in to the gym");
      return;
    }

    try {
      // Find the booking for this member in this class
      const { data: booking, error } = await supabase
        .from("gym_class_bookings")
        .select("id")
        .eq("class_id", classId)
        .eq("member_id", data.userId)
        .single();

      if (error || !booking) {
        throw new Error("No booking found for this class");
      }

      // Mark attendance
      await markAttendance.mutateAsync({
        bookingId: booking.id,
        attended: true,
      });
    } catch (error) {
      console.error("Check-in error:", error);
      throw error;
    }
  };

  if (gymLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold">Gym not found</h1>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">Only staff members can access the check-in kiosk</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-2xl">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">{gym.name}</h1>
        <p className="text-muted-foreground">Check-In Kiosk</p>
      </div>

      {/* Class Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Select Class
          </CardTitle>
          <CardDescription>
            Choose a class to check members into, or leave empty for general gym access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">General Gym Access</SelectItem>
                {todaysClasses?.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    <div className="flex items-center gap-2">
                      <span>{classItem.class_type?.name || "Class"}</span>
                      <span className="text-muted-foreground">
                        {format(new Date(classItem.start_time), "h:mm a")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({classItem.booked_count}/{classItem.capacity})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* QR Scanner */}
      <QRScanner
        gymId={gym.id}
        classId={selectedClassId || undefined}
        onScanSuccess={handleCheckIn}
      />

      {/* Today's Classes Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Today's Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {classesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : todaysClasses && todaysClasses.length > 0 ? (
            <div className="space-y-2">
              {todaysClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{classItem.class_type?.name || "Class"}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(classItem.start_time), "h:mm a")} - 
                      {format(new Date(classItem.end_time), "h:mm a")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {classItem.attended_count}/{classItem.booked_count}
                    </p>
                    <p className="text-xs text-muted-foreground">checked in</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No classes scheduled for today
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
