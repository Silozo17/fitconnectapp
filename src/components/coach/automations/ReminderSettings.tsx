import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeTimeInput } from "@/components/ui/native-time-input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientReminders, ReminderTemplate } from "@/hooks/useClientReminders";
import { Loader2, Clock, Plus, Users, Smartphone, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { ClientReminderAssignment } from "./ClientReminderAssignment";
import { ActiveRemindersList } from "./ActiveRemindersList";
import { DashboardSectionHeader } from "@/components/shared/DashboardSectionHeader";

export function ReminderSettings() {
  const { t } = useTranslation("coach");
  const { templates, isLoading, createTemplate, deleteTemplate, isCreating, isDeleting } = useClientReminders();
  
  const [isCreatingOpen, setIsCreatingOpen] = useState(false);
  const [assigningTemplate, setAssigningTemplate] = useState<ReminderTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    message_template: '',
    category: 'general',
    default_frequency: 'daily',
    default_time: '09:00',
  });

  const handleCreate = () => {
    createTemplate(newTemplate, {
      onSuccess: () => {
        setIsCreatingOpen(false);
        setNewTemplate({ name: '', message_template: '', category: 'general', default_frequency: 'daily', default_time: '09:00' });
      },
    } as any);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTemplate = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    general: 'bg-muted text-muted-foreground',
    workout: 'bg-primary/20 text-primary',
    nutrition: 'bg-success/20 text-success',
    hydration: 'bg-accent/20 text-accent',
    sleep: 'bg-warning/20 text-warning',
    mindfulness: 'bg-secondary text-secondary-foreground',
  };

  return (
    <div className="space-y-6">
      {/* Delivery Notice */}
      <Alert className="border-border/30 bg-card/30 backdrop-blur-xl rounded-xl">
        <Smartphone className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <span className="font-medium">{t("automations.reminders.deliveryNotice", "How reminders are delivered:")}</span>{" "}
          {t("automations.reminders.deliveryNoticeDesc", "Reminders are sent as push notifications and appear in the client's in-app notification center.")}{" "}
          <span className="text-muted-foreground">
            {t("automations.reminders.deliveryNoticeHint", "If a client has disabled push notifications on their device, they will only see reminders when they open the app.")}
          </span>
        </AlertDescription>
      </Alert>

      {/* Active Reminders List */}
      <ActiveRemindersList />

      {/* Templates Section - NO outer Card wrapper */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <DashboardSectionHeader 
            title={t("automations.reminders.title", "Reminder Templates")}
            description={t("automations.reminders.description", "Create reusable reminder templates for your clients")}
            className="mb-0"
          />
          <Dialog open={isCreatingOpen} onOpenChange={setIsCreatingOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                {t("automations.reminders.add", "Add Template")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("automations.reminders.createTitle", "Create Reminder Template")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Morning Workout Reminder"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newTemplate.category}
                      onValueChange={(v) => setNewTemplate(prev => ({ ...prev, category: v }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="workout">Workout</SelectItem>
                        <SelectItem value="nutrition">Nutrition</SelectItem>
                        <SelectItem value="hydration">Hydration</SelectItem>
                        <SelectItem value="sleep">Sleep</SelectItem>
                        <SelectItem value="mindfulness">Mindfulness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Default Frequency</Label>
                    <Select
                      value={newTemplate.default_frequency}
                      onValueChange={(v) => setNewTemplate(prev => ({ ...prev, default_frequency: v }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Default Time</Label>
                  <NativeTimeInput
                    value={newTemplate.default_time}
                    onChange={(value) => setNewTemplate(prev => ({ ...prev, default_time: value }))}
                  />
                </div>
                <div>
                  <Label>Message Template</Label>
                  <Textarea
                    value={newTemplate.message_template}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, message_template: e.target.value }))}
                    placeholder="Use {client_name} for personalization"
                    rows={3}
                  />
                </div>
                <Button onClick={handleCreate} disabled={isCreating || !newTemplate.name || !newTemplate.message_template} className="w-full">
                  {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground rounded-xl border border-dashed border-border bg-muted/20">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t("automations.reminders.empty", "No reminder templates yet")}</p>
            <p className="text-sm">{t("automations.reminders.emptyHint", "Create templates to quickly assign reminders to clients")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div 
                key={template.id} 
                className="p-4 rounded-xl border border-border bg-card/30 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{template.name}</span>
                    <Badge className={categoryColors[template.category] || categoryColors.general}>
                      {template.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.default_frequency} @ {template.default_time}
                    </Badge>
                    {template.is_system && (
                      <Badge variant="secondary" className="text-xs">System</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {template.message_template}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAssigningTemplate(template)}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                  {!template.is_system && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignment Dialog */}
      <ClientReminderAssignment 
        open={!!assigningTemplate}
        onOpenChange={(open) => !open && setAssigningTemplate(null)}
        template={assigningTemplate}
      />

      {/* Delete Template Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("automations.reminders.deleteTemplateTitle", "Delete Template?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("automations.reminders.deleteTemplateDesc", "This will permanently delete this reminder template. Any active reminders using this template will continue to work but you won't be able to assign it to new clients.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common:common.cancel", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTemplate} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("common:common.delete", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
