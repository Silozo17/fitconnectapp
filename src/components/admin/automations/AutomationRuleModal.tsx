import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  Mail,
  Bell,
  MessageSquare,
  Info,
  Zap,
  Clock,
  Target,
} from "lucide-react";
import {
  AdminAutomationRule,
  TriggerType,
  TargetAudience,
  MessageChannel,
  TriggerConfig,
  TRIGGER_CATEGORIES,
  MESSAGE_VARIABLES,
  useCreateAdminAutomation,
  useUpdateAdminAutomation,
} from "@/hooks/useAdminAutomations";

interface AutomationRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation?: AdminAutomationRule | null;
}

const REQUIRES_DAYS_CONFIG: TriggerType[] = [
  "onboarding_incomplete",
  "inactive_days",
  "no_bookings_days",
  "subscription_expiring",
  "coach_boost_expiring",
  "coach_profile_incomplete",
  "no_availability_set",
];

const REQUIRES_THRESHOLD_CONFIG: TriggerType[] = [
  "booking_milestone",
  "streak_milestone",
  "coach_low_rating",
  "review_milestone",
];

export function AutomationRuleModal({
  open,
  onOpenChange,
  automation,
}: AutomationRuleModalProps) {
  const [activeTab, setActiveTab] = useState("trigger");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType>("user_signup_client");
  const [triggerConfig, setTriggerConfig] = useState<TriggerConfig>({});
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("all");
  const [messageChannels, setMessageChannels] = useState<MessageChannel[]>(["in_app"]);
  const [messageTemplate, setMessageTemplate] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [cooldownDays, setCooldownDays] = useState<number>(7);
  const [maxSendsPerUser, setMaxSendsPerUser] = useState<number | null>(null);
  const [priority, setPriority] = useState(0);

  const createMutation = useCreateAdminAutomation();
  const updateMutation = useUpdateAdminAutomation();

  const isEditing = !!automation;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (automation) {
      setName(automation.name);
      setDescription(automation.description || "");
      setTriggerType(automation.trigger_type);
      setTriggerConfig(automation.trigger_config);
      setTargetAudience(automation.target_audience);
      // Parse message_type - handle both array and legacy string formats
      const mt = automation.message_type;
      if (Array.isArray(mt)) {
        setMessageChannels(mt);
      } else if (typeof mt === "string") {
        try {
          const parsed = JSON.parse(mt);
          setMessageChannels(Array.isArray(parsed) ? parsed : ["in_app"]);
        } catch {
          // Legacy single value - convert to array
          if (mt === "all") {
            setMessageChannels(["in_app", "email", "push"]);
          } else {
            setMessageChannels([mt as MessageChannel]);
          }
        }
      } else {
        setMessageChannels(["in_app"]);
      }
      setMessageTemplate(automation.message_template);
      setMessageSubject(automation.message_subject || "");
      setCooldownDays(automation.cooldown_days || 7);
      setMaxSendsPerUser(automation.max_sends_per_user);
      setPriority(automation.priority);
    } else {
      resetForm();
    }
  }, [automation, open]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setTriggerType("user_signup_client");
    setTriggerConfig({});
    setTargetAudience("all");
    setMessageChannels(["in_app"]);
    setMessageTemplate("");
    setMessageSubject("");
    setCooldownDays(7);
    setMaxSendsPerUser(null);
    setPriority(0);
    setActiveTab("trigger");
  };

  const toggleChannel = (channel: MessageChannel) => {
    setMessageChannels((prev) => {
      if (prev.includes(channel)) {
        // Don't allow removing the last channel
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== channel);
      }
      return [...prev, channel];
    });
  };

  const handleSubmit = () => {
    const data = {
      name,
      description: description || null,
      trigger_type: triggerType,
      trigger_config: triggerConfig,
      target_audience: targetAudience,
      audience_filters: {},
      message_type: messageChannels as any, // Store as array
      message_template: messageTemplate,
      message_subject: messageSubject || null,
      is_enabled: automation?.is_enabled ?? false,
      priority,
      cooldown_days: cooldownDays,
      max_sends_per_user: maxSendsPerUser,
      created_by: null,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: automation.id, ...data },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  const insertVariable = (varName: string) => {
    setMessageTemplate((prev) => prev + `{${varName}}`);
  };

  const needsDaysConfig = REQUIRES_DAYS_CONFIG.includes(triggerType);
  const needsThresholdConfig = REQUIRES_THRESHOLD_CONFIG.includes(triggerType);
  const showEmailSubject = messageChannels.includes("email");

  const isValid = name && triggerType && messageTemplate && messageChannels.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Automation" : "Create Automation"}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trigger" className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Trigger
            </TabsTrigger>
            <TabsTrigger value="audience" className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              Audience
            </TabsTrigger>
            <TabsTrigger value="message" className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Message
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Settings
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4 pr-4">
            <TabsContent value="trigger" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="name">Automation Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Welcome New Clients"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this automation do?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Trigger Type *</Label>
                <div className="space-y-3">
                  {Object.entries(TRIGGER_CATEGORIES).map(([key, category]) => (
                    <div key={key}>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        {category.label}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {category.triggers.map((trigger) => (
                          <Card
                            key={trigger.value}
                            className={`p-3 cursor-pointer transition-colors ${
                              triggerType === trigger.value
                                ? "border-primary bg-primary/5"
                                : "hover:border-muted-foreground/50"
                            }`}
                            onClick={() => setTriggerType(trigger.value as TriggerType)}
                          >
                            <p className="font-medium text-sm">{trigger.label}</p>
                            <p className="text-xs text-muted-foreground">{trigger.description}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {needsDaysConfig && (
                <div className="space-y-2">
                  <Label htmlFor="days">Days Threshold</Label>
                  <Input
                    id="days"
                    type="number"
                    min={1}
                    value={triggerConfig.days || ""}
                    onChange={(e) =>
                      setTriggerConfig((prev) => ({ ...prev, days: parseInt(e.target.value) || undefined }))
                    }
                    placeholder="e.g., 7"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of days for this trigger condition
                  </p>
                </div>
              )}

              {needsThresholdConfig && (
                <div className="space-y-2">
                  <Label htmlFor="threshold">Threshold Value</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min={1}
                    value={triggerConfig.threshold || ""}
                    onChange={(e) =>
                      setTriggerConfig((prev) => ({
                        ...prev,
                        threshold: parseInt(e.target.value) || undefined,
                      }))
                    }
                    placeholder="e.g., 10"
                  />
                  <p className="text-xs text-muted-foreground">
                    The milestone or threshold value to trigger on
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="audience" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "all", label: "All Users", icon: Users },
                    { value: "clients", label: "Clients Only", icon: Users },
                    { value: "coaches", label: "Coaches Only", icon: Users },
                  ].map((option) => (
                    <Card
                      key={option.value}
                      className={`p-4 cursor-pointer transition-colors text-center ${
                        targetAudience === option.value
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/50"
                      }`}
                      onClick={() => setTargetAudience(option.value as TargetAudience)}
                    >
                      <option.icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="font-medium text-sm">{option.label}</p>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">Additional audience filters coming soon</p>
                <p className="text-xs mt-1">Filter by discipline, location, subscription status, etc.</p>
              </div>
            </TabsContent>

            <TabsContent value="message" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Message Channels (select one or more)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "in_app" as MessageChannel, label: "In-App", icon: MessageSquare },
                    { value: "email" as MessageChannel, label: "Email", icon: Mail },
                    { value: "push" as MessageChannel, label: "Push", icon: Bell },
                  ].map((option) => {
                    const isSelected = messageChannels.includes(option.value);
                    return (
                      <Card
                        key={option.value}
                        className={`p-3 cursor-pointer transition-colors text-center relative ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "hover:border-muted-foreground/50"
                        }`}
                        onClick={() => toggleChannel(option.value)}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-[10px] text-primary-foreground">✓</span>
                          </div>
                        )}
                        <option.icon className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
                        <p className="font-medium text-xs">{option.label}</p>
                      </Card>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {messageChannels.map(c => c.replace("_", " ")).join(", ") || "None"}
                </p>
              </div>

              {showEmailSubject && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    placeholder="e.g., Welcome to FitConnect!"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="template">Message Template *</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <Info className="h-3.5 w-3.5 mr-1" />
                          Variables
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <p className="text-xs">
                          Use variables like {"{first_name}"} to personalize messages
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="template"
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder="Hi {first_name}, welcome to FitConnect!"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Available Variables</Label>
                <div className="flex flex-wrap gap-1.5">
                  {MESSAGE_VARIABLES.map((variable) => (
                    <TooltipProvider key={variable.name}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-secondary/80"
                            onClick={() => insertVariable(variable.name)}
                          >
                            {`{${variable.name}}`}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{variable.description}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>

              {messageTemplate && (
                <Card className="p-3 bg-muted/50">
                  <Label className="text-xs text-muted-foreground">Preview</Label>
                  <p className="mt-1 text-sm">
                    {messageTemplate
                      .replace("{first_name}", "John")
                      .replace("{last_name}", "Doe")
                      .replace("{email}", "john@example.com")
                      .replace("{role}", "client")
                      .replace("{days_inactive}", "7")
                      .replace("{total_bookings}", "5")
                      .replace("{streak_days}", "14")
                      .replace("{coach_name}", "Sarah")
                      .replace("{old_tier}", "Free")
                      .replace("{new_tier}", "Pro")
                      .replace("{boost_end_date}", "Jan 28, 2026")
                      .replace("{review_count}", "10")
                      .replace("{session_date}", "Jan 25, 2026")
                      .replace("{client_name}", "Alex")}
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="cooldown">Cooldown Period (days)</Label>
                <Input
                  id="cooldown"
                  type="number"
                  min={0}
                  value={cooldownDays}
                  onChange={(e) => setCooldownDays(parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum days between sending this automation to the same user
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxSends">Max Sends Per User (optional)</Label>
                <Input
                  id="maxSends"
                  type="number"
                  min={1}
                  value={maxSendsPerUser || ""}
                  onChange={(e) =>
                    setMaxSendsPerUser(e.target.value ? parseInt(e.target.value) : null)
                  }
                  placeholder="Unlimited"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum times this automation can be sent to each user (leave empty for unlimited)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority.toString()} onValueChange={(v) => setPriority(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Normal (0)</SelectItem>
                    <SelectItem value="1">High (1)</SelectItem>
                    <SelectItem value="2">Urgent (2)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Higher priority automations are processed first
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Automation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
