import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";

const OneRepMaxCalculator = () => {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [result, setResult] = useState<{ oneRM: number; percentages: { percent: number; weight: number }[] } | null>(null);

  const calculate1RM = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    
    if (w > 0 && r > 0 && r <= 12) {
      // Brzycki formula
      const oneRM = Math.round(w * (36 / (37 - r)));
      
      const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60].map(percent => ({
        percent,
        weight: Math.round(oneRM * percent / 100),
      }));
      
      setResult({ oneRM, percentages });
    }
  };

  const reset = () => {
    setWeight("");
    setReps("");
    setResult(null);
  };

  return (
    <Card id="1rm" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>One Rep Max Calculator</CardTitle>
            <CardDescription>Estimate your max lift from submaximal attempts</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="orm-weight">Weight Lifted (kg)</Label>
            <Input
              id="orm-weight"
              type="number"
              placeholder="100"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orm-reps">Reps (1-12)</Label>
            <Input
              id="orm-reps"
              type="number"
              placeholder="5"
              min="1"
              max="12"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={calculate1RM} className="flex-1">Calculate</Button>
          <Button onClick={reset} variant="outline">Reset</Button>
        </div>

        {result && (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-secondary/50 text-center">
              <p className="text-sm text-muted-foreground">Estimated 1 Rep Max</p>
              <p className="text-3xl font-bold text-primary">{result.oneRM} kg</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Training Percentages</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {result.percentages.map(({ percent, weight }) => (
                  <div key={percent} className="flex justify-between p-2 rounded bg-secondary/30">
                    <span className="text-muted-foreground">{percent}%</span>
                    <span className="font-medium">{weight} kg</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OneRepMaxCalculator;
