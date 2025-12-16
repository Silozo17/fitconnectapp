import { useState } from "react";
import { Calculator, Loader2, Target, Lightbulb } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useAIMacroCalculator, MacroCalculation } from "@/hooks/useAI";

interface AIMacroCalculatorProps {
  onMacrosCalculated?: (macros: MacroCalculation) => void;
}

export const AIMacroCalculator = ({ onMacrosCalculated }: AIMacroCalculatorProps) => {
  const [open, setOpen] = useState(false);
  const { calculateMacros, isLoading } = useAIMacroCalculator();
  const [result, setResult] = useState<MacroCalculation | null>(null);

  // Form state
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weightKg, setWeightKg] = useState(75);
  const [heightCm, setHeightCm] = useState(175);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');
  const [goal, setGoal] = useState<'lose_weight' | 'maintain' | 'build_muscle' | 'body_recomp'>('maintain');
  const [dietaryPreference, setDietaryPreference] = useState<'balanced' | 'high_protein' | 'low_carb' | 'keto' | 'vegan'>('balanced');

  const handleCalculate = async () => {
    const calculation = await calculateMacros({
      age,
      gender,
      weightKg,
      heightCm,
      activityLevel,
      goal,
      dietaryPreference,
    });

    if (calculation) {
      setResult(calculation);
    }
  };

  const handleUseMacros = () => {
    if (result && onMacrosCalculated) {
      onMacrosCalculated(result);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          AI Macro Calculator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            AI Macro Calculator
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {!result ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={gender} onValueChange={(v: any) => setGender(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select value={activityLevel} onValueChange={(v: any) => setActivityLevel(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (office job, no exercise)</SelectItem>
                    <SelectItem value="light">Light (1-2 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (athlete/physical job)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Goal</Label>
                <Select value={goal} onValueChange={(v: any) => setGoal(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose_weight">Lose Weight</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="build_muscle">Build Muscle</SelectItem>
                    <SelectItem value="body_recomp">Body Recomposition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dietary Preference</Label>
                <Select value={dietaryPreference} onValueChange={(v: any) => setDietaryPreference(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="high_protein">High Protein</SelectItem>
                    <SelectItem value="low_carb">Low Carb</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCalculate}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Macros
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* TDEE & Target */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">BMR</p>
                  <p className="text-xl font-bold text-foreground">{Math.round(result.bmr)}</p>
                  <p className="text-xs text-muted-foreground">kcal/day</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">TDEE</p>
                  <p className="text-xl font-bold text-foreground">{Math.round(result.tdee)}</p>
                  <p className="text-xs text-muted-foreground">kcal/day</p>
                </div>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="text-xl font-bold text-primary">{Math.round(result.targetCalories)}</p>
                  <p className="text-xs text-muted-foreground">kcal/day</p>
                </div>
              </div>

              {/* Macro Targets */}
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">Daily Macro Targets</h4>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Protein</span>
                      <span className="font-semibold text-red-500">{Math.round(result.macros.protein)}g</span>
                    </div>
                    <Progress value={result.percentages?.protein || 30} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Carbohydrates</span>
                      <span className="font-semibold text-yellow-500">{Math.round(result.macros.carbs)}g</span>
                    </div>
                    <Progress value={result.percentages?.carbs || 40} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fat</span>
                      <span className="font-semibold text-blue-500">{Math.round(result.macros.fat)}g</span>
                    </div>
                    <Progress value={result.percentages?.fat || 30} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h4 className="font-semibold mb-2">Why These Targets?</h4>
                <p className="text-sm text-muted-foreground">{result.explanation}</p>
              </div>

              {/* Tips */}
              {result.tips && result.tips.length > 0 && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold">Tips</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {result.tips.map((tip, idx) => (
                      <li key={idx}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setResult(null)}>
                  Recalculate
                </Button>
                <Button onClick={handleUseMacros} className="flex-1">
                  Use These Macros
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
