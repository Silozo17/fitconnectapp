import { useState } from "react";
import { RefreshCw, Loader2, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIExerciseAlternatives, ExerciseAlternative } from "@/hooks/useAI";

interface AIExerciseAlternativesProps {
  exerciseName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAlternative?: (alternative: ExerciseAlternative) => void;
}

export const AIExerciseAlternatives = ({
  exerciseName,
  open,
  onOpenChange,
  onSelectAlternative,
}: AIExerciseAlternativesProps) => {
  const { findAlternatives, isLoading } = useAIExerciseAlternatives();
  const [alternatives, setAlternatives] = useState<ExerciseAlternative[] | null>(null);

  const [reason, setReason] = useState<'injury' | 'equipment' | 'preference' | 'difficulty'>('equipment');
  const [availableEquipment, setAvailableEquipment] = useState("");
  const [constraints, setConstraints] = useState("");

  const handleFindAlternatives = async () => {
    const result = await findAlternatives({
      exerciseName,
      reason,
      availableEquipment: availableEquipment || undefined,
      constraints: constraints || undefined,
    });

    if (result?.alternatives) {
      setAlternatives(result.alternatives);
    }
  };

  const handleSelect = (alt: ExerciseAlternative) => {
    if (onSelectAlternative) {
      onSelectAlternative(alt);
    }
    onOpenChange(false);
    setAlternatives(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Find Alternatives for "{exerciseName}"
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {!alternatives ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Why do you need an alternative?</Label>
                <Select value={reason} onValueChange={(v: any) => setReason(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="injury">Injury / Pain</SelectItem>
                    <SelectItem value="equipment">Equipment Not Available</SelectItem>
                    <SelectItem value="preference">Personal Preference</SelectItem>
                    <SelectItem value="difficulty">Too Difficult / Easy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Available Equipment (optional)</Label>
                <Input
                  value={availableEquipment}
                  onChange={(e) => setAvailableEquipment(e.target.value)}
                  placeholder="e.g., dumbbells, resistance bands"
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Constraints (optional)</Label>
                <Input
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="e.g., avoid lower back stress"
                />
              </div>

              <Button
                onClick={handleFindAlternatives}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finding Alternatives...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Find Alternatives
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold text-foreground">{alt.name}</h4>
                    </div>
                    {alt.difficulty && (
                      <Badge variant="secondary" className="text-xs">
                        {alt.difficulty}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {alt.whyGoodAlternative}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {alt.musclesWorked.map((muscle) => (
                      <Badge key={muscle} variant="outline" className="text-xs">
                        {muscle}
                      </Badge>
                    ))}
                  </div>

                  {alt.equipment && (
                    <p className="text-xs text-muted-foreground mb-2">
                      <strong>Equipment:</strong> {alt.equipment}
                    </p>
                  )}

                  {alt.formTips && (
                    <p className="text-xs text-muted-foreground mb-2">
                      <strong>Form Tips:</strong> {alt.formTips}
                    </p>
                  )}

                  {alt.setsRepsRecommendation && (
                    <p className="text-xs text-muted-foreground mb-3">
                      <strong>Recommendation:</strong> {alt.setsRepsRecommendation}
                    </p>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelect(alt)}
                    className="w-full"
                  >
                    Use This Exercise
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => setAlternatives(null)}
                className="w-full"
              >
                Search Again
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
