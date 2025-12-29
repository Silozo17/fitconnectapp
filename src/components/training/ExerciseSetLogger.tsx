import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { TrainingLogSet } from "@/hooks/useTrainingLogs";

interface ExerciseSetLoggerProps {
  sets: TrainingLogSet[];
  onChange: (sets: TrainingLogSet[]) => void;
}

export const ExerciseSetLogger = ({ sets, onChange }: ExerciseSetLoggerProps) => {
  const handleAddSet = () => {
    const newSetNumber = sets.length + 1;
    onChange([
      ...sets,
      {
        set_number: newSetNumber,
        reps: null,
        weight_kg: null,
        duration_seconds: null,
        distance_meters: null,
        rpe: null,
        is_warmup: false,
        is_drop_set: false,
        notes: null,
      },
    ]);
  };

  const handleRemoveSet = (index: number) => {
    if (sets.length === 1) return;
    const updated = sets.filter((_, i) => i !== index);
    // Re-number sets
    onChange(updated.map((set, i) => ({ ...set, set_number: i + 1 })));
  };

  const handleSetChange = (index: number, field: keyof TrainingLogSet, value: any) => {
    const updated = [...sets];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {/* Desktop/Tablet Header - Hidden on mobile */}
      <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1">
        <div className="col-span-1">Set</div>
        <div className="col-span-2">Reps</div>
        <div className="col-span-3">Weight (kg)</div>
        <div className="col-span-2 text-center">Warmup</div>
        <div className="col-span-2 text-center">Drop</div>
        <div className="col-span-2"></div>
      </div>

      {sets.map((set, index) => (
        <div key={index}>
          {/* Desktop/Tablet Layout */}
          <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
            <div className="col-span-1 text-sm text-muted-foreground text-center">
              {set.set_number}
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                min="0"
                value={set.reps ?? ""}
                onChange={(e) =>
                  handleSetChange(
                    index,
                    "reps",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                placeholder="0"
                className="h-9"
              />
            </div>
            <div className="col-span-3">
              <Input
                type="number"
                min="0"
                step="0.5"
                value={set.weight_kg ?? ""}
                onChange={(e) =>
                  handleSetChange(
                    index,
                    "weight_kg",
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
                placeholder="0"
                className="h-9"
              />
            </div>
            <div className="col-span-2 flex justify-center">
              <Checkbox
                checked={set.is_warmup}
                onCheckedChange={(checked) =>
                  handleSetChange(index, "is_warmup", checked === true)
                }
              />
            </div>
            <div className="col-span-2 flex justify-center">
              <Checkbox
                checked={set.is_drop_set}
                onCheckedChange={(checked) =>
                  handleSetChange(index, "is_drop_set", checked === true)
                }
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRemoveSet(index)}
                disabled={sets.length === 1}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Mobile Layout - Card style */}
          <div className="sm:hidden flex flex-col gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Set {set.set_number}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRemoveSet(index)}
                disabled={sets.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Reps</Label>
                <Input
                  type="number"
                  min="0"
                  value={set.reps ?? ""}
                  onChange={(e) =>
                    handleSetChange(
                      index,
                      "reps",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  placeholder="0"
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={set.weight_kg ?? ""}
                  onChange={(e) =>
                    handleSetChange(
                      index,
                      "weight_kg",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  placeholder="0"
                  className="h-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={set.is_warmup}
                  onCheckedChange={(checked) =>
                    handleSetChange(index, "is_warmup", checked === true)
                  }
                />
                Warmup
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={set.is_drop_set}
                  onCheckedChange={(checked) =>
                    handleSetChange(index, "is_drop_set", checked === true)
                  }
                />
                Drop Set
              </label>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleAddSet}
        className="w-full mt-2"
      >
        <Plus className="w-3 h-3 mr-1" />
        Add Set
      </Button>
    </div>
  );
};
