import { useState } from "react";
import { useGym } from "@/contexts/GymContext";
import { useGymStaff } from "@/hooks/gym/useGymStaff";
import {
  useGymStaffShifts,
  useCreateStaffShift,
  useDeleteStaffShift,
  useGymTimeEntries,
  useApproveTimeEntry,
  useStaffPayRates,
  useSetPayRate,
} from "@/hooks/gym/useGymStaffManagement";
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
} from "lucide-react";
import { format, addDays, startOfWeek, parseISO } from "date-fns";
import { toast } from "sonner";

export default function GymAdminStaff() {
  const { gym, staffRecord } = useGym();
  const { data: staffList = [], isLoading: staffLoading } = useGymStaff();
  const [activeTab, setActiveTab] = useState("roster");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [showAddShiftDialog, setShowAddShiftDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPayRateDialog, setShowPayRateDialog] = useState(false);

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
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Staff Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your gym as staff
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input type="email" placeholder="staff@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success("Invitation sent!");
                setShowInviteDialog(false);
              }}>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
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
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedStaffId(staff.id);
                              setPayRateForm((prev) => ({ ...prev, staff_id: staff.id }));
                              setShowPayRateDialog(true);
                            }}
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Shield className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
    </div>
  );
}
