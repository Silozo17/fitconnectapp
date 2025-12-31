import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCoachClients } from "@/hooks/useCoachClients";
import { useClientReminders, ReminderTemplate } from "@/hooks/useClientReminders";
import { Loader2, Users, Calendar, Clock, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { VariableInserter } from "@/components/coach/message-editor/VariableInserter";

interface ClientReminderAssignmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: ReminderTemplate | null;
}

export function ClientReminderAssignment({ open, onOpenChange, template }: ClientReminderAssignmentProps) {
  const { t } = useTranslation("coach");
  const { data: clients = [], isLoading: clientsLoading } = useCoachClients();
  const { createReminder, isCreating } = useClientReminders();

  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [frequency, setFrequency] = useState(template?.default_frequency || "daily");
  const [timeOfDay, setTimeOfDay] = useState(template?.default_time || "09:00");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [customMessage, setCustomMessage] = useState("");
  const [useTemplate, setUseTemplate] = useState(!!template);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState("");
  const [maxSends, setMaxSends] = useState<number | undefined>();
  const [customIntervalDays, setCustomIntervalDays] = useState<number>(3);

  const activeClients = clients.filter(c => c.status === "active");

  const handleSelectAll = () => {
    if (selectedClients.length === activeClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(activeClients.map(c => c.client_id));
    }
  };

  const toggleClient = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleAssign = async () => {
    if (selectedClients.length === 0) return;

    const message = useTemplate && template 
      ? template.message_template 
      : customMessage;

    if (!message && !template) {
      return;
    }

    // Create reminders for each selected client
    for (const clientId of selectedClients) {
      createReminder({
        client_id: clientId,
        template_id: useTemplate && template ? template.id : undefined,
        custom_message: !useTemplate ? customMessage : undefined,
        frequency,
        time_of_day: timeOfDay,
        day_of_week: frequency === "weekly" ? dayOfWeek : undefined,
        start_date: startDate,
        end_date: endDate || undefined,
        custom_interval_days: frequency === "custom" ? customIntervalDays : undefined,
        max_sends: maxSends,
      });
    }

    // Reset and close
    setSelectedClients([]);
    setCustomMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {template 
              ? t("automations.reminders.assignTemplate", "Assign Template to Clients")
              : t("automations.reminders.createReminder", "Create Client Reminder")
            }
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Client Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Select Clients</Label>
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                {selectedClients.length === activeClients.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            
            {clientsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active clients</p>
              </div>
            ) : (
              <ScrollArea className="h-40 rounded-md border p-3">
                <div className="space-y-2">
                  {activeClients.map(client => (
                    <div 
                      key={client.client_id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleClient(client.client_id)}
                    >
                      <Checkbox 
                        checked={selectedClients.includes(client.client_id)}
                        onCheckedChange={() => toggleClient(client.client_id)}
                      />
                      <span className="text-sm">
                        {client.client_profile?.first_name} {client.client_profile?.last_name}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            <p className="text-xs text-muted-foreground">
              {selectedClients.length} client{selectedClients.length !== 1 ? "s" : ""} selected
            </p>
          </div>

          {/* Message Content */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Message
            </Label>
            
            {template && (
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="useTemplate"
                  checked={useTemplate} 
                  onCheckedChange={(checked) => setUseTemplate(!!checked)}
                />
                <label htmlFor="useTemplate" className="text-sm cursor-pointer">
                  Use template: "{template.name}"
                </label>
              </div>
            )}

            {(!useTemplate || !template) && (
              <div className="space-y-2">
                <VariableInserter 
                  onInsert={(variable) => setCustomMessage(prev => prev + variable)}
                  excludeCategories={["milestone"]}
                />
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Use {client_first_name} for personalization. E.g., 'Hey {client_first_name}, don't forget to log your workout today!'"
                  rows={3}
                />
              </div>
            )}

            {useTemplate && template && (
              <div className="p-3 rounded-md bg-muted/50 text-sm text-muted-foreground italic">
                "{template.message_template}"
              </div>
            )}
          </div>

          {/* Schedule Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Frequency
              </Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">One-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom interval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </Label>
              <Input 
                type="time" 
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
              />
            </div>

            {frequency === "weekly" && (
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select value={String(dayOfWeek)} onValueChange={(v) => setDayOfWeek(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {frequency === "custom" && (
              <div className="space-y-2">
                <Label>Every X Days</Label>
                <Input 
                  type="number" 
                  min={1}
                  value={customIntervalDays}
                  onChange={(e) => setCustomIntervalDays(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date (optional)</Label>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>

          {/* Max Sends */}
          {frequency !== "once" && (
            <div className="space-y-2">
              <Label>Max Sends (optional)</Label>
              <Input 
                type="number" 
                min={1}
                placeholder="Leave empty for unlimited"
                value={maxSends || ""}
                onChange={(e) => setMaxSends(e.target.value ? Number(e.target.value) : undefined)}
              />
              <p className="text-xs text-muted-foreground">
                Stop sending after this many messages
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={
              isCreating || 
              selectedClients.length === 0 || 
              (!useTemplate && !customMessage && !template)
            }
          >
            {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Assign to {selectedClients.length} Client{selectedClients.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
