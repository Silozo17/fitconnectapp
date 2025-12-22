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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Footprints, Heart, Flame, Moon, Loader2, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ManualHealthDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ManualHealthDataModal = ({ open, onOpenChange }: ManualHealthDataModalProps) => {
  const { t } = useTranslation('settings');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("steps");
  
  const [formData, setFormData] = useState({
    steps: "",
    heartRate: "",
    calories: "",
    sleepHours: "",
    sleepMinutes: "",
    activeMinutes: "",
  });

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Get client profile
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!clientProfile) {
        throw new Error("Client profile not found");
      }

      const entries = [];
      const now = new Date().toISOString();

      if (formData.steps && parseInt(formData.steps) > 0) {
        entries.push({
          client_id: clientProfile.id,
          data_type: "steps",
          value: parseInt(formData.steps),
          unit: "count",
          recorded_at: now,
          source: "manual",
        });
      }

      if (formData.heartRate && parseInt(formData.heartRate) > 0) {
        entries.push({
          client_id: clientProfile.id,
          data_type: "heart_rate",
          value: parseInt(formData.heartRate),
          unit: "bpm",
          recorded_at: now,
          source: "manual",
        });
      }

      if (formData.calories && parseInt(formData.calories) > 0) {
        entries.push({
          client_id: clientProfile.id,
          data_type: "calories",
          value: parseInt(formData.calories),
          unit: "kcal",
          recorded_at: now,
          source: "manual",
        });
      }

      if (formData.sleepHours || formData.sleepMinutes) {
        const totalMinutes = (parseInt(formData.sleepHours) || 0) * 60 + (parseInt(formData.sleepMinutes) || 0);
        if (totalMinutes > 0) {
          entries.push({
            client_id: clientProfile.id,
            data_type: "sleep",
            value: totalMinutes,
            unit: "minutes",
            recorded_at: now,
            source: "manual",
          });
        }
      }

      if (formData.activeMinutes && parseInt(formData.activeMinutes) > 0) {
        entries.push({
          client_id: clientProfile.id,
          data_type: "active_minutes",
          value: parseInt(formData.activeMinutes),
          unit: "minutes",
          recorded_at: now,
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
      setFormData({
        steps: "",
        heartRate: "",
        calories: "",
        sleepHours: "",
        sleepMinutes: "",
        activeMinutes: "",
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to log data";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t('manualHealthModal.title')}
          </DialogTitle>
          <DialogDescription>
            {t('manualHealthModal.description')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="steps" className="px-2">
              <Footprints className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="heart" className="px-2">
              <Heart className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="calories" className="px-2">
              <Flame className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="sleep" className="px-2">
              <Moon className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="active" className="px-2">
              <Activity className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="steps" className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Footprints className="h-8 w-8 text-blue-500" />
                <div>
                  <h4 className="font-medium">{t('manualHealthModal.steps.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('manualHealthModal.steps.desc')}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="steps">{t('manualHealthModal.steps.label')}</Label>
                <Input
                  id="steps"
                  type="number"
                  placeholder="10,000"
                  value={formData.steps}
                  onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="heart" className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <Heart className="h-8 w-8 text-red-500" />
                <div>
                  <h4 className="font-medium">{t('manualHealthModal.heartRate.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('manualHealthModal.heartRate.desc')}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heartRate">{t('manualHealthModal.heartRate.label')}</Label>
                <Input
                  id="heartRate"
                  type="number"
                  placeholder="72"
                  value={formData.heartRate}
                  onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="calories" className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Flame className="h-8 w-8 text-orange-500" />
                <div>
                  <h4 className="font-medium">{t('manualHealthModal.calories.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('manualHealthModal.calories.desc')}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="calories">{t('manualHealthModal.calories.label')}</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="500"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="sleep" className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Moon className="h-8 w-8 text-purple-500" />
                <div>
                  <h4 className="font-medium">{t('manualHealthModal.sleep.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('manualHealthModal.sleep.desc')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sleepHours">{t('manualHealthModal.sleep.hours')}</Label>
                  <Input
                    id="sleepHours"
                    type="number"
                    placeholder="7"
                    min="0"
                    max="24"
                    value={formData.sleepHours}
                    onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sleepMinutes">{t('manualHealthModal.sleep.minutes')}</Label>
                  <Input
                    id="sleepMinutes"
                    type="number"
                    placeholder="30"
                    min="0"
                    max="59"
                    value={formData.sleepMinutes}
                    onChange={(e) => setFormData({ ...formData, sleepMinutes: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <Activity className="h-8 w-8 text-green-500" />
                <div>
                  <h4 className="font-medium">{t('manualHealthModal.activeMinutes.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('manualHealthModal.activeMinutes.desc')}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activeMinutes">{t('manualHealthModal.activeMinutes.label')}</Label>
                <Input
                  id="activeMinutes"
                  type="number"
                  placeholder="45"
                  value={formData.activeMinutes}
                  onChange={(e) => setFormData({ ...formData, activeMinutes: e.target.value })}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t('manualHealthModal.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
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
