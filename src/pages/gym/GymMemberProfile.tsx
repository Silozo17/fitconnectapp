import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useGymMember, useUpdateGymMember } from "@/hooks/gym/useGymMembers";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Clock,
  Edit,
  UserX,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { MemberActivitySummary } from "@/components/gym/admin/members/MemberActivitySummary";
import { MemberNotesTab } from "@/components/gym/admin/members/MemberNotesTab";
import { AssignMembershipDialog } from "@/components/gym/admin/dialogs/AssignMembershipDialog";

export default function GymMemberProfile() {
  const { gymId, memberId } = useParams<{ gymId: string; memberId: string }>();
  const navigate = useNavigate();
  const { data: member, isLoading, error } = useGymMember(memberId);
  const updateMember = useUpdateGymMember();
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [assignMembershipOpen, setAssignMembershipOpen] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!memberId) return;

    try {
      await updateMember.mutateAsync({
        memberId,
        updates: { status: newStatus },
      });
      toast.success(`Member ${newStatus === "active" ? "activated" : "suspended"} successfully`);
      setSuspendDialogOpen(false);
    } catch (error) {
      console.error("Failed to update member status:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMembershipStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      case "past_due":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Past Due</Badge>;
      case "paused":
        return <Badge variant="secondary">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "attended":
        return <Badge variant="secondary">Attended</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "no_show":
        return <Badge variant="destructive">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-60" />
          <Skeleton className="h-60 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to={`/gym-admin/${gymId}/members`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Members
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Member Not Found</h2>
            <p className="text-muted-foreground">
              The member you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeMembership = member.memberships?.find((m: { status: string }) => m.status === "active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/gym-admin/${gymId}/members`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Avatar className="h-14 w-14">
            <AvatarImage src={member.avatar_url || undefined} />
            <AvatarFallback className="text-lg">
              {member.first_name?.charAt(0) || ""}
              {member.last_name?.charAt(0) || ""}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {member.first_name} {member.last_name}
            </h1>
            <div className="flex items-center gap-2">
              {member.member_number && (
                <span className="text-sm text-muted-foreground">#{member.member_number}</span>
              )}
              {getStatusBadge(member.status)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={`/gym-admin/${gymId}/members/${memberId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          
          {member.status === "active" ? (
            <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                  <UserX className="mr-2 h-4 w-4" />
                  Suspend
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Suspend Member</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to suspend {member.first_name} {member.last_name}? 
                    They will lose access to the gym and classes until reactivated.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleStatusChange("suspended")}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Suspend Member
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button variant="outline" onClick={() => handleStatusChange("active")}>
              <UserCheck className="mr-2 h-4 w-4" />
              Activate
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {member.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${member.email}`} className="text-sm hover:underline">
                  {member.email}
                </a>
              </div>
            )}
            {member.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${member.phone}`} className="text-sm hover:underline">
                  {member.phone}
                </a>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Joined {format(new Date(member.joined_at), "PP")}
              </span>
            </div>
            {member.last_visit_at && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Last visit {format(new Date(member.last_visit_at), "PP")}
                </span>
              </div>
            )}
            {member.date_of_birth && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  DOB: {format(new Date(member.date_of_birth), "PP")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Membership */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Current Membership</CardTitle>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {activeMembership ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-lg">{activeMembership.plan?.name || "Membership"}</p>
                    <p className="text-sm text-muted-foreground">
                      {activeMembership.plan?.description}
                    </p>
                  </div>
                  {getMembershipStatusBadge(activeMembership.status)}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Started</p>
                    <p className="font-medium">
                      {format(new Date(activeMembership.current_period_start), "PP")}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Renews</p>
                    <p className="font-medium">
                      {activeMembership.current_period_end 
                        ? format(new Date(activeMembership.current_period_end), "PP")
                        : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Credits</p>
                    <p className="font-medium">
                      {activeMembership.credits_remaining ?? "Unlimited"}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Check-ins</p>
                    <p className="font-medium">{member.check_ins?.length || 0}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active membership</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setAssignMembershipOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Membership
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <MemberActivitySummary member={member} />

      {/* Tabs for History */}
      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Class Bookings</TabsTrigger>
          <TabsTrigger value="checkins">Check-ins</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="memberships">Membership History</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Class Bookings</CardTitle>
              <CardDescription>History of class bookings and attendance</CardDescription>
            </CardHeader>
            <CardContent>
              {member.bookings && member.bookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.bookings.map((booking: any) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.class?.class_type?.name || "Class"}
                        </TableCell>
                        <TableCell>
                          {booking.class?.start_time
                            ? format(new Date(booking.class.start_time), "PP 'at' p")
                            : format(new Date(booking.booked_at), "PP")}
                        </TableCell>
                        <TableCell>
                          {booking.class?.instructor?.display_name || "—"}
                        </TableCell>
                        <TableCell>{getBookingStatusBadge(booking.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No class bookings yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkins">
          <Card>
            <CardHeader>
              <CardTitle>Check-in History</CardTitle>
              <CardDescription>Recent gym visits</CardDescription>
            </CardHeader>
            <CardContent>
              {member.check_ins && member.check_ins.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.check_ins.slice(0, 20).map((checkin: any) => (
                      <TableRow key={checkin.id}>
                        <TableCell>
                          {format(new Date(checkin.checked_in_at), "PP 'at' p")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{checkin.check_in_type || "general"}</Badge>
                        </TableCell>
                        <TableCell>—</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No check-ins yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <MemberNotesTab memberId={memberId!} />
        </TabsContent>

        <TabsContent value="memberships">
          <Card>
            <CardHeader>
              <CardTitle>Membership History</CardTitle>
              <CardDescription>Past and current memberships</CardDescription>
            </CardHeader>
            <CardContent>
              {member.memberships && member.memberships.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Ended</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.memberships.map((membership: any) => (
                      <TableRow key={membership.id}>
                        <TableCell className="font-medium">
                          {membership.plan?.name || "Membership"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(membership.current_period_start), "PP")}
                        </TableCell>
                        <TableCell>
                          {membership.cancelled_at
                            ? format(new Date(membership.cancelled_at), "PP")
                            : "—"}
                        </TableCell>
                        <TableCell>{getMembershipStatusBadge(membership.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No membership history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Membership Dialog */}
      <AssignMembershipDialog
        memberId={memberId!}
        memberName={`${member.first_name} ${member.last_name}`}
        open={assignMembershipOpen}
        onOpenChange={setAssignMembershipOpen}
      />
    </div>
  );
}
