import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAutomationSettings, DropoffRescueConfig } from "@/hooks/useAutomationSettings";
import { Loader2, AlertTriangle, MessageSquare, Bell, Play, Info, Users, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DropoffTimeline } from "./DropoffTimeline";
import { AutomationSummary } from "./AutomationSummary";
import { AtRiskClientsPanel } from "./AtRiskClientsPanel";
import { StatCard, StatCardGrid } from "@/components/shared/StatCard";
import { useDropoffStats } from "@/hooks/useDropoffStats";
import { VariableInserter } from "@/components/coach/message-editor/VariableInserter";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DropoffRescueSettings() {
  const { t } = useTranslation("coach");
  const { settings, isLoading, getSettingForType, getDefaultConfig, updateConfig, toggleAutomation, isSaving } = useAutomationSettings();
  const { stats, isLoading: statsLoading } = useDropoffStats();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const dropoffSetting = getSettingForType('dropoff_rescue');
  const defaultConfig = getDefaultConfig('dropoff_rescue') as DropoffRescueConfig;
  const config = (dropoffSetting?.config || defaultConfig) as DropoffRescueConfig;
  
  const [isEnabled, setIsEnabled] = useState(dropoffSetting?.is_enabled ?? true);
  const [stage1Days, setStage1Days] = useState(config.stage1_days ?? 3);
  const [stage2Days, setStage2Days] = useState(config.stage2_days ?? 7);
  const [stage3Days, setStage3Days] = useState(config.stage3_days ?? 14);
  const [stage1Template, setStage1Template] = useState(
    config.stage1_template ?? "Hey {client_name}! Just checking in - how are things going? Let me know if you need any support!"
  );

  useEffect(() => {
    if (dropoffSetting) {
      setIsEnabled(dropoffSetting.is_enabled);
      const cfg = dropoffSetting.config as DropoffRescueConfig;
      setStage1Days(cfg.stage1_days ?? 3);
      setStage2Days(cfg.stage2_days ?? 7);
      setStage3Days(cfg.stage3_days ?? 14);
      if (cfg.stage1_template) setStage1Template(cfg.stage1_template);
    }
  }, [dropoffSetting]);

  // Validation: stages must be in ascending order
  const isValidConfig = stage1Days < stage2Days && stage2Days < stage3Days;

  const handleSave = () => {
    if (!isValidConfig) {
      toast.error(t("automations.dropoff.invalidConfig", "Stage days must be in ascending order"));
      return;
    }
    
    const newConfig: DropoffRescueConfig = {
      ...config,
      stage1_days: stage1Days,
      stage2_days: stage2Days,
      stage3_days: stage3Days,
      stage1_template: stage1Template,
    };
    updateConfig('dropoff_rescue', newConfig);
    if (isEnabled !== dropoffSetting?.is_enabled) {
      toggleAutomation('dropoff_rescue', isEnabled);
    }
  };

  const [isTesting, setIsTesting] = useState(false);
  
  const handleTestNow = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('detect-client-dropoff', {
        body: {}
      });
      
      if (error) throw error;
      
      toast.success(t("automations.dropoff.detectionComplete", "Detection complete: {{atRisk}} clients at risk, {{messages}} messages sent", {
        atRisk: data.at_risk || 0,
        messages: data.messages_sent || 0
      }));
    } catch (error) {
      console.error('Test failed:', error);
      toast.error(t("automations.dropoff.detectionFailed", "Failed to run detection"));
    } finally {
      setIsTesting(false);
    }
  };

  const handleInsertVariable = (variable: string) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newValue = stage1Template.substring(0, start) + variable + stage1Template.substring(end);
    setStage1Template(newValue);
    
    // Set cursor position after the inserted variable
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = start + variable.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  // Generate summary points for the automation summary
  const summaryPoints = [
    t("automations.dropoff.summary.point1", "Send an automatic check-in message to clients after {{days}} days of inactivity", { days: stage1Days }),
    t("automations.dropoff.summary.point2", "Alert you (coach) when clients are inactive for {{days}} days", { days: stage2Days }),
    t("automations.dropoff.summary.point3", "Trigger a critical notification after {{days}} days of inactivity", { days: stage3Days }),
    t("automations.dropoff.summary.point4", "Automatically reset when clients become active again"),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delivery Notice */}
      <Alert className="border-border/30 bg-card/30 backdrop-blur-xl">
        <MessageSquare className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <span className="font-medium">{t("automations.dropoff.deliveryNotice", "How Drop-off Rescue works:")}</span>{" "}
          {t("automations.dropoff.deliveryNoticeDesc", "The system monitors client activity and automatically sends check-in messages when they become inactive. Messages are delivered via push notification and in-app messaging.")}{" "}
          <span className="text-muted-foreground">
            {t("automations.dropoff.deliveryNoticeHint", "If a client has disabled push notifications, they will only see messages when they open the app.")}
          </span>
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <StatCardGrid columns={3}>
        <StatCard
          title={t("automations.dropoff.stats.monitored", "Clients Monitored")}
          value={stats?.totalClients ?? 0}
          icon={Users}
          loading={statsLoading}
        />
        <StatCard
          title={t("automations.dropoff.stats.atRisk", "Currently at Risk")}
          value={stats?.atRiskCount ?? 0}
          icon={AlertTriangle}
          loading={statsLoading}
          className={stats?.atRiskCount && stats.atRiskCount > 0 ? "border-destructive/50" : ""}
        />
        <StatCard
          title={t("automations.dropoff.stats.messagesSent", "Messages This Month")}
          value={stats?.messagesSentThisMonth ?? 0}
          icon={Mail}
          loading={statsLoading}
        />
      </StatCardGrid>

      {/* At-Risk Clients Panel */}
      <AtRiskClientsPanel isEnabled={isEnabled} />

      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                {t("automations.dropoff.title", "Client Drop-off Rescue")}
              </CardTitle>
              <CardDescription>
                {t("automations.dropoff.description", "Automatically detect and re-engage clients who become inactive")}
              </CardDescription>
            </div>
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual Timeline */}
          <DropoffTimeline 
            stage1Days={stage1Days}
            stage2Days={stage2Days}
            stage3Days={stage3Days}
            isEnabled={isEnabled}
          />

          {/* Helper text explaining timing logic */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {t("automations.dropoff.timingExplanation", "All stages are measured from the client's last activity (workout log, message, or session). When a client becomes active again, they automatically exit the rescue flow.")}
            </AlertDescription>
          </Alert>

          {/* Stage Configuration */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                {t("automations.dropoff.stage1Label", "Stage 1: Auto-message client")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("automations.dropoff.stage1Help", "Days after last activity before sending automatic check-in")}
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                <Slider
                  value={[stage1Days]}
                  onValueChange={([v]) => setStage1Days(v)}
                  min={1}
                  max={14}
                  step={1}
                  className="flex-1"
                  disabled={!isEnabled}
                />
                <span className="text-sm font-medium w-16 sm:w-20 text-right shrink-0">
                  {t("automations.dropoff.daysAfter", "{{days}} days", { days: stage1Days })}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-warning" />
                {t("automations.dropoff.stage2Label", "Stage 2: Alert you (coach)")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("automations.dropoff.stage2Help", "Days after last activity before you receive a notification")}
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                <Slider
                  value={[stage2Days]}
                  onValueChange={([v]) => setStage2Days(v)}
                  min={3}
                  max={21}
                  step={1}
                  className="flex-1"
                  disabled={!isEnabled}
                />
                <span className="text-sm font-medium w-16 sm:w-20 text-right shrink-0">
                  {t("automations.dropoff.daysAfter", "{{days}} days", { days: stage2Days })}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                {t("automations.dropoff.stage3Label", "Stage 3: Critical escalation")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("automations.dropoff.stage3Help", "Days after last activity before critical notification")}
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                <Slider
                  value={[stage3Days]}
                  onValueChange={([v]) => setStage3Days(v)}
                  min={7}
                  max={45}
                  step={1}
                  className="flex-1"
                  disabled={!isEnabled}
                />
                <span className="text-sm font-medium w-16 sm:w-20 text-right shrink-0">
                  {t("automations.dropoff.daysAfter", "{{days}} days", { days: stage3Days })}
                </span>
              </div>
            </div>

            {/* Validation warning */}
            {!isValidConfig && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {t("automations.dropoff.invalidConfigWarning", "Stage days must be in ascending order (Stage 1 < Stage 2 < Stage 3)")}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Message Template Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t("automations.dropoff.messageTemplate", "Stage 1 Message Template")}
                </Label>
                <VariableInserter onInsert={handleInsertVariable} />
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {t("automations.dropoff.messageTemplateHelp", "This message is sent automatically when a client reaches Stage 1. Use variables like {client_name} to personalize.")}
              </p>
              <Textarea
                ref={textareaRef}
                value={stage1Template}
                onChange={(e) => setStage1Template(e.target.value)}
                rows={3}
                className="resize-none"
                disabled={!isEnabled}
                placeholder={t("automations.dropoff.messagePlaceholder", "Hey {client_name}! Just checking in...")}
              />
            </div>
          </div>

          {/* Automation Summary */}
          <AutomationSummary 
            isEnabled={isEnabled}
            summaryPoints={summaryPoints}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !isValidConfig}
              className="flex-1"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("common:common.save", "Save Settings")}
            </Button>
            <Button 
              variant="outline"
              onClick={handleTestNow}
              disabled={isTesting || !isEnabled}
            >
              {isTesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              {t("automations.dropoff.runDetection", "Run Detection Now")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
