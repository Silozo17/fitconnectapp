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
import { Loader2, Video, Link } from "lucide-react";

interface CreateExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId: string;
}

const CreateExerciseModal = ({ open, onOpenChange, coachId }: CreateExerciseModalProps) => {
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
          <DialogTitle className="font-display">Create Custom Exercise</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Exercise Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bulgarian Split Squat"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="equipment">Equipment</Label>
            <Input
              id="equipment"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="e.g., Dumbbells, Barbell, Bodyweight"
            />
          </div>

          <div>
            <Label htmlFor="muscleGroups">Muscle Groups (comma-separated)</Label>
            <Input
              id="muscleGroups"
              value={muscleGroups}
              onChange={(e) => setMuscleGroups(e.target.value)}
              placeholder="e.g., quads, glutes, hamstrings"
            />
          </div>

          <div>
            <Label htmlFor="videoUrl">Video URL (YouTube)</Label>
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
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Step-by-step instructions for performing this exercise..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name || createExercise.isPending}>
              {createExercise.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Exercise
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExerciseModal;
