import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  MessageSquare,
  Loader2,
  Edit2,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarCheck
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useScheduledCheckins } from "@/hooks/useScheduledCheckins";
import { useLatestCheckinLog } from "@/hooks/useScheduledCheckinLogs";
import { ScheduledCheckInForm } from "@/components/coach/ScheduledCheckInForm";
import { FeatureGate } from "@/components/FeatureGate";
import { format, formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatsGrid } from "@/components/shared/StatsGrid";
import { DashboardSectionHeader } from "@/components/shared/DashboardSectionHeader";

// Component to show delivery status for a check-in
const DeliveryStatus = ({ checkinId }: { checkinId: string }) => {
  const { data: latestLog, isLoading } = useLatestCheckinLog(checkinId);

  if (isLoading) {
    return <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />;
  }

  if (!latestLog) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>No delivery attempts yet</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const statusConfig = {
    sent: {
      icon: CheckCircle2,
      color: "text-success",
      label: "Delivered",
    },
    failed: {
      icon: XCircle,
      color: "text-destructive",
      label: "Failed",
    },
    skipped: {
      icon: AlertCircle,
      color: "text-warning",
      label: "Skipped",
    },
  };

  const config = statusConfig[latestLog.status] || statusConfig.failed;
  const Icon = config.icon;
  const timeAgo = formatDistanceToNow(new Date(latestLog.created_at), { addSuffix: true });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center gap-1">
            <Icon className={`w-3.5 h-3.5 ${config.color}`} />
            {latestLog.notification_sent && (
              <span className="text-[10px] text-muted-foreground">+push</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p className="font-medium">{config.label} {timeAgo}</p>
            {latestLog.error_message && (
              <p className="text-destructive mt-1">{latestLog.error_message}</p>
            )}
            {latestLog.notification_sent && (
              <p className="text-success mt-1">Push notification sent</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const ScheduledCheckinsSettings = () => {
  const { t } = useTranslation("coach");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCheckin, setEditingCheckin] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [checkinToDelete, setCheckinToDelete] = useState<string | null>(null);
  const [testingCheckinId, setTestingCheckinId] = useState<string | null>(null);

  const {
    scheduledCheckins,
    isLoading,
    createCheckin,
    updateCheckin,
    deleteCheckin,
    toggleActive,
    isCreating,
    isUpdating,
    isDeleting,
  } = useScheduledCheckins();

  const handleEdit = (checkin: any) => {
    setEditingCheckin(checkin);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setCheckinToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (checkinToDelete) {
      deleteCheckin(checkinToDelete);
      setDeleteDialogOpen(false);
      setCheckinToDelete(null);
    }
  };

  const handleTestNow = async (checkinId: string) => {
    setTestingCheckinId(checkinId);
    try {
      // Temporarily set next_run_at to now to trigger the check-in
      const { error: updateError } = await supabase
        .from("scheduled_checkins")
        .update({ next_run_at: new Date().toISOString() })
        .eq("id", checkinId);

      if (updateError) throw updateError;

      // Invoke the edge function
      const { error } = await supabase.functions.invoke("process-scheduled-checkins");
      
      if (error) throw error;
      
      toast.success("Test check-in sent successfully");
    } catch (err: any) {
      console.error("Test check-in failed:", err);
      toast.error(err?.message || "Failed to send test check-in");
    } finally {
      setTestingCheckinId(null);
    }
  };

  const activeCount = scheduledCheckins.filter((c) => c.is_active).length;
  const totalSent = scheduledCheckins.reduce((sum, c) => {
    return sum + (c.last_sent_at ? 1 : 0);
  }, 0);

  const getScheduleDescription = (checkin: any) => {
    switch (checkin.schedule_type) {
      case "once":
        return checkin.scheduled_at ? format(new Date(checkin.scheduled_at), "PPP 'at' p") : "One-time";
      case "daily":
        return `Daily at ${checkin.time_of_day}`;
      case "weekly":
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return `Every ${days[checkin.day_of_week || 0]} at ${checkin.time_of_day}`;
      case "monthly":
        return `Day ${checkin.day_of_month} of each month at ${checkin.time_of_day}`;
      default:
        return checkin.schedule_type;
    }
  };

  return (
    <FeatureGate feature="scheduled_checkin_automation">
      <div className="space-y-6">
        {/* Stats Cards - Compact 3-column grid */}
        <StatsGrid columns={3} gap="default">
          <MetricCard
            icon={Calendar}
            label={t("scheduledCheckins.totalScheduled", "Total Scheduled")}
            value={isLoading ? "—" : scheduledCheckins.length}
            color="primary"
            size="sm"
          />
          <MetricCard
            icon={Play}
            label={t("scheduledCheckins.activeCheckins", "Active Check-ins")}
            value={isLoading ? "—" : activeCount}
            color="green"
            size="sm"
          />
          <MetricCard
            icon={MessageSquare}
            label={t("scheduledCheckins.messagesSent", "Messages Sent")}
            value={isLoading ? "—" : totalSent}
            color="cyan"
            size="sm"
          />
        </StatsGrid>

        {/* Delivery Notice */}
        <Alert className="border-border/30 bg-card/30 backdrop-blur-xl rounded-xl">
          <CalendarCheck className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <span className="font-medium">{t("scheduledCheckins.deliveryNotice", "How Scheduled Check-ins work:")}</span>{" "}
            {t("scheduledCheckins.deliveryNoticeDesc", "Messages are sent at the scheduled time via push notification and appear in the client's in-app message center.")}{" "}
            <span className="text-muted-foreground">
              {t("scheduledCheckins.deliveryNoticeHint", "If push notifications are disabled, clients will see check-ins when they open the app.")}
            </span>
          </AlertDescription>
        </Alert>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <DashboardSectionHeader
            title={t("scheduledCheckins.title", "Scheduled Check-ins")}
            className="mb-0"
          />
          <Button size="sm" className="w-full sm:w-auto" onClick={() => { setEditingCheckin(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            {t("scheduledCheckins.createNew", "Create New")}
          </Button>
        </div>

        {/* Check-in Items - flat bordered divs, NOT cards inside cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : scheduledCheckins.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed border-border bg-muted/20">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">{t("scheduledCheckins.noCheckins", "No scheduled check-ins yet")}</p>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t("scheduledCheckins.createNew", "Create New")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledCheckins.map((checkin) => (
              <div 
                key={checkin.id} 
                className="p-4 rounded-xl border border-border bg-card/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                      <p className="font-medium truncate text-sm sm:text-base">
                        {checkin.client?.first_name} {checkin.client?.last_name}
                      </p>
                      <Badge variant={checkin.is_active ? "default" : "secondary"} className="text-xs">
                        {checkin.is_active ? t("scheduledCheckins.statusActive", "Active") : t("scheduledCheckins.statusPaused", "Paused")}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {t(`scheduledCheckins.scheduleTypes.${checkin.schedule_type}`, checkin.schedule_type)}
                      </Badge>
                      <DeliveryStatus checkinId={checkin.id} />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                      {checkin.message_template}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getScheduleDescription(checkin)}
                      </span>
                      {checkin.last_sent_at && (
                        <span className="hidden sm:inline">
                          {t("scheduledCheckins.lastSent", "Last sent")}: {format(new Date(checkin.last_sent_at), "PP")}
                        </span>
                      )}
                      {checkin.next_run_at && checkin.is_active && (
                        <span className="hidden sm:inline">
                          {t("scheduledCheckins.nextRun", "Next")}: {format(new Date(checkin.next_run_at), "PP 'at' p")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-start">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9"
                            onClick={() => handleTestNow(checkin.id)}
                            disabled={testingCheckinId === checkin.id}
                          >
                            {testingCheckinId === checkin.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Test now</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9"
                      onClick={() => toggleActive(checkin.id, !checkin.is_active)}
                    >
                      {checkin.is_active ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9"
                      onClick={() => handleEdit(checkin)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9"
                      onClick={() => handleDelete(checkin.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <ScheduledCheckInForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingCheckin={editingCheckin}
        onSubmit={(data) => {
          if (editingCheckin) {
            updateCheckin({ id: editingCheckin.id, ...data });
          } else {
            createCheckin(data);
          }
          setFormOpen(false);
          setEditingCheckin(null);
        }}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("scheduledCheckins.deleteConfirm", "Delete Check-in?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("scheduledCheckins.deleteConfirmDesc", "This will permanently delete this scheduled check-in.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common:common.cancel", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("common:common.delete", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FeatureGate>
  );
};
