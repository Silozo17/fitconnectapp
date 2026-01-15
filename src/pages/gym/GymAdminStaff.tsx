import { useState } from "react";
import { useGym } from "@/contexts/GymContext";
import { useGymStaff } from "@/hooks/gym/useGymStaff";
import { useGymStaffInvitations, useCancelStaffInvitation, useResendStaffInvitation } from "@/hooks/gym/useGymStaffInvitations";
import { InviteStaffDialog } from "@/components/gym/admin/dialogs/InviteStaffDialog";
import { EditStaffDialog } from "@/components/gym/admin/dialogs/EditStaffDialog";
import { RemoveStaffDialog } from "@/components/gym/admin/dialogs/RemoveStaffDialog";
import {
  useGymStaffShifts,
  useCreateStaffShift,
  useDeleteStaffShift,
  useGymTimeEntries,
  useApproveTimeEntry,
  useStaffPayRates,
  useSetPayRate,
} from "@/hooks/gym/useGymStaffManagement";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Check,
  X,
  UserPlus,
  Mail,
  Shield,
  Settings,
  MoreHorizontal,
  Pencil,
  Trash2,
  RefreshCw,
  Send,
} from "lucide-react";
import { format, addDays, startOfWeek, parseISO } from "date-fns";
import { toast } from "sonner";
import StaffPermissionEditor from "@/components/gym/admin/StaffPermissionEditor";

export default function GymAdminStaff() {
  const { gym, staffRecord } = useGym();
  const queryClient = useQueryClient();
  const { data: staffList = [], isLoading: staffLoading } = useGymStaff();
  const { data: invitations = [], isLoading: invitationsLoading } = useGymStaffInvitations();
  const cancelInvitation = useCancelStaffInvitation();
  const resendInvitation = useResendStaffInvitation();
  
  const [activeTab, setActiveTab] = useState("roster");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [showAddShiftDialog, setShowAddShiftDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPayRateDialog, setShowPayRateDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<any>(null);
  const [staffToRemove, setStaffToRemove] = useState<{ id: string; name: string } | null>(null);
  const [selectedStaffForPermissions, setSelectedStaffForPermissions] = useState<any>(null);

  // Date range for shifts (current week)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const dateRange = {
    start: format(weekStart, "yyyy-MM-dd"),
    end: format(weekEnd, "yyyy-MM-dd"),
  };

  const { data: shifts = [], isLoading: shiftsLoading } = useGymStaffShifts(dateRange);
  const { data: timeEntries = [], isLoading: timeLoading } = useGymTimeEntries();
  const { data: payRates = [] } = useStaffPayRates();
  
  const createShift = useCreateStaffShift();
  const deleteShift = useDeleteStaffShift();
  const approveTimeEntry = useApproveTimeEntry();
  const setPayRate = useSetPayRate();

  // Shift form state
  const [shiftForm, setShiftForm] = useState({
    staff_id: "",
    shift_date: format(new Date(), "yyyy-MM-dd"),
    start_time: "09:00",
    end_time: "17:00",
    break_minutes: 30,
  });

  // Pay rate form state
  const [payRateForm, setPayRateForm] = useState({
    staff_id: "",
    hourly_rate: "",
    overtime_rate: "",
  });

  const handleCreateShift = async () => {
    if (!shiftForm.staff_id) {
      toast.error("Please select a staff member");
      return;
    }
    await createShift.mutateAsync({
      ...shiftForm,
      gym_id: gym?.id || "",
      break_minutes: shiftForm.break_minutes,
      location_id: null,
      notes: null,
      status: "scheduled",
      actual_start_time: null,
      actual_end_time: null,
    });
    setShowAddShiftDialog(false);
    setShiftForm({
      staff_id: "",
      shift_date: format(new Date(), "yyyy-MM-dd"),
      start_time: "09:00",
      end_time: "17:00",
      break_minutes: 30,
    });
  };

  const handleSetPayRate = async () => {
    if (!payRateForm.staff_id || !payRateForm.hourly_rate) {
      toast.error("Please fill in required fields");
      return;
    }
    await setPayRate.mutateAsync({
      gym_id: gym?.id || "",
      staff_id: payRateForm.staff_id,
      hourly_rate: parseFloat(payRateForm.hourly_rate),
      overtime_rate: payRateForm.overtime_rate ? parseFloat(payRateForm.overtime_rate) : null,
      effective_from: format(new Date(), "yyyy-MM-dd"),
      effective_to: null,
      is_current: true,
    });
    setShowPayRateDialog(false);
    setPayRateForm({ staff_id: "", hourly_rate: "", overtime_rate: "" });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-primary text-primary-foreground";
      case "manager":
        return "bg-blue-500 text-white";
      case "instructor":
        return "bg-green-500 text-white";
      case "staff":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted";
    }
  };

  const pendingTimeEntries = timeEntries.filter((e) => e.status === "pending");
  const pendingInvitations = invitations.filter((i) => i.status === "pending");

  const getInvitationStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Pending</Badge>;
      case "accepted":
        return <Badge variant="default" className="bg-green-500/20 text-green-600">Accepted</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!gym) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage your team, schedules, and payroll
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Staff
        </Button>
        <InviteStaffDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          onSuccess={() => {
            // Refresh staff list and invitations
            queryClient.invalidateQueries({ queryKey: ["gym-staff", gym?.id] });
            queryClient.invalidateQueries({ queryKey: ["gym-staff-invitations", gym?.id] });
          }}
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvitations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week&apos;s Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shifts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTimeEntries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeEntries.filter((e) => !e.clock_out).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roster">
            <Users className="mr-2 h-4 w-4" />
            Staff Roster
          </TabsTrigger>
          <TabsTrigger value="invitations">
            <Mail className="mr-2 h-4 w-4" />
            Invitations
            {pendingInvitations.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {pendingInvitations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Shield className="mr-2 h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="timeclock">
            <Clock className="mr-2 h-4 w-4" />
            Time Clock
          </TabsTrigger>
          <TabsTrigger value="payroll">
            <DollarSign className="mr-2 h-4 w-4" />
            Payroll
          </TabsTrigger>
        </TabsList>

        {/* Staff Roster Tab */}
        <TabsContent value="roster" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>All staff members at {gym.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffList.map((staff: any) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={staff.avatar_url || undefined} />
                            <AvatarFallback>
                              {staff.display_name?.charAt(0) || "S"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{staff.display_name || "Unnamed"}</p>
                            <p className="text-sm text-muted-foreground">{staff.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(staff.role)}>
                          {staff.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{staff.job_title || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={staff.status === "active" ? "default" : "secondary"}>
                          {staff.status || "active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setStaffToEdit(staff);
                                setShowEditDialog(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStaffId(staff.id);
                                setPayRateForm((prev) => ({ ...prev, staff_id: staff.id }));
                                setShowPayRateDialog(true);
                              }}
                            >
                              <DollarSign className="mr-2 h-4 w-4" />
                              Set Pay Rate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStaffForPermissions(staff);
                                setShowPermissionsDialog(true);
                              }}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Permissions
                            </DropdownMenuItem>
                            {staff.role !== "owner" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setStaffToRemove({
                                      id: staff.id,
                                      name: staff.display_name || staff.email || "this staff member",
                                    });
                                    setShowRemoveDialog(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Invitations</CardTitle>
              <CardDescription>
                Manage pending and past staff invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invitee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No invitations sent yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {`${invitation.first_name || ""} ${invitation.last_name || ""}`.trim() || "—"}
                            </p>
                            <p className="text-sm text-muted-foreground">{invitation.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(invitation.role)}>
                            {invitation.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getInvitationStatusBadge(invitation.status)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(parseISO(invitation.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {invitation.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => resendInvitation.mutate(invitation.id)}
                                disabled={resendInvitation.isPending}
                              >
                                <Send className="mr-1 h-3 w-3" />
                                Resend
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => cancelInvitation.mutate(invitation.id)}
                                disabled={cancelInvitation.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {invitation.status === "accepted" && (
                            <span className="text-sm text-green-600 flex items-center gap-1">
                              <Check className="h-4 w-4" />
                              {invitation.accepted_at && format(parseISO(invitation.accepted_at), "MMM d")}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Permissions</CardTitle>
              <CardDescription>
                Configure what each staff member can access and manage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assigned Locations</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffList.filter((s: any) => s.role !== "owner").map((staff: any) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={staff.avatar_url || undefined} />
                            <AvatarFallback>
                              {staff.display_name?.charAt(0) || "S"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{staff.display_name || "Unnamed"}</p>
                            <p className="text-sm text-muted-foreground">{staff.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(staff.role)}>
                          {staff.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {staff.assigned_location_ids?.length 
                            ? `${staff.assigned_location_ids.length} location(s)` 
                            : "All locations"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStaffForPermissions(staff);
                            setShowPermissionsDialog(true);
                          }}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Configure
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {staffList.filter((s: any) => s.role !== "owner").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No staff members to configure. Invite staff first.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Week of {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </h3>
            <Dialog open={showAddShiftDialog} onOpenChange={setShowAddShiftDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Shift
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Staff Shift</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Staff Member</Label>
                    <Select
                      value={shiftForm.staff_id}
                      onValueChange={(v) => setShiftForm((prev) => ({ ...prev, staff_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffList.map((staff: any) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.display_name || staff.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={shiftForm.shift_date}
                      onChange={(e) =>
                        setShiftForm((prev) => ({ ...prev, shift_date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={shiftForm.start_time}
                        onChange={(e) =>
                          setShiftForm((prev) => ({ ...prev, start_time: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={shiftForm.end_time}
                        onChange={(e) =>
                          setShiftForm((prev) => ({ ...prev, end_time: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Break (minutes)</Label>
                    <Input
                      type="number"
                      value={shiftForm.break_minutes}
                      onChange={(e) =>
                        setShiftForm((prev) => ({
                          ...prev,
                          break_minutes: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddShiftDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateShift} disabled={createShift.isPending}>
                    Create Shift
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Break</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No shifts scheduled for this week
                      </TableCell>
                    </TableRow>
                  ) : (
                    shifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell>{format(parseISO(shift.shift_date), "EEE, MMM d")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={shift.staff?.avatar_url || undefined} />
                              <AvatarFallback>
                                {shift.staff?.display_name?.charAt(0) || "S"}
                              </AvatarFallback>
                            </Avatar>
                            {shift.staff?.display_name || "Unknown"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                        </TableCell>
                        <TableCell>{shift.break_minutes} min</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              shift.status === "completed"
                                ? "default"
                                : shift.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {shift.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteShift.mutate(shift.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Clock Tab */}
        <TabsContent value="timeclock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Entries</CardTitle>
              <CardDescription>Review and approve staff time entries</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No time entries yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    timeEntries.map((entry) => {
                      const clockIn = parseISO(entry.clock_in);
                      const clockOut = entry.clock_out ? parseISO(entry.clock_out) : null;
                      const duration = clockOut
                        ? Math.round((clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60) * 10) / 10
                        : null;

                      return (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={entry.staff?.avatar_url || undefined} />
                                <AvatarFallback>
                                  {entry.staff?.display_name?.charAt(0) || "S"}
                                </AvatarFallback>
                              </Avatar>
                              {entry.staff?.display_name || "Unknown"}
                            </div>
                          </TableCell>
                          <TableCell>{format(clockIn, "MMM d, h:mm a")}</TableCell>
                          <TableCell>
                            {clockOut ? format(clockOut, "h:mm a") : "—"}
                          </TableCell>
                          <TableCell>{duration ? `${duration} hrs` : "In progress"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                entry.status === "approved"
                                  ? "default"
                                  : entry.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {entry.status === "pending" && entry.clock_out && (
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    approveTimeEntry.mutate({
                                      entryId: entry.id,
                                      approvedBy: staffRecord?.id || "",
                                    })
                                  }
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pay Rates</CardTitle>
              <CardDescription>Current hourly rates for staff members</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Overtime Rate</TableHead>
                    <TableHead>Effective From</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffList.map((staff: any) => {
                    const rate = payRates.find(
                      (r) => r.staff_id === staff.id && r.is_current
                    );
                    return (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={staff.avatar_url || undefined} />
                              <AvatarFallback>
                                {staff.display_name?.charAt(0) || "S"}
                              </AvatarFallback>
                            </Avatar>
                            {staff.display_name || "Unknown"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {rate ? `£${rate.hourly_rate.toFixed(2)}/hr` : "Not set"}
                        </TableCell>
                        <TableCell>
                          {rate?.overtime_rate
                            ? `£${rate.overtime_rate.toFixed(2)}/hr`
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {rate ? format(parseISO(rate.effective_from), "MMM d, yyyy") : "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPayRateForm({
                                staff_id: staff.id,
                                hourly_rate: rate?.hourly_rate.toString() || "",
                                overtime_rate: rate?.overtime_rate?.toString() || "",
                              });
                              setShowPayRateDialog(true);
                            }}
                          >
                            {rate ? "Update" : "Set Rate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pay Rate Dialog */}
      <Dialog open={showPayRateDialog} onOpenChange={setShowPayRateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Pay Rate</DialogTitle>
            <DialogDescription>
              Update the hourly rate for this staff member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Hourly Rate (£)</Label>
              <Input
                type="number"
                step="0.01"
                value={payRateForm.hourly_rate}
                onChange={(e) =>
                  setPayRateForm((prev) => ({ ...prev, hourly_rate: e.target.value }))
                }
                placeholder="12.50"
              />
            </div>
            <div className="space-y-2">
              <Label>Overtime Rate (£) - Optional</Label>
              <Input
                type="number"
                step="0.01"
                value={payRateForm.overtime_rate}
                onChange={(e) =>
                  setPayRateForm((prev) => ({ ...prev, overtime_rate: e.target.value }))
                }
                placeholder="18.75"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayRateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetPayRate} disabled={setPayRate.isPending}>
              Save Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Editor */}
      {selectedStaffForPermissions && (
        <StaffPermissionEditor
          staff={selectedStaffForPermissions}
          open={showPermissionsDialog}
          onOpenChange={setShowPermissionsDialog}
        />
      )}

      {/* Edit Staff Dialog */}
      <EditStaffDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        staff={staffToEdit}
      />

      {/* Remove Staff Dialog */}
      <RemoveStaffDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        staffId={staffToRemove?.id || null}
        staffName={staffToRemove?.name || ""}
      />
    </div>
  );
}
