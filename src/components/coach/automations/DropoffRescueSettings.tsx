import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAutomationSettings, DropoffRescueConfig } from "@/hooks/useAutomationSettings";
import { Loader2, AlertTriangle, MessageSquare, Bell } from "lucide-react";

export function DropoffRescueSettings() {
  const { t } = useTranslation("coach");
  const { settings, isLoading, getSettingForType, getDefaultConfig, updateConfig, toggleAutomation, isSaving } = useAutomationSettings();
  
  const dropoffSetting = getSettingForType('dropoff_rescue');
  const defaultConfig = getDefaultConfig('dropoff_rescue') as DropoffRescueConfig;
  const config = (dropoffSetting?.config || defaultConfig) as DropoffRescueConfig;
  
  const [isEnabled, setIsEnabled] = useState(dropoffSetting?.is_enabled ?? true);
  const [stage1Days, setStage1Days] = useState(config.stage1_days ?? 3);
  const [stage2Days, setStage2Days] = useState(config.stage2_days ?? 7);
  const [stage3Days, setStage3Days] = useState(config.stage3_days ?? 14);
  const [stage1Template, setStage1Template] = useState(
    config.stage1_template ?? "Hey! Just checking in - how are things going? Let me know if you need any support!"
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

  const handleSave = () => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <div className="space-y-4">
            <div>
              <Label>{t("automations.dropoff.stage1", "Stage 1 - Soft check-in after (days)")}</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[stage1Days]}
                  onValueChange={([v]) => setStage1Days(v)}
                  min={1}
                  max={14}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-16 text-right">{stage1Days} days</span>
              </div>
            </div>

            <div>
              <Label>{t("automations.dropoff.stage2", "Stage 2 - Alert coach after (days)")}</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[stage2Days]}
                  onValueChange={([v]) => setStage2Days(v)}
                  min={3}
                  max={21}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-16 text-right">{stage2Days} days</span>
              </div>
            </div>

            <div>
              <Label>{t("automations.dropoff.stage3", "Stage 3 - Critical alert after (days)")}</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[stage3Days]}
                  onValueChange={([v]) => setStage3Days(v)}
                  min={7}
                  max={45}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-16 text-right">{stage3Days} days</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {t("automations.dropoff.softCheckin", "Stage 1 Message Template")}
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                {t("automations.dropoff.softCheckinHelp", "Sent automatically at stage 1")}
              </p>
              <Textarea
                value={stage1Template}
                onChange={(e) => setStage1Template(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("common.save", "Save Settings")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
