import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGym } from "@/contexts/GymContext";
import { useGymClasses } from "@/hooks/gym/useGymClasses";
import { useClassBooking } from "@/hooks/gym/useClassBooking";
import { useMyGymMembership, useGymCustomerPortal, useGymCredits } from "@/hooks/gym/useGymMembership";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { GymClassCard } from "@/components/gym/classes/GymClassCard";
import { ClassBookingDialog } from "@/components/gym/classes/ClassBookingDialog";
import { MemberQRCode, MemberMessages, MemberProgress, MemberGoals } from "@/components/gym/member";
import { format, startOfWeek, endOfWeek, addDays, startOfDay, endOfDay } from "date-fns";
import { 
  Calendar, 
  CreditCard, 
  QrCode, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Loader2
} from "lucide-react";

export default function GymMemberPortal() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym, isMember, isLoading: gymLoading } = useGym();
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: membership, isLoading: membershipLoading } = useMyGymMembership();
  const { data: credits } = useGymCredits();
  const customerPortal = useGymCustomerPortal();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  const { data: classes, isLoading: classesLoading } = useGymClasses({
    startDate: weekStart,
    endDate: weekEnd,
  });

  const { myBookings, isBooked, getBooking, loadingBookings } = useClassBooking(gym?.id || "");

  const goToPreviousWeek = () => setSelectedDate(addDays(selectedDate, -7));
  const goToNextWeek = () => setSelectedDate(addDays(selectedDate, 7));
  const goToToday = () => setSelectedDate(new Date());

  // Get upcoming classes for today
  const todayClasses = (classes || []).filter(c => {
    const classDate = new Date(c.start_time);
    return classDate >= startOfDay(new Date()) && classDate <= endOfDay(new Date());
  });

  // Get user's upcoming bookings (we don't have gym_class join data in ClassBooking interface)
  const upcomingBookings = (myBookings || []).slice(0, 5);

  const handleBookClass = (classItem: any) => {
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

  if (gymLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold">Gym not found</h1>
        <p className="text-muted-foreground mt-2">The gym you're looking for doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{gym.name}</h1>
          <p className="text-muted-foreground">Member Portal</p>
        </div>
        {isMember && (
          <Badge variant="default" className="w-fit">
            <Dumbbell className="w-4 h-4 mr-1" />
            Active Member
          </Badge>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Classes</p>
                <p className="text-2xl font-bold">{todayClasses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Bookings</p>
                <p className="text-2xl font-bold">{upcomingBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credits Remaining</p>
                <p className="text-2xl font-bold">
                  {credits?.unlimited ? "∞" : credits?.remaining ?? "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 max-w-2xl">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="checkin">Check-In</TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Class Schedule</CardTitle>
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
            </CardHeader>
            <CardContent>
              {classesLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : classes && classes.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map(classItem => {
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
                        onBook={() => handleBookClass(classItem)}
                        isBooked={isBooked(classItem.id)}
                        bookingStatus={booking?.status}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No classes scheduled this week</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>Your upcoming and past class bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : myBookings && myBookings.length > 0 ? (
                <div className="space-y-3">
                  {myBookings.map(booking => (
                    <Card key={booking.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            {(booking as any).gym_class?.class_type?.name || "Class"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {(booking as any).gym_class?.start_time 
                              ? format(new Date((booking as any).gym_class.start_time), "EEE, MMM d 'at' h:mm a")
                              : `Booked ${format(new Date(booking.booked_at), "MMM d")}`}
                          </p>
                        </div>
                        <Badge 
                          variant={booking.status === "confirmed" ? "default" : 
                                   booking.status === "attended" ? "secondary" : "outline"}
                        >
                          {booking.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No bookings yet</p>
                  <p className="text-sm">Book a class from the schedule to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Membership Tab */}
        <TabsContent value="membership" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Membership Details</CardTitle>
              <CardDescription>Your current membership status and benefits</CardDescription>
            </CardHeader>
            <CardContent>
              {membershipLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-16" />
                </div>
              ) : membership ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Current Plan</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <p className="text-2xl font-bold">{membership.plan?.name || "Membership"}</p>
                    <p className="text-sm text-muted-foreground">
                      {membership.plan?.billing_interval === "month" ? "Renews monthly" : 
                       membership.plan?.billing_interval === "year" ? "Renews yearly" : ""}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Started</p>
                      <p className="font-semibold">
                        {format(new Date(membership.current_period_start), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Next Billing</p>
                      <p className="font-semibold">
                        {membership.current_period_end 
                          ? format(new Date(membership.current_period_end), "MMM d, yyyy")
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => customerPortal.mutate({ returnUrl: window.location.href })}
                    disabled={customerPortal.isPending}
                  >
                    {customerPortal.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
                    ) : (
                      "Manage Subscription"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active membership</p>
                  <Button asChild className="mt-4">
                    <Link to={`/club/${gym?.slug}/signup`}>View Plans</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <MemberMessages />
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <MemberProgress />
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals">
          <MemberGoals />
        </TabsContent>

        {/* Check-In Tab */}
        <TabsContent value="checkin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Quick Check-In
              </CardTitle>
              <CardDescription>
                Show this QR code at the front desk or scan at a kiosk
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <MemberQRCode gymId={gym.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <ClassBookingDialog
        classInfo={selectedClass}
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
      />
    </div>
  );
}
