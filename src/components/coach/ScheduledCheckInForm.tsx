import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

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
  const [clientId, setClientId] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [scheduleType, setScheduleType] = useState<string>("weekly");
  const [timeOfDay, setTimeOfDay] = useState("09:00");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);

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

  useEffect(() => {
    if (editingCheckin) {
      setClientId(editingCheckin.client_id);
      setMessageTemplate(editingCheckin.message_template);
      setScheduleType(editingCheckin.schedule_type);
      setTimeOfDay(editingCheckin.time_of_day);
      setDayOfWeek(editingCheckin.day_of_week || 1);
    } else {
      setClientId("");
      setMessageTemplate("");
      setScheduleType("weekly");
      setTimeOfDay("09:00");
      setDayOfWeek(1);
    }
  }, [editingCheckin, open]);

  const handleSubmit = () => {
    onSubmit({
      client_id: clientId,
      message_template: messageTemplate,
      schedule_type: scheduleType,
      time_of_day: timeOfDay,
      day_of_week: scheduleType === "weekly" ? dayOfWeek : null,
    });
  };

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingCheckin ? t("scheduledCheckins.editCheckin") : t("scheduledCheckins.createNew")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
            <Input type="time" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} />
          </div>

          <div>
            <Label>{t("scheduledCheckins.messageTemplate")}</Label>
            <Textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder={t("scheduledCheckins.messagePlaceholder")}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">{t("scheduledCheckins.templateVariables")}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={!clientId || !messageTemplate || isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editingCheckin ? t("common.save") : t("scheduledCheckins.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
