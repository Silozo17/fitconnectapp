import { useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  Bot,
  Clock,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCcw,
  Bell,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useGym } from "@/contexts/GymContext";
import {
  useGymWaitlistSettings,
  useUpsertWaitlistSettings,
  useGymFailedPayments,
  useResolveFailedPayment,
  useCancelFailedPayment,
  useGymAutomationLogs,
  useGymRecurringSchedules,
} from "@/hooks/gym/useGymAutomation";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function GymAdminAutomation() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym } = useGym();
  const [activeTab, setActiveTab] = useState("overview");
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  // Queries
  const { data: waitlistSettings, isLoading: loadingSettings } = useGymWaitlistSettings(gymId);
  const { data: failedPayments = [], isLoading: loadingPayments } = useGymFailedPayments(gymId);
  const { data: automationLogs = [], isLoading: loadingLogs } = useGymAutomationLogs(gymId);
  const { data: recurringSchedules = [] } = useGymRecurringSchedules(gymId);

  // Mutations
  const upsertSettings = useUpsertWaitlistSettings();
  const resolvePayment = useResolveFailedPayment();
  const cancelPayment = useCancelFailedPayment();

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    auto_promote_enabled: waitlistSettings?.auto_promote_enabled ?? true,
    promotion_window_hours: waitlistSettings?.promotion_window_hours ?? 24,
    max_auto_promotions: waitlistSettings?.max_auto_promotions ?? 3,
    notify_on_promotion: waitlistSettings?.notify_on_promotion ?? true,
    notify_on_waitlist_join: waitlistSettings?.notify_on_waitlist_join ?? true,
    promotion_message_template: waitlistSettings?.promotion_message_template ?? "",
  });

  // Update form when settings load
  useState(() => {
    if (waitlistSettings) {
      setSettingsForm({
        auto_promote_enabled: waitlistSettings.auto_promote_enabled,
        promotion_window_hours: waitlistSettings.promotion_window_hours,
        max_auto_promotions: waitlistSettings.max_auto_promotions,
        notify_on_promotion: waitlistSettings.notify_on_promotion,
        notify_on_waitlist_join: waitlistSettings.notify_on_waitlist_join,
        promotion_message_template: waitlistSettings.promotion_message_template,
      });
    }
  });

  const handleSaveSettings = () => {
    if (!gymId) return;
    upsertSettings.mutate({
      gym_id: gymId,
      ...settingsForm,
    });
  };

  const handleResolvePayment = () => {
    if (!selectedPayment || !gymId) return;
    resolvePayment.mutate(
      { id: selectedPayment, gymId, notes: resolutionNotes },
      {
        onSuccess: () => {
          setResolveDialogOpen(false);
          setSelectedPayment(null);
          setResolutionNotes("");
        },
      }
    );
  };

  const pendingPayments = failedPayments.filter((p) => p.status === "pending" || p.status === "retrying");
  const resolvedPayments = failedPayments.filter((p) => p.status === "resolved" || p.status === "failed" || p.status === "cancelled");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case "skipped":
        return <Badge variant="secondary">Skipped</Badge>;
      case "pending":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "retrying":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500"><RefreshCcw className="h-3 w-3 mr-1" />Retrying</Badge>;
      case "resolved":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case "cancelled":
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAutomationTypeLabel = (type: string) => {
    switch (type) {
      case "recurring_class_generation":
        return "Recurring Class Generation";
      case "waitlist_promotion":
        return "Waitlist Promotion";
      case "payment_retry":
        return "Payment Retry";
      case "membership_renewal":
        return "Membership Renewal";
      case "expiry_notification":
        return "Expiry Notification";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Automation</h1>
        <p className="text-muted-foreground">
          Manage automated tasks for {gym?.name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recurring Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recurringSchedules.filter(s => s.is_active).length}</div>
            <p className="text-xs text-muted-foreground">Active schedules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Waitlist Auto-Promote</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {waitlistSettings?.auto_promote_enabled ? "Enabled" : "Disabled"}
            </div>
            <p className="text-xs text-muted-foreground">
              {waitlistSettings?.promotion_window_hours || 24}h window
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{pendingPayments.length}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Automations</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automationLogs.length}</div>
            <p className="text-xs text-muted-foreground">Last 50 actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Classes</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist Settings</TabsTrigger>
          <TabsTrigger value="payments">Failed Payments</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common automation tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-between" onClick={() => setActiveTab("recurring")}>
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Manage Recurring Schedules
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between" onClick={() => setActiveTab("waitlist")}>
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configure Waitlist Auto-Promote
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {pendingPayments.length > 0 && (
                  <Button variant="outline" className="w-full justify-between border-destructive" onClick={() => setActiveTab("payments")}>
                    <span className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Review Failed Payments ({pendingPayments.length})
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest automated actions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  {automationLogs.slice(0, 10).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent automation activity</p>
                  ) : (
                    <div className="space-y-3">
                      {automationLogs.slice(0, 10).map((log) => (
                        <div key={log.id} className="flex items-start gap-3 text-sm">
                          {getStatusBadge(log.status)}
                          <div className="flex-1">
                            <p className="font-medium">{getAutomationTypeLabel(log.automation_type)}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(log.executed_at), "MMM d, h:mm a")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recurring Classes Tab */}
        <TabsContent value="recurring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Class Schedules</CardTitle>
              <CardDescription>
                Classes that automatically generate on the schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recurringSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No recurring schedules</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set up recurring schedules to automatically generate class instances
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recurringSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">
                          {schedule.class_type?.name || "Unknown"}
                        </TableCell>
                        <TableCell>{DAYS_OF_WEEK[schedule.day_of_week]}</TableCell>
                        <TableCell>{schedule.start_time.slice(0, 5)}</TableCell>
                        <TableCell>{schedule.duration_minutes} min</TableCell>
                        <TableCell>{schedule.instructor?.display_name || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={schedule.is_active ? "default" : "secondary"}>
                            {schedule.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Waitlist Settings Tab */}
        <TabsContent value="waitlist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Waitlist Auto-Promotion</CardTitle>
              <CardDescription>
                Configure automatic promotion from waitlist when spots open up
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Auto-Promotion</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically promote waitlisted members when spots open
                  </p>
                </div>
                <Switch
                  checked={settingsForm.auto_promote_enabled}
                  onCheckedChange={(checked) =>
                    setSettingsForm((prev) => ({ ...prev, auto_promote_enabled: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="promotion_window">Promotion Window (hours)</Label>
                  <Input
                    id="promotion_window"
                    type="number"
                    value={settingsForm.promotion_window_hours}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        promotion_window_hours: parseInt(e.target.value) || 24,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Hours before class to stop auto-promoting
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_promotions">Max Auto-Promotions</Label>
                  <Input
                    id="max_promotions"
                    type="number"
                    value={settingsForm.max_auto_promotions}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        max_auto_promotions: parseInt(e.target.value) || 3,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum members to auto-promote at once
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notify on Promotion</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notification when promoted from waitlist
                    </p>
                  </div>
                  <Switch
                    checked={settingsForm.notify_on_promotion}
                    onCheckedChange={(checked) =>
                      setSettingsForm((prev) => ({ ...prev, notify_on_promotion: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notify on Waitlist Join</Label>
                    <p className="text-sm text-muted-foreground">
                      Send confirmation when joining waitlist
                    </p>
                  </div>
                  <Switch
                    checked={settingsForm.notify_on_waitlist_join}
                    onCheckedChange={(checked) =>
                      setSettingsForm((prev) => ({ ...prev, notify_on_waitlist_join: checked }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="message_template">Promotion Message Template</Label>
                <Textarea
                  id="message_template"
                  value={settingsForm.promotion_message_template}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      promotion_message_template: e.target.value,
                    }))
                  }
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Available variables: {"{{class_name}}"}, {"{{class_date}}"}, {"{{member_name}}"}
                </p>
              </div>

              <Button onClick={handleSaveSettings} disabled={upsertSettings.isPending}>
                {upsertSettings.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failed Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Payments</CardTitle>
              <CardDescription>
                Payments that failed and need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPayments.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="font-semibold mb-2">No failed payments</h3>
                  <p className="text-sm text-muted-foreground">
                    All payments are up to date
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {payment.member?.first_name} {payment.member?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payment.member?.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.currency} {payment.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {payment.failure_reason || "Unknown"}
                        </TableCell>
                        <TableCell>{payment.retry_count} / {payment.max_retries}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPayment(payment.id);
                                setResolveDialogOpen(true);
                              }}
                            >
                              Resolve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelPayment.mutate({ id: payment.id, gymId: gymId! })}
                            >
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Activity Log</CardTitle>
              <CardDescription>
                History of automated actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {automationLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No activity yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Automated actions will appear here
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {automationLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {getAutomationTypeLabel(log.automation_type)}
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {log.message || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(log.executed_at), "MMM d, h:mm a")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resolve Payment Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Payment</DialogTitle>
            <DialogDescription>
              Mark this payment as resolved. Add notes about how it was handled.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g., Payment received via bank transfer, card updated successfully..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolvePayment} disabled={resolvePayment.isPending}>
              {resolvePayment.isPending ? "Resolving..." : "Mark as Resolved"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
