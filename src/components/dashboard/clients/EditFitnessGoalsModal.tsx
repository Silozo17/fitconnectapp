import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  currentGoals: string[];
}

const FITNESS_GOALS = [
  "weight_loss",
  "muscle_gain",
  "improve_endurance",
  "increase_strength",
  "improve_flexibility",
  "general_fitness",
  "sports_performance",
  "rehabilitation",
  "stress_relief",
  "better_sleep",
];

export function EditFitnessGoalsModal({ open, onOpenChange, clientId, currentGoals }: Props) {
  const { t } = useTranslation("coach");
  const { t: tCommon } = useTranslation("common");
  const queryClient = useQueryClient();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(currentGoals);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedGoals(currentGoals);
    }
  }, [open, currentGoals]);

  const handleToggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("client_profiles")
        .update({ fitness_goals: selectedGoals })
        .eq("id", clientId);

      if (error) throw error;

      toast.success(t("editGoals.saved", "Fitness goals updated"));
      queryClient.invalidateQueries({ queryKey: ["coach-client-detail", clientId] });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update goals:", error);
      toast.error(t("editGoals.error", "Failed to update goals"));
    } finally {
      setIsSaving(false);
    }
  };

  const getGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      weight_loss: t("goals.weightLoss", "Weight Loss"),
      muscle_gain: t("goals.muscleGain", "Muscle Gain"),
      improve_endurance: t("goals.improveEndurance", "Improve Endurance"),
      increase_strength: t("goals.increaseStrength", "Increase Strength"),
      improve_flexibility: t("goals.improveFlexibility", "Improve Flexibility"),
      general_fitness: t("goals.generalFitness", "General Fitness"),
      sports_performance: t("goals.sportsPerformance", "Sports Performance"),
      rehabilitation: t("goals.rehabilitation", "Rehabilitation"),
      stress_relief: t("goals.stressRelief", "Stress Relief"),
      better_sleep: t("goals.betterSleep", "Better Sleep"),
    };
    return labels[goal] || goal;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("editGoals.title", "Edit Fitness Goals")}</DialogTitle>
          <DialogDescription>
            {t("editGoals.description", "Select the client's fitness goals")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4 max-h-[50vh] overflow-y-auto">
          {FITNESS_GOALS.map((goal) => (
            <div key={goal} className="flex items-center gap-3">
              <Checkbox
                id={goal}
                checked={selectedGoals.includes(goal)}
                onCheckedChange={() => handleToggleGoal(goal)}
              />
              <Label htmlFor={goal} className="cursor-pointer">
                {getGoalLabel(goal)}
              </Label>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("actions.cancel", "Cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {tCommon("actions.save", "Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
