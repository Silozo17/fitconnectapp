import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Edit2
} from "lucide-react";
import { useScheduledCheckins } from "@/hooks/useScheduledCheckins";
import { ScheduledCheckInForm } from "@/components/coach/ScheduledCheckInForm";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";
import { format } from "date-fns";
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

const CoachScheduledCheckins = () => {
  const { t } = useTranslation("coach");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCheckin, setEditingCheckin] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [checkinToDelete, setCheckinToDelete] = useState<string | null>(null);

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
    <DashboardLayout
      title={t("scheduledCheckins.title")}
      description={t("scheduledCheckins.subtitle")}
    >
      <PageHelpBanner
        pageKey="coach_scheduled_checkins"
        title="Automated Client Check-Ins"
        description="Set up recurring messages to stay connected with your clients automatically"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card variant="glass" className="glass-card rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scheduledCheckins.length}</p>
                <p className="text-sm text-muted-foreground">{t("scheduledCheckins.totalScheduled")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="glass-card rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                <Play className="w-7 h-7 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">{t("scheduledCheckins.activeCheckins")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="glass-card rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSent}</p>
                <p className="text-sm text-muted-foreground">{t("scheduledCheckins.messagesSent")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card variant="glass" className="glass-card rounded-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {t("scheduledCheckins.title")}
            </CardTitle>
            <Button onClick={() => { setEditingCheckin(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              {t("scheduledCheckins.createNew")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : scheduledCheckins.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">{t("scheduledCheckins.noCheckins")}</p>
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t("scheduledCheckins.createNew")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledCheckins.map((checkin) => (
                <Card key={checkin.id} variant="glass" className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium truncate">
                            {checkin.client?.first_name} {checkin.client?.last_name}
                          </p>
                          <Badge variant={checkin.is_active ? "default" : "secondary"}>
                            {checkin.is_active ? t("status.active") : t("status.paused")}
                          </Badge>
                          <Badge variant="outline">
                            {t(`scheduledCheckins.scheduleTypes.${checkin.schedule_type}`)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {checkin.message_template}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getScheduleDescription(checkin)}
                          </span>
                          {checkin.last_sent_at && (
                            <span>
                              {t("scheduledCheckins.lastSent")}: {format(new Date(checkin.last_sent_at), "PP")}
                            </span>
                          )}
                          {checkin.next_run_at && checkin.is_active && (
                            <span>
                              {t("scheduledCheckins.nextRun")}: {format(new Date(checkin.next_run_at), "PP 'at' p")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
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
                          onClick={() => handleEdit(checkin)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(checkin.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
            <AlertDialogTitle>{t("scheduledCheckins.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("scheduledCheckins.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default CoachScheduledCheckins;
