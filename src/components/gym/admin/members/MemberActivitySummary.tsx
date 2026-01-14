import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar, TrendingUp, Clock } from "lucide-react";

interface MemberActivitySummaryProps {
  member: {
    check_ins?: any[];
    bookings?: any[];
    joined_at: string;
    last_visit_at?: string | null;
  };
}

export function MemberActivitySummary({ member }: MemberActivitySummaryProps) {
  const checkIns = member.check_ins || [];
  const bookings = member.bookings || [];

  // Calculate statistics
  const totalCheckIns = checkIns.length;
  const totalBookings = bookings.length;
  const attendedBookings = bookings.filter((b: any) => b.status === "attended").length;
  const cancelledBookings = bookings.filter((b: any) => b.status === "cancelled").length;
  const noShowBookings = bookings.filter((b: any) => b.status === "no_show").length;
  
  // Attendance rate (attended / (total - cancelled))
  const eligibleBookings = totalBookings - cancelledBookings;
  const attendanceRate = eligibleBookings > 0 
    ? Math.round((attendedBookings / eligibleBookings) * 100) 
    : 0;

  // Calculate current streak (consecutive check-in days)
  const calculateStreak = () => {
    if (checkIns.length === 0) return 0;
    
    // Sort check-ins by date descending
    const sortedCheckIns = [...checkIns].sort((a, b) => 
      new Date(b.checked_in_at).getTime() - new Date(a.checked_in_at).getTime()
    );

    // Get unique dates
    const uniqueDates = [...new Set(sortedCheckIns.map(c => 
      new Date(c.checked_in_at).toDateString()
    ))];

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = new Date(uniqueDates[i]);
      checkDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      // Allow for checking yesterday if no check-in today yet
      if (i === 0 && checkDate.getTime() !== today.getTime()) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (checkDate.getTime() === yesterday.getTime()) {
          streak++;
          continue;
        }
      }
      
      if (checkDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  // Days since last visit
  const daysSinceLastVisit = member.last_visit_at
    ? Math.floor((new Date().getTime() - new Date(member.last_visit_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCheckIns}</p>
              <p className="text-xs text-muted-foreground">Total Check-ins</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalBookings}</p>
              <p className="text-xs text-muted-foreground">Classes Booked</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{attendanceRate}%</p>
              <p className="text-xs text-muted-foreground">Attendance Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional stats row */}
      <div className="col-span-2 md:col-span-4 grid grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-lg font-semibold text-green-600">{attendedBookings}</p>
          <p className="text-xs text-muted-foreground">Attended</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-lg font-semibold text-yellow-600">{noShowBookings}</p>
          <p className="text-xs text-muted-foreground">No Shows</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-lg font-semibold text-muted-foreground">
            {daysSinceLastVisit !== null ? `${daysSinceLastVisit}d` : "—"}
          </p>
          <p className="text-xs text-muted-foreground">Since Last Visit</p>
        </div>
      </div>
    </div>
  );
}
