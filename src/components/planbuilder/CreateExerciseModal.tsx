import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExerciseCategories, useCreateExercise } from "@/hooks/useExercises";
import { Loader2, Video } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface CreateExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId: string;
}

const CreateExerciseModal = ({ open, onOpenChange, coachId }: CreateExerciseModalProps) => {
  const { t } = useTranslation("coach");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [equipment, setEquipment] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [instructions, setInstructions] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [muscleGroups, setMuscleGroups] = useState("");

  const { data: categories } = useExerciseCategories();
  const createExercise = useCreateExercise();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createExercise.mutateAsync({
      name,
      category_id: categoryId || undefined,
      equipment: equipment || undefined,
      difficulty,
      instructions: instructions || undefined,
      video_url: videoUrl || undefined,
      muscle_groups: muscleGroups ? muscleGroups.split(",").map(s => s.trim()) : [],
      coach_id: coachId,
      is_custom: true,
    });

    // Reset form
    setName("");
    setCategoryId("");
    setEquipment("");
    setDifficulty("intermediate");
    setInstructions("");
    setVideoUrl("");
    setMuscleGroups("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display">
            {t("workoutBuilder.createExercise.title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t("workoutBuilder.createExercise.exerciseName")} *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("workoutBuilder.createExercise.exerciseNamePlaceholder")}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("workoutBuilder.createExercise.category")}</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("workoutBuilder.createExercise.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("workoutBuilder.createExercise.difficulty")}</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">
                    {t("workoutBuilder.createExercise.beginner")}
                  </SelectItem>
                  <SelectItem value="intermediate">
                    {t("workoutBuilder.createExercise.intermediate")}
                  </SelectItem>
                  <SelectItem value="advanced">
                    {t("workoutBuilder.createExercise.advanced")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="equipment">{t("workoutBuilder.createExercise.equipment")}</Label>
            <Input
              id="equipment"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder={t("workoutBuilder.createExercise.equipmentPlaceholder")}
            />
          </div>

          <div>
            <Label htmlFor="muscleGroups">{t("workoutBuilder.createExercise.muscleGroups")}</Label>
            <Input
              id="muscleGroups"
              value={muscleGroups}
              onChange={(e) => setMuscleGroups(e.target.value)}
              placeholder={t("workoutBuilder.createExercise.muscleGroupsPlaceholder")}
            />
          </div>

          <div>
            <Label htmlFor="videoUrl">{t("workoutBuilder.createExercise.videoUrl")}</Label>
            <div className="relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="instructions">{t("workoutBuilder.createExercise.instructions")}</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={t("workoutBuilder.createExercise.instructionsPlaceholder")}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("workoutBuilder.createExercise.cancel")}
            </Button>
            <Button type="submit" disabled={!name || createExercise.isPending}>
              {createExercise.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {createExercise.isPending 
                ? t("workoutBuilder.createExercise.creating")
                : t("workoutBuilder.createExercise.createExercise")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExerciseModal;
