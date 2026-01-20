import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Zap,
  History,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  useAdminAutomations,
  useAdminAutomationLogs,
  AdminAutomationRule,
  TRIGGER_CATEGORIES,
} from "@/hooks/useAdminAutomations";
import { AutomationList } from "@/components/admin/automations/AutomationList";
import { AutomationRuleModal } from "@/components/admin/automations/AutomationRuleModal";
import { AutomationLogs } from "@/components/admin/automations/AutomationLogs";
import { format } from "date-fns";

export default function AdminAutomations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [triggerFilter, setTriggerFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<AdminAutomationRule | null>(null);
  const [viewingLogsAutomation, setViewingLogsAutomation] = useState<AdminAutomationRule | null>(null);
  const [activeTab, setActiveTab] = useState("automations");

  const { data: automations = [], isLoading } = useAdminAutomations();
  const { data: recentLogs = [] } = useAdminAutomationLogs({ limit: 20 });

  // Filter automations
  const filteredAutomations = automations.filter((automation) => {
    const matchesSearch =
      !searchQuery ||
      automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "enabled" && automation.is_enabled) ||
      (statusFilter === "disabled" && !automation.is_enabled);

    const matchesTrigger = triggerFilter === "all" || automation.trigger_type === triggerFilter;

    return matchesSearch && matchesStatus && matchesTrigger;
  });

  // Stats
  const enabledCount = automations.filter((a) => a.is_enabled).length;
  const totalCount = automations.length;

  // Get all trigger types for filter
  const allTriggers = Object.values(TRIGGER_CATEGORIES).flatMap((cat) => cat.triggers);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Automations</h1>
            <p className="text-muted-foreground">
              Create and manage automated messages to users
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Total Automations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">{enabledCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Inactive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalCount - enabledCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="automations" className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Automations
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" />
              Recent Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="automations" className="mt-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search automations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={triggerFilter} onValueChange={setTriggerFilter}>
                <SelectTrigger className="w-[180px]">
                  <Zap className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Triggers</SelectItem>
                  {allTriggers.map((trigger) => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      {trigger.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Automations List */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <AutomationList
                automations={filteredAutomations}
                onEdit={setEditingAutomation}
                onViewLogs={setViewingLogsAutomation}
              />
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>
                  Last 20 automation executions across all rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activity yet</p>
                    <p className="text-sm">Automation activity will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          {log.status === "sent" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : log.status === "failed" ? (
                            <XCircle className="h-5 w-5 text-destructive" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {log.trigger_type.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              User: {log.user_id.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              log.status === "sent"
                                ? "default"
                                : log.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                            className={log.status === "sent" ? "bg-green-500/10 text-green-500" : ""}
                          >
                            {log.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(log.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Modal */}
      <AutomationRuleModal
        open={showCreateModal || !!editingAutomation}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateModal(false);
            setEditingAutomation(null);
          }
        }}
        automation={editingAutomation}
      />

      {/* Logs Modal */}
      <AutomationLogs
        open={!!viewingLogsAutomation}
        onOpenChange={(open) => !open && setViewingLogsAutomation(null)}
        automation={viewingLogsAutomation}
      />
    </AdminLayout>
  );
}
