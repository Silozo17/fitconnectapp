import { useState } from "react";
import { useParams } from "react-router-dom";
import { 
  useGymAutomations, 
  useCreateAutomation, 
  useUpdateAutomation, 
  useDeleteAutomation,
  useToggleAutomation,
  useAutomationLogs,
  AUTOMATION_TYPES,
  type AutomationType,
} from "@/hooks/gym/useGymAutomations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
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
  Zap,
  Plus,
  Settings,
  Mail,
  MessageSquare,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Activity,
} from "lucide-react";

export default function GymAdminAutomations() {
  const { gymId } = useParams<{ gymId: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    automation_type: "" as AutomationType | "",
    message_template: "",
    send_email: true,
    send_sms: false,
    send_push: false,
    trigger_config: {} as Record<string, any>,
    action_config: {} as Record<string, any>,
  });

  const { data: automations, isLoading } = useGymAutomations();
  const { data: logs, isLoading: logsLoading } = useAutomationLogs({ limit: 50 });
  const createAutomation = useCreateAutomation();
  const toggleAutomation = useToggleAutomation();
  const deleteAutomation = useDeleteAutomation();

  const handleCreate = async () => {
    if (!formData.name || !formData.automation_type) return;

    await createAutomation.mutateAsync({
      name: formData.name,
      automation_type: formData.automation_type,
      is_active: true,
      message_template: formData.message_template || null,
      send_email: formData.send_email,
      send_sms: formData.send_sms,
      send_push: formData.send_push,
      trigger_config: formData.trigger_config,
      action_config: formData.action_config,
    });

    setFormData({
      name: "",
      automation_type: "",
      message_template: "",
      send_email: true,
      send_sms: false,
      send_push: false,
      trigger_config: {},
      action_config: {},
    });
    setDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "skipped":
        return <Badge variant="outline">Skipped</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "welcome_email":
      case "birthday_greeting":
        return <Mail className="h-4 w-4" />;
      case "class_reminder":
      case "membership_renewal_reminder":
      case "membership_expiring":
        return <Bell className="h-4 w-4" />;
      case "inactive_member_outreach":
      case "payment_failed":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automations</h1>
          <p className="text-muted-foreground">Automate member communication and engagement</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Automation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Automation Name</Label>
                <Input
                  placeholder="e.g., Welcome New Members"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={formData.automation_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, automation_type: value as AutomationType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select automation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {AUTOMATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.automation_type && (
                  <p className="text-xs text-muted-foreground">
                    {AUTOMATION_TYPES.find(t => t.value === formData.automation_type)?.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Message Template</Label>
                <Textarea
                  placeholder="Use {{name}}, {{gym_name}} as placeholders..."
                  rows={4}
                  value={formData.message_template}
                  onChange={(e) => setFormData(prev => ({ ...prev, message_template: e.target.value }))}
                />
              </div>

              <div className="space-y-3">
                <Label>Delivery Channels</Label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={formData.send_email}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, send_email: checked }))}
                    />
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={formData.send_sms}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, send_sms: checked }))}
                    />
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">SMS</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={formData.send_push}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, send_push: checked }))}
                    />
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">Push</span>
                  </label>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={createAutomation.isPending || !formData.name || !formData.automation_type}
              >
                {createAutomation.isPending ? "Creating..." : "Create Automation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="automations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="logs">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : automations && automations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {automations.map((automation) => {
                const typeInfo = AUTOMATION_TYPES.find(t => t.value === automation.automation_type);
                return (
                  <Card key={automation.id} className={!automation.is_active ? "opacity-60" : ""}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {getTypeIcon(automation.automation_type)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{automation.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {typeInfo?.label || automation.automation_type}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {automation.send_email && (
                                <Badge variant="outline" className="text-xs"><Mail className="h-3 w-3 mr-1" />Email</Badge>
                              )}
                              {automation.send_sms && (
                                <Badge variant="outline" className="text-xs"><MessageSquare className="h-3 w-3 mr-1" />SMS</Badge>
                              )}
                              {automation.send_push && (
                                <Badge variant="outline" className="text-xs"><Bell className="h-3 w-3 mr-1" />Push</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={automation.is_active}
                            onCheckedChange={(checked) => 
                              toggleAutomation.mutate({ id: automation.id, is_active: checked })
                            }
                          />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Automation?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{automation.name}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteAutomation.mutate(automation.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium text-lg">No automations yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first automation to engage members automatically
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>History of automation executions</CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : logs && logs.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(log.automation_type)}
                          <div>
                            <p className="font-medium text-sm">
                              {AUTOMATION_TYPES.find(t => t.value === log.automation_type)?.label || log.automation_type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.member?.first_name} {log.member?.last_name} • {format(new Date(log.triggered_at), "PPp")}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(log.status)}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No automation activity yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
