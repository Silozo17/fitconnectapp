import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMilestoneAutomations, MilestoneType } from "@/hooks/useMilestoneAutomations";
import { Loader2, Trophy, Target, Scale, Flame, Zap, CheckCircle2, Play, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MILESTONE_TYPES: { key: MilestoneType; icon: typeof Scale; label: string; color: string }[] = [
  { key: 'streak', icon: Flame, label: 'Session Streak', color: 'text-warning' },
  { key: 'program_complete', icon: CheckCircle2, label: 'Program Complete', color: 'text-success' },
  { key: 'challenge_complete', icon: Trophy, label: 'Challenge Complete', color: 'text-primary' },
  { key: 'adherence', icon: Target, label: 'Adherence Target', color: 'text-accent' },
  { key: 'pr', icon: Zap, label: 'Personal Record', color: 'text-warning' },
];

export function MilestoneSettings() {
  const { t } = useTranslation("coach");
  const { milestones, isLoading, getMilestone, toggleMilestone, updateMilestone, isSaving, defaultMessages, defaultThresholds } = useMilestoneAutomations();
  const [isTesting, setIsTesting] = useState(false);
  
  const handleTestNow = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('detect-milestones', {
        body: {}
      });
      
      if (error) throw error;
      
      toast.success(`Detection complete: ${data.milestones_detected || 0} milestones found, ${data.messages_sent || 0} messages sent`);
    } catch (error) {
      console.error('Test failed:', error);
      toast.error('Failed to run detection');
    } finally {
      setIsTesting(false);
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
      {/* Delivery Notice */}
      <Alert className="border-border/30 bg-card/30 backdrop-blur-xl">
        <Bell className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <span className="font-medium">{t("automations.milestones.deliveryNotice", "How Milestone Celebrations work:")}</span>{" "}
          {t("automations.milestones.deliveryNoticeDesc", "When clients hit achievements, celebratory messages are sent automatically via push notification and appear in-app.")}{" "}
          <span className="text-muted-foreground">
            {t("automations.milestones.deliveryNoticeHint", "If a client has disabled push notifications, they will see the celebration when they next open the app.")}
          </span>
        </AlertDescription>
      </Alert>

      <Card variant="glass">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-warning" />
                {t("automations.milestones.title", "Milestone Celebrations")}
              </CardTitle>
              <CardDescription className="mt-1">
                {t("automations.milestones.description", "Automatically celebrate client achievements")}
              </CardDescription>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleTestNow}
              disabled={isTesting}
              className="w-full sm:w-auto shrink-0"
            >
              {isTesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Run Detection
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {MILESTONE_TYPES.map(({ key, icon: Icon, label, color }) => {
            const milestone = getMilestone(key);
            const isEnabled = milestone?.is_enabled ?? false;
            const threshold = milestone?.threshold_value ?? defaultThresholds[key];
            const message = milestone?.message_template ?? defaultMessages[key];

            return (
              <MilestoneCard
                key={key}
                type={key}
                icon={Icon}
                label={label}
                color={color}
                isEnabled={isEnabled}
                threshold={threshold}
                message={message}
                onToggle={(enabled) => toggleMilestone(key, enabled)}
                onUpdate={(updates) => updateMilestone(key, updates)}
                isSaving={isSaving}
              />
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

interface MilestoneCardProps {
  type: MilestoneType;
  icon: typeof Scale;
  label: string;
  color: string;
  isEnabled: boolean;
  threshold: number;
  message: string;
  onToggle: (enabled: boolean) => void;
  onUpdate: (updates: { threshold_value?: number; message_template?: string }) => void;
  isSaving: boolean;
}

function MilestoneCard({ 
  type, icon: Icon, label, color, isEnabled, threshold, message, onToggle, onUpdate, isSaving 
}: MilestoneCardProps) {
  const [localThreshold, setLocalThreshold] = useState(threshold);
  const [localMessage, setLocalMessage] = useState(message);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalThreshold(threshold);
    setLocalMessage(message);
  }, [threshold, message]);

  useEffect(() => {
    setHasChanges(localThreshold !== threshold || localMessage !== message);
  }, [localThreshold, localMessage, threshold, message]);

  const handleSave = () => {
    onUpdate({ threshold_value: localThreshold, message_template: localMessage });
    setHasChanges(false);
  };

  const getThresholdLabel = () => {
    if (type === 'streak') return 'Days in a row';
    if (type === 'adherence') return 'Percentage (%)';
    return 'Count';
  };

  return (
    <div className="p-3 sm:p-4 rounded-lg border border-border bg-card/50 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${color}`} />
          <span className="font-medium text-sm sm:text-base truncate">{label}</span>
        </div>
        <Switch checked={isEnabled} onCheckedChange={onToggle} className="shrink-0" />
      </div>

      {isEnabled && (
        <>
          <div>
            <Label className="text-xs text-muted-foreground">{getThresholdLabel()}</Label>
            <Input
              type="number"
              className="mt-1 w-32"
              value={localThreshold}
              onChange={(e) => setLocalThreshold(Number(e.target.value))}
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Celebration Message</Label>
            <Textarea
              rows={2}
              className="mt-1 resize-none"
              value={localMessage}
              onChange={(e) => setLocalMessage(e.target.value)}
              placeholder="Use {client_name} and {value} for personalization"
            />
          </div>

          {hasChanges && (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              Save Changes
            </Button>
          )}
        </>
      )}
    </div>
  );
}
