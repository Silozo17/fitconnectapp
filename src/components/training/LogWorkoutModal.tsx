import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import {
  useCreateTrainingLog,
  useUpdateTrainingLog,
  TrainingLog,
  TrainingLogExercise,
  CreateTrainingLogInput,
} from "@/hooks/useTrainingLogs";
import { ExerciseSetLogger } from "./ExerciseSetLogger";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LogWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingLog?: TrainingLog | null;
}

const EMPTY_EXERCISE: TrainingLogExercise = {
  exercise_name: "",
  order_index: 0,
  notes: null,
  sets: [
    {
      set_number: 1,
      reps: null,
      weight_kg: null,
      duration_seconds: null,
      distance_meters: null,
      rpe: null,
      is_warmup: false,
      is_drop_set: false,
      notes: null,
    },
  ],
};

export const LogWorkoutModal = ({
  open,
  onOpenChange,
  editingLog,
}: LogWorkoutModalProps) => {
  const createLog = useCreateTrainingLog();
  const updateLog = useUpdateTrainingLog();

  const [workoutName, setWorkoutName] = useState("");
  const [loggedAt, setLoggedAt] = useState(new Date().toISOString().split("T")[0]);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [rpe, setRpe] = useState<number | null>(null);
  const [fatigueLevel, setFatigueLevel] = useState<"low" | "moderate" | "high" | null>(null);
  const [exercises, setExercises] = useState<TrainingLogExercise[]>([
    { ...EMPTY_EXERCISE, order_index: 0 },
  ]);

  // Populate form when editing
  useEffect(() => {
    if (editingLog) {
      setWorkoutName(editingLog.workout_name);
      setLoggedAt(editingLog.logged_at.split("T")[0]);
      setDurationMinutes(editingLog.duration_minutes);
      setNotes(editingLog.notes || "");
      setRpe(editingLog.rpe);
      setFatigueLevel(editingLog.fatigue_level);
      setExercises(
        editingLog.exercises && editingLog.exercises.length > 0
          ? editingLog.exercises
          : [{ ...EMPTY_EXERCISE, order_index: 0 }]
      );
    } else {
      resetForm();
    }
  }, [editingLog, open]);

  const resetForm = () => {
    setWorkoutName("");
    setLoggedAt(new Date().toISOString().split("T")[0]);
    setDurationMinutes(null);
    setNotes("");
    setRpe(null);
    setFatigueLevel(null);
    setExercises([{ ...EMPTY_EXERCISE, order_index: 0 }]);
  };

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      { ...EMPTY_EXERCISE, order_index: exercises.length },
    ]);
  };

  const handleRemoveExercise = (index: number) => {
    if (exercises.length === 1) return;
    const updated = exercises.filter((_, i) => i !== index);
    // Re-index
    setExercises(updated.map((ex, i) => ({ ...ex, order_index: i })));
  };

  const handleExerciseChange = (index: number, updated: TrainingLogExercise) => {
    const newExercises = [...exercises];
    newExercises[index] = updated;
    setExercises(newExercises);
  };

  const handleSubmit = async () => {
    if (!workoutName.trim()) return;

    // Filter out exercises without names
    const validExercises = exercises.filter((ex) => ex.exercise_name.trim());

    const input: CreateTrainingLogInput = {
      workout_name: workoutName.trim(),
      logged_at: new Date(loggedAt).toISOString(),
      duration_minutes: durationMinutes,
      notes: notes.trim() || null,
      rpe,
      fatigue_level: fatigueLevel,
      exercises: validExercises.map((ex, idx) => ({
        ...ex,
        order_index: idx,
        sets: ex.sets.filter((s) => s.reps || s.weight_kg || s.duration_seconds || s.distance_meters),
      })),
    };

    if (editingLog) {
      await updateLog.mutateAsync({ logId: editingLog.id, input });
    } else {
      await createLog.mutateAsync(input);
    }

    onOpenChange(false);
    resetForm();
  };

  const isSubmitting = createLog.isPending || updateLog.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {editingLog ? "Edit Workout" : "Log Workout"}
          </DialogTitle>
          <DialogDescription>
            {editingLog
              ? "Update your workout details"
              : "Record your training session"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] px-6">
          <div className="space-y-6 py-4">
            {/* Workout Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="workoutName">Workout Name *</Label>
                <Input
                  id="workoutName"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="e.g., Push Day, Leg Day, Full Body"
                />
              </div>
              <div>
                <Label htmlFor="loggedAt">Date</Label>
                <Input
                  id="loggedAt"
                  type="date"
                  value={loggedAt}
                  onChange={(e) => setLoggedAt(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={durationMinutes || ""}
                  onChange={(e) =>
                    setDurationMinutes(e.target.value ? parseInt(e.target.value) : null)
                  }
                  placeholder="60"
                />
              </div>
            </div>

            {/* Exercises */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Exercises</Label>
                <Button variant="outline" size="sm" onClick={handleAddExercise}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Exercise
                </Button>
              </div>

              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 space-y-3 bg-secondary/30"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <Input
                        value={exercise.exercise_name}
                        onChange={(e) =>
                          handleExerciseChange(index, {
                            ...exercise,
                            exercise_name: e.target.value,
                          })
                        }
                        placeholder="Exercise name"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveExercise(index)}
                        disabled={exercises.length === 1}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <ExerciseSetLogger
                      sets={exercise.sets}
                      onChange={(sets) =>
                        handleExerciseChange(index, { ...exercise, sets })
                      }
                    />

                    <Input
                      value={exercise.notes || ""}
                      onChange={(e) =>
                        handleExerciseChange(index, {
                          ...exercise,
                          notes: e.target.value || null,
                        })
                      }
                      placeholder="Exercise notes (optional)"
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Overall workout details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rpe">Overall RPE (1-10)</Label>
                <Select
                  value={rpe?.toString() || ""}
                  onValueChange={(v) => setRpe(v ? parseInt(v) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rate perceived exertion" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value} - {value <= 3 ? "Easy" : value <= 6 ? "Moderate" : value <= 8 ? "Hard" : "Max Effort"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fatigue">Fatigue Level</Label>
                <Select
                  value={fatigueLevel || ""}
                  onValueChange={(v) =>
                    setFatigueLevel(v as "low" | "moderate" | "high" | null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How tired are you?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Workout Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the workout feel? Any observations..."
                rows={3}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 p-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !workoutName.trim()}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editingLog ? "Save Changes" : "Log Workout"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
