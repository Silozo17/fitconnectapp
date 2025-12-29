import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
      <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1">
        <div className="col-span-1">Set</div>
        <div className="col-span-2">Reps</div>
        <div className="col-span-3">Weight (kg)</div>
        <div className="col-span-2 text-center">Warmup</div>
        <div className="col-span-2 text-center">Drop</div>
        <div className="col-span-2"></div>
      </div>

      {sets.map((set, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 items-center">
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
