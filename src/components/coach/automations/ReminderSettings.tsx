import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientReminders, ReminderTemplate } from "@/hooks/useClientReminders";
import { Loader2, Clock, Plus, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClientReminderAssignment } from "./ClientReminderAssignment";
import { ActiveRemindersList } from "./ActiveRemindersList";

export function ReminderSettings() {
  const { t } = useTranslation("coach");
  const { templates, isLoading, createTemplate, isCreating } = useClientReminders();
  
  const [isCreatingOpen, setIsCreatingOpen] = useState(false);
  const [assigningTemplate, setAssigningTemplate] = useState<ReminderTemplate | null>(null);
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
      {/* Active Reminders List */}
      <ActiveRemindersList />

      {/* Templates Card */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t("automations.reminders.title", "Reminder Templates")}
              </CardTitle>
              <CardDescription>
                {t("automations.reminders.description", "Create reusable reminder templates for your clients")}
              </CardDescription>
            </div>
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
                    <Input
                      type="time"
                      value={newTemplate.default_time}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, default_time: e.target.value }))}
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
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t("automations.reminders.empty", "No reminder templates yet")}</p>
              <p className="text-sm">{t("automations.reminders.emptyHint", "Create templates to quickly assign reminders to clients")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  className="p-4 rounded-lg border border-border bg-card/50 flex items-start justify-between gap-4"
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAssigningTemplate(template)}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <ClientReminderAssignment 
        open={!!assigningTemplate}
        onOpenChange={(open) => !open && setAssigningTemplate(null)}
        template={assigningTemplate}
      />
    </div>
  );
}
