import { useState } from "react";
import { Sparkles, Loader2, Dumbbell, Clock, Target, AlertCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIWorkoutGenerator, WorkoutPlan } from "@/hooks/useAI";
import { toast } from "sonner";

interface AIWorkoutGeneratorProps {
  onPlanGenerated?: (plan: WorkoutPlan) => void;
}

const focusAreaOptions = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "legs", label: "Legs" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "core", label: "Core" },
];

export const AIWorkoutGenerator = ({ onPlanGenerated }: AIWorkoutGeneratorProps) => {
  const [open, setOpen] = useState(false);
  const { generateWorkout, isLoading } = useAIWorkoutGenerator();
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);

  // Form state
  const [goal, setGoal] = useState("muscle_gain");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [equipment, setEquipment] = useState("full_gym");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [injuries, setInjuries] = useState("");

  const toggleFocusArea = (area: string) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleGenerate = async () => {
    const plan = await generateWorkout({
      goal,
      experienceLevel,
      daysPerWeek,
      equipment,
      focusAreas: focusAreas.length > 0 ? focusAreas : undefined,
      injuries: injuries ? injuries.split(",").map((i) => i.trim()) : undefined,
      sessionDuration,
    });

    if (plan) {
      setGeneratedPlan(plan);
      toast.success("Workout plan generated!");
    }
  };

  const handleUsePlan = () => {
    if (generatedPlan && onPlanGenerated) {
      onPlanGenerated(generatedPlan);
      setOpen(false);
      setGeneratedPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Generate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Workout Generator
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {!generatedPlan ? (
            <div className="space-y-6">
              {/* Goal */}
              <div className="space-y-2">
                <Label>Training Goal</Label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="muscle_gain">Build Muscle</SelectItem>
                    <SelectItem value="fat_loss">Fat Loss</SelectItem>
                    <SelectItem value="strength">Build Strength</SelectItem>
                    <SelectItem value="endurance">Improve Endurance</SelectItem>
                    <SelectItem value="general_fitness">General Fitness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Days per Week & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Days per Week
                  </Label>
                  <Select
                    value={daysPerWeek.toString()}
                    onValueChange={(v) => setDaysPerWeek(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="4">4 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="6">6 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Session Duration
                  </Label>
                  <Select
                    value={sessionDuration.toString()}
                    onValueChange={(v) => setSessionDuration(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="75">75 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Equipment */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  Available Equipment
                </Label>
                <Select value={equipment} onValueChange={setEquipment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_gym">Full Gym</SelectItem>
                    <SelectItem value="home_basics">Home Basics (Dumbbells + Bench)</SelectItem>
                    <SelectItem value="dumbbells_only">Dumbbells Only</SelectItem>
                    <SelectItem value="bodyweight">Bodyweight Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Focus Areas */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Focus Areas (optional)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {focusAreaOptions.map((area) => (
                    <Badge
                      key={area.value}
                      variant={focusAreas.includes(area.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFocusArea(area.value)}
                    >
                      {area.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Injuries */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Injuries / Limitations (optional)
                </Label>
                <Input
                  value={injuries}
                  onChange={(e) => setInjuries(e.target.value)}
                  placeholder="e.g., lower back pain, shoulder impingement"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Workout Plan
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Generated Plan Display */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="font-bold text-lg text-foreground mb-2">
                  {generatedPlan.planName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {generatedPlan.description}
                </p>
              </div>

              {/* Days */}
              <div className="space-y-4">
                {generatedPlan.days.map((day) => (
                  <div key={day.dayNumber} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-foreground">{day.name}</h4>
                      {day.focus && (
                        <Badge variant="secondary">{day.focus}</Badge>
                      )}
                    </div>
                    
                    {day.warmup && (
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong>Warmup:</strong> {day.warmup}
                      </p>
                    )}

                    <div className="space-y-2">
                      {day.exercises.map((ex, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-secondary/30 rounded"
                        >
                          <span className="text-sm font-medium">{ex.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {ex.sets} × {ex.reps} • Rest: {ex.rest}
                          </span>
                        </div>
                      ))}
                    </div>

                    {day.cooldown && (
                      <p className="text-xs text-muted-foreground mt-2">
                        <strong>Cooldown:</strong> {day.cooldown}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Tips */}
              {generatedPlan.tips && generatedPlan.tips.length > 0 && (
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Training Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {generatedPlan.tips.map((tip, idx) => (
                      <li key={idx}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setGeneratedPlan(null)}>
                  Generate New
                </Button>
                <Button onClick={handleUsePlan} className="flex-1">
                  Use This Plan
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
