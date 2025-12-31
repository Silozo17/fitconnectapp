import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Users, FileText } from "lucide-react";
import { VariableInserter } from "@/components/coach/message-editor/VariableInserter";

// Generate time options in 5-minute increments (00:00 to 23:55)
const generateTimeOptions = () => {
  const options: { value: string; label: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const hourStr = hour.toString().padStart(2, "0");
      const minuteStr = minute.toString().padStart(2, "0");
      const value = `${hourStr}:${minuteStr}`;
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? "AM" : "PM";
      const label = `${displayHour}:${minuteStr} ${ampm}`;
      options.push({ value, label });
    }
  }
  return options;
};

// Round time to nearest 5-minute increment
const roundToNearest5 = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const roundedMinutes = Math.round(minutes / 5) * 5;
  const adjustedHours = roundedMinutes === 60 ? hours + 1 : hours;
  const finalMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;
  return `${String(adjustedHours % 24).padStart(2, "0")}:${String(finalMinutes).padStart(2, "0")}`;
};

const TIME_OPTIONS = generateTimeOptions();

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCheckin: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function ScheduledCheckInForm({ open, onOpenChange, editingCheckin, onSubmit, isSubmitting }: Props) {
  const { t } = useTranslation("coach");
  const { user } = useAuth();
  
  // Single client mode
  const [clientId, setClientId] = useState("");
  
  // Template/multi-client mode
  const [isTemplate, setIsTemplate] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  
  // Common fields
  const [messageTemplate, setMessageTemplate] = useState("");
  const [scheduleType, setScheduleType] = useState<string>("weekly");
  const [timeOfDay, setTimeOfDay] = useState("09:00");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [linkedTemplateId, setLinkedTemplateId] = useState<string>("");

  const { data: coachProfile } = useQuery({
    queryKey: ["coach-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("coach_profiles").select("id").eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["coach-clients-list", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data } = await supabase
        .from("coach_clients")
        .select(`client:client_profiles!coach_clients_client_id_fkey(id, first_name, last_name)`)
        .eq("coach_id", coachProfile.id)
        .eq("status", "active");
      return data?.map((c) => c.client) || [];
    },
    enabled: !!coachProfile,
  });

  const { data: messageTemplates = [] } = useQuery({
    queryKey: ["message-templates", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data } = await supabase
        .from("message_templates")
        .select("id, name, content, category")
        .eq("coach_id", coachProfile.id)
        .eq("is_active", true)
        .order("category", { ascending: true });
      return data || [];
    },
    enabled: !!coachProfile,
  });

  useEffect(() => {
    if (editingCheckin) {
      setClientId(editingCheckin.client_id);
      setMessageTemplate(editingCheckin.message_template);
      setScheduleType(editingCheckin.schedule_type);
      setTimeOfDay(roundToNearest5(editingCheckin.time_of_day || "09:00"));
      setDayOfWeek(editingCheckin.day_of_week || 1);
      setIsTemplate(editingCheckin.is_template || false);
      setLinkedTemplateId(editingCheckin.linked_template_id || "");
    } else {
      setClientId("");
      setMessageTemplate("");
      setScheduleType("weekly");
      setTimeOfDay("09:00");
      setDayOfWeek(1);
      setIsTemplate(false);
      setSelectedClientIds([]);
      setLinkedTemplateId("");
    }
  }, [editingCheckin, open]);

  const handleTemplateSelect = (templateId: string) => {
    setLinkedTemplateId(templateId);
    const template = messageTemplates.find(t => t.id === templateId);
    if (template) {
      setMessageTemplate(template.content);
    }
  };

  const toggleClientSelection = (id: string) => {
    setSelectedClientIds(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const selectAllClients = () => {
    if (selectedClientIds.length === clients.length) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(clients.map((c: any) => c.id));
    }
  };

  const handleSubmit = () => {
    if (isTemplate) {
      onSubmit({
        message_template: messageTemplate,
        schedule_type: scheduleType,
        time_of_day: timeOfDay,
        day_of_week: scheduleType === "weekly" ? dayOfWeek : null,
        is_template: true,
        client_ids: selectedClientIds,
        linked_template_id: linkedTemplateId || null,
      });
    } else {
      onSubmit({
        client_id: clientId,
        message_template: messageTemplate,
        schedule_type: scheduleType,
        time_of_day: timeOfDay,
        day_of_week: scheduleType === "weekly" ? dayOfWeek : null,
      });
    }
  };

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const isValid = isTemplate 
    ? selectedClientIds.length > 0 && messageTemplate.trim()
    : clientId && messageTemplate.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg overflow-x-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCheckin ? t("scheduledCheckins.editCheckin") : t("scheduledCheckins.createNew")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Toggle - only show when creating new */}
          {!editingCheckin && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Multi-client template</p>
                  <p className="text-xs text-muted-foreground">Send to multiple clients at once</p>
                </div>
              </div>
              <Switch 
                checked={isTemplate} 
                onCheckedChange={(checked) => {
                  setIsTemplate(checked);
                  if (!checked) {
                    setSelectedClientIds([]);
                  }
                }} 
              />
            </div>
          )}

          {/* Client Selection */}
          {isTemplate ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Select Clients ({selectedClientIds.length} selected)</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={selectAllClients}
                  className="text-xs h-7"
                >
                  {selectedClientIds.length === clients.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <ScrollArea className="h-[140px] border rounded-lg p-2">
                <div className="space-y-2">
                  {clients.map((client: any) => (
                    <div 
                      key={client.id} 
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleClientSelection(client.id)}
                    >
                      <Checkbox 
                        checked={selectedClientIds.includes(client.id)}
                        onCheckedChange={() => toggleClientSelection(client.id)}
                      />
                      <span className="text-sm">{client.first_name} {client.last_name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {selectedClientIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedClientIds.slice(0, 3).map(id => {
                    const client = clients.find((c: any) => c.id === id);
                    return client ? (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {client.first_name}
                      </Badge>
                    ) : null;
                  })}
                  {selectedClientIds.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedClientIds.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <Label>{t("scheduledCheckins.client")}</Label>
              <Select value={clientId} onValueChange={setClientId} disabled={!!editingCheckin}>
                <SelectTrigger><SelectValue placeholder={t("scheduledCheckins.selectClient")} /></SelectTrigger>
                <SelectContent>
                  {clients.map((client: any) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Message Template Selection */}
          {messageTemplates.length > 0 && (
            <div>
              <Label className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Use Message Template (optional)
              </Label>
              <Select value={linkedTemplateId} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template or write custom message" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Custom message</SelectItem>
                  {messageTemplates.map((template: any) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>{t("scheduledCheckins.scheduleType")}</Label>
            <Select value={scheduleType} onValueChange={setScheduleType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{t("scheduledCheckins.scheduleTypes.daily")}</SelectItem>
                <SelectItem value="weekly">{t("scheduledCheckins.scheduleTypes.weekly")}</SelectItem>
                <SelectItem value="monthly">{t("scheduledCheckins.scheduleTypes.monthly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {scheduleType === "weekly" && (
            <div>
              <Label>{t("scheduledCheckins.dayOfWeek")}</Label>
              <Select value={String(dayOfWeek)} onValueChange={(v) => setDayOfWeek(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {days.map((day, i) => (
                    <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>{t("scheduledCheckins.timeOfDay")}</Label>
            <Select value={timeOfDay} onValueChange={setTimeOfDay}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Times are scheduled in 5-minute intervals
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>{t("scheduledCheckins.messageTemplate")}</Label>
              <VariableInserter 
                onInsert={(variable) => setMessageTemplate(prev => prev + variable)}
                excludeCategories={["milestone"]}
              />
            </div>
            <Textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder={t("scheduledCheckins.messagePlaceholder")}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use variables like {"{client_first_name}"} to personalize messages
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel", { ns: "common" })}</Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editingCheckin ? t("scheduledCheckins.save") : t("scheduledCheckins.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
