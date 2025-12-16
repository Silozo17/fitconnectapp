import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets } from "lucide-react";

const WaterIntakeCalculator = () => {
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("");
  const [climate, setClimate] = useState("");
  const [result, setResult] = useState<{ liters: number; glasses: number } | null>(null);

  const activityLevels = [
    { value: "1", label: "Sedentary (little exercise)" },
    { value: "1.2", label: "Light activity (1-3 days/week)" },
    { value: "1.4", label: "Moderate (3-5 days/week)" },
    { value: "1.6", label: "Very Active (6-7 days/week)" },
  ];

  const climates = [
    { value: "1", label: "Temperate" },
    { value: "1.1", label: "Warm" },
    { value: "1.2", label: "Hot / Humid" },
  ];

  const calculateWaterIntake = () => {
    const w = parseFloat(weight);
    const act = parseFloat(activity);
    const clim = parseFloat(climate);
    
    if (w > 0 && act && clim) {
      // Base: 30-35ml per kg of body weight
      const baseWater = w * 0.033; // 33ml per kg as baseline
      const adjustedWater = baseWater * act * clim;
      
      setResult({
        liters: Math.round(adjustedWater * 10) / 10,
        glasses: Math.round(adjustedWater * 4), // ~250ml glasses
      });
    }
  };

  const reset = () => {
    setWeight("");
    setActivity("");
    setClimate("");
    setResult(null);
  };

  return (
    <Card id="water" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Water Intake Calculator</CardTitle>
            <CardDescription>Calculate your daily hydration needs</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="water-weight">Body Weight (kg)</Label>
            <Input
              id="water-weight"
              type="number"
              placeholder="70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Activity Level</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger>
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent>
                {activityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Climate</Label>
            <Select value={climate} onValueChange={setClimate}>
              <SelectTrigger>
                <SelectValue placeholder="Select climate" />
              </SelectTrigger>
              <SelectContent>
                {climates.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={calculateWaterIntake} className="flex-1">Calculate</Button>
          <Button onClick={reset} variant="outline">Reset</Button>
        </div>

        {result && (
          <div className="p-4 rounded-lg bg-secondary/50 text-center space-y-2">
            <div className="flex justify-center gap-8">
              <div>
                <p className="text-3xl font-bold text-primary">{result.liters}L</p>
                <p className="text-sm text-muted-foreground">per day</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{result.glasses}</p>
                <p className="text-sm text-muted-foreground">glasses (250ml)</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Increase intake during exercise and hot weather
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WaterIntakeCalculator;
