import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Footprints, Heart, Flame, Moon, Loader2, Activity, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface ManualHealthDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type MetricKey = "steps" | "heartRate" | "calories" | "sleep" | "activeMinutes";

interface MetricConfig {
  key: MetricKey;
  icon: typeof Footprints;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const METRICS: MetricConfig[] = [
  { key: "steps", icon: Footprints, colorClass: "text-blue-500", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20" },
  { key: "heartRate", icon: Heart, colorClass: "text-red-500", bgClass: "bg-red-500/10", borderClass: "border-red-500/20" },
  { key: "calories", icon: Flame, colorClass: "text-orange-500", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },
  { key: "sleep", icon: Moon, colorClass: "text-purple-500", bgClass: "bg-purple-500/10", borderClass: "border-purple-500/20" },
  { key: "activeMinutes", icon: Activity, colorClass: "text-green-500", bgClass: "bg-green-500/10", borderClass: "border-green-500/20" },
];

const ManualHealthDataModal = ({ open, onOpenChange }: ManualHealthDataModalProps) => {
  const { t } = useTranslation('settings');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const [enabledMetrics, setEnabledMetrics] = useState<Record<MetricKey, boolean>>({
    steps: false,
    heartRate: false,
    calories: false,
    sleep: false,
    activeMinutes: false,
  });
  
  const [formData, setFormData] = useState({
    steps: "",
    heartRate: "",
    calories: "",
    sleepHours: "",
    sleepMinutes: "",
    activeMinutes: "",
  });

  const toggleMetric = (key: MetricKey) => {
    setEnabledMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetForm = () => {
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    setEnabledMetrics({
      steps: false,
      heartRate: false,
      calories: false,
      sleep: false,
      activeMinutes: false,
    });
    setFormData({
      steps: "",
      heartRate: "",
      calories: "",
      sleepHours: "",
      sleepMinutes: "",
      activeMinutes: "",
    });
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!clientProfile) {
        throw new Error("Client profile not found");
      }

      const entries = [];
      // Use selected date at noon to avoid timezone issues
      const recordedAt = new Date(`${selectedDate}T12:00:00`).toISOString();

      if (enabledMetrics.steps && formData.steps && parseInt(formData.steps) > 0) {
        entries.push({
          client_id: clientProfile.id,
          data_type: "steps",
          value: parseInt(formData.steps),
          unit: "count",
          recorded_at: recordedAt,
          source: "manual",
        });
      }

      if (enabledMetrics.heartRate && formData.heartRate && parseInt(formData.heartRate) > 0) {
        entries.push({
          client_id: clientProfile.id,
          data_type: "heart_rate",
          value: parseInt(formData.heartRate),
          unit: "bpm",
          recorded_at: recordedAt,
          source: "manual",
        });
      }

      if (enabledMetrics.calories && formData.calories && parseInt(formData.calories) > 0) {
        entries.push({
          client_id: clientProfile.id,
          data_type: "calories",
          value: parseInt(formData.calories),
          unit: "kcal",
          recorded_at: recordedAt,
          source: "manual",
        });
      }

      if (enabledMetrics.sleep && (formData.sleepHours || formData.sleepMinutes)) {
        const totalMinutes = (parseInt(formData.sleepHours) || 0) * 60 + (parseInt(formData.sleepMinutes) || 0);
        if (totalMinutes > 0) {
          entries.push({
            client_id: clientProfile.id,
            data_type: "sleep",
            value: totalMinutes,
            unit: "minutes",
            recorded_at: recordedAt,
            source: "manual",
          });
        }
      }

      if (enabledMetrics.activeMinutes && formData.activeMinutes && parseInt(formData.activeMinutes) > 0) {
        entries.push({
          client_id: clientProfile.id,
          data_type: "active_minutes",
          value: parseInt(formData.activeMinutes),
          unit: "minutes",
          recorded_at: recordedAt,
          source: "manual",
        });
      }

      if (entries.length === 0) {
        toast.error(t('manualHealthModal.enterAtLeastOne'));
        return;
      }

      const { error } = await supabase.from("health_data_sync").insert(entries);

      if (error) throw error;

      // NOTE: Manual health data entries (source='manual') should NOT count towards achievements
      // Only wearable-synced data should contribute to health-related achievements
      
      const successMessage = entries.length === 1 
        ? t('manualHealthModal.successSingle')
        : t('manualHealthModal.successMultiple', { count: entries.length });
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: ["health-data"] });
      onOpenChange(false);
      resetForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to log data";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const enabledCount = Object.values(enabledMetrics).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t('manualHealthModal.title')}
          </DialogTitle>
          <DialogDescription>
            {t('manualHealthModal.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Date Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {t('manualHealthModal.selectDate', 'Date to log')}
          </Label>
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-10"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(parseISO(selectedDate), "dd MMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseISO(selectedDate)}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(format(date, "yyyy-MM-dd"));
                    setDatePickerOpen(false);
                  }
                }}
                disabled={(date) => date > new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Metrics Toggle List */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-3 py-2">
            {METRICS.map((metric) => {
              const Icon = metric.icon;
              const isEnabled = enabledMetrics[metric.key];
              
              return (
                <div
                  key={metric.key}
                  className={cn(
                    "rounded-lg border transition-all",
                    isEnabled ? `${metric.bgClass} ${metric.borderClass}` : "bg-muted/30 border-border"
                  )}
                >
                  {/* Header with toggle */}
                  <div 
                    className="flex items-center justify-between p-3 cursor-pointer"
                    onClick={() => toggleMetric(metric.key)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-5 w-5", isEnabled ? metric.colorClass : "text-muted-foreground")} />
                      <div>
                        <h4 className={cn("font-medium text-sm", !isEnabled && "text-muted-foreground")}>
                          {t(`manualHealthModal.${metric.key}.title`)}
                        </h4>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleMetric(metric.key)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  {/* Expandable input area */}
                  {isEnabled && (
                    <div className="px-3 pb-3 pt-1">
                      {metric.key === "sleep" ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="sleepHours" className="text-xs">
                              {t('manualHealthModal.sleep.hours')}
                            </Label>
                            <Input
                              id="sleepHours"
                              type="number"
                              placeholder="7"
                              min="0"
                              max="24"
                              value={formData.sleepHours}
                              onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="sleepMinutes" className="text-xs">
                              {t('manualHealthModal.sleep.minutes')}
                            </Label>
                            <Input
                              id="sleepMinutes"
                              type="number"
                              placeholder="30"
                              min="0"
                              max="59"
                              value={formData.sleepMinutes}
                              onChange={(e) => setFormData({ ...formData, sleepMinutes: e.target.value })}
                              className="h-9"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Label htmlFor={metric.key} className="text-xs">
                            {t(`manualHealthModal.${metric.key}.label`)}
                          </Label>
                          <Input
                            id={metric.key}
                            type="number"
                            placeholder={
                              metric.key === "steps" ? "10,000" :
                              metric.key === "heartRate" ? "72" :
                              metric.key === "calories" ? "500" :
                              "45"
                            }
                            value={formData[metric.key]}
                            onChange={(e) => setFormData({ ...formData, [metric.key]: e.target.value })}
                            className="h-9"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            {t('manualHealthModal.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || enabledCount === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('manualHealthModal.saving')}
              </>
            ) : (
              t('manualHealthModal.save')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManualHealthDataModal;
