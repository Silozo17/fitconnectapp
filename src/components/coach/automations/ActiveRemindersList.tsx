import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useClientReminders, ClientReminder } from "@/hooks/useClientReminders";
import { Loader2, Bell, Trash2, Calendar, Clock, User } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
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
import { DashboardSectionHeader } from "@/components/shared/DashboardSectionHeader";

export function ActiveRemindersList() {
  const { t } = useTranslation("coach");
  const { reminders, isLoading, togglePause, deleteReminder, isUpdating } = useClientReminders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeReminders = reminders.filter(r => r.is_active);

  const frequencyLabels: Record<string, string> = {
    once: "One-time",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    custom: "Custom",
  };

  const getStatusBadge = (reminder: ClientReminder) => {
    if (!reminder.is_active) {
      return <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
    }
    if (reminder.is_paused) {
      return <Badge variant="secondary">Paused</Badge>;
    }
    return <Badge className="bg-success/20 text-success border-success/30">Active</Badge>;
  };

  return (
    <div className="space-y-4">
      <DashboardSectionHeader
        title={t("automations.reminders.activeTitle", "Active Reminders")}
        description={t("automations.reminders.activeDescription", "Reminders currently scheduled for your clients")}
      />

      {activeReminders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground rounded-xl border border-dashed border-border bg-muted/20">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>{t("automations.reminders.noActive", "No active reminders")}</p>
          <p className="text-sm">
            {t("automations.reminders.noActiveHint", "Assign templates to clients to create reminders")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeReminders.map((reminder) => (
            <div 
              key={reminder.id}
              className="p-4 rounded-xl border border-border bg-card/30 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {reminder.client?.first_name} {reminder.client?.last_name}
                    </span>
                    {getStatusBadge(reminder)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {reminder.custom_message || reminder.template?.message_template || "No message"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch 
                    checked={!reminder.is_paused}
                    onCheckedChange={(checked) => togglePause(reminder.id, !checked)}
                    disabled={isUpdating}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this reminder for {reminder.client?.first_name}. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteReminder(reminder.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {frequencyLabels[reminder.frequency]} @ {reminder.time_of_day}
                </span>
                {reminder.last_sent_at && (
                  <span>
                    Last sent: {formatDistanceToNow(new Date(reminder.last_sent_at), { addSuffix: true })}
                  </span>
                )}
                {reminder.next_run_at && !reminder.is_paused && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Next: {format(new Date(reminder.next_run_at), "MMM d, h:mm a")}
                  </span>
                )}
                {reminder.max_sends && (
                  <span>
                    {reminder.sends_count}/{reminder.max_sends} sent
                  </span>
                )}
              </div>

              {reminder.template && (
                <Badge variant="outline" className="text-xs">
                  Template: {reminder.template.name}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
