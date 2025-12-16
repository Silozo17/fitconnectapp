import { useState } from "react";
import { RefreshCw, Loader2, Apple } from "lucide-react";
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
import { useAIFoodSubstitutions, FoodSubstitution } from "@/hooks/useAI";

interface AIFoodSubstitutionsProps {
  foodName: string;
  currentMacros?: { calories: number; protein: number; carbs: number; fat: number };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSubstitution?: (substitution: FoodSubstitution) => void;
}

export const AIFoodSubstitutions = ({
  foodName,
  currentMacros,
  open,
  onOpenChange,
  onSelectSubstitution,
}: AIFoodSubstitutionsProps) => {
  const { findSubstitutions, isLoading } = useAIFoodSubstitutions();
  const [substitutions, setSubstitutions] = useState<FoodSubstitution[] | null>(null);

  const [reason, setReason] = useState<'allergy' | 'dietary' | 'preference' | 'availability'>('preference');
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [allergies, setAllergies] = useState("");

  const handleFindSubstitutions = async () => {
    const result = await findSubstitutions({
      foodName,
      reason,
      currentMacros,
      dietaryRestrictions: dietaryRestrictions ? dietaryRestrictions.split(",").map(d => d.trim()) : undefined,
      allergies: allergies ? allergies.split(",").map(a => a.trim()) : undefined,
    });

    if (result?.substitutions) {
      setSubstitutions(result.substitutions);
    }
  };

  const handleSelect = (sub: FoodSubstitution) => {
    if (onSelectSubstitution) {
      onSelectSubstitution(sub);
    }
    onOpenChange(false);
    setSubstitutions(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Find Substitutions for "{foodName}"
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {!substitutions ? (
            <div className="space-y-4">
              {currentMacros && (
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Current macros: {currentMacros.calories} kcal • {currentMacros.protein}g protein • {currentMacros.carbs}g carbs • {currentMacros.fat}g fat
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Why do you need a substitution?</Label>
                <Select value={reason} onValueChange={(v: any) => setReason(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allergy">Allergy</SelectItem>
                    <SelectItem value="dietary">Dietary Restriction</SelectItem>
                    <SelectItem value="preference">Personal Preference</SelectItem>
                    <SelectItem value="availability">Not Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dietary Restrictions (optional)</Label>
                <Input
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  placeholder="e.g., vegan, gluten-free, halal"
                />
              </div>

              <div className="space-y-2">
                <Label>Allergies to Avoid (optional)</Label>
                <Input
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g., nuts, dairy, shellfish"
                />
              </div>

              <Button
                onClick={handleFindSubstitutions}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finding Substitutions...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Find Substitutions
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {substitutions.map((sub, idx) => (
                <div
                  key={idx}
                  className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Apple className="w-4 h-4 text-green-500" />
                      <h4 className="font-semibold text-foreground">{sub.name}</h4>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {sub.servingSize}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {sub.whyGoodSubstitute}
                  </p>

                  {/* Macros */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center p-2 bg-primary/10 rounded">
                      <p className="text-xs text-muted-foreground">Calories</p>
                      <p className="font-semibold text-primary">{sub.macros.calories}</p>
                    </div>
                    <div className="text-center p-2 bg-red-500/10 rounded">
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="font-semibold text-red-500">{sub.macros.protein}g</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-500/10 rounded">
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p className="font-semibold text-yellow-500">{sub.macros.carbs}g</p>
                    </div>
                    <div className="text-center p-2 bg-blue-500/10 rounded">
                      <p className="text-xs text-muted-foreground">Fat</p>
                      <p className="font-semibold text-blue-500">{sub.macros.fat}g</p>
                    </div>
                  </div>

                  {sub.prepTips && (
                    <p className="text-xs text-muted-foreground mb-2">
                      <strong>Prep Tips:</strong> {sub.prepTips}
                    </p>
                  )}

                  {sub.whereToBuy && (
                    <p className="text-xs text-muted-foreground mb-3">
                      <strong>Where to Buy:</strong> {sub.whereToBuy}
                    </p>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelect(sub)}
                    className="w-full"
                  >
                    Use This Food
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => setSubstitutions(null)}
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
