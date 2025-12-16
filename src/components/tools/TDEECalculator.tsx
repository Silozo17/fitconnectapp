import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Utensils } from "lucide-react";

const TDEECalculator = () => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState("");
  const [result, setResult] = useState<{ tdee: number; lose: number; gain: number } | null>(null);

  const activityLevels = [
    { value: "1.2", label: "Sedentary (little or no exercise)" },
    { value: "1.375", label: "Light (1-3 days/week)" },
    { value: "1.55", label: "Moderate (3-5 days/week)" },
    { value: "1.725", label: "Active (6-7 days/week)" },
    { value: "1.9", label: "Very Active (hard exercise daily)" },
  ];

  const calculateTDEE = () => {
    const a = parseFloat(age);
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const act = parseFloat(activity);
    
    if (a > 0 && w > 0 && h > 0 && gender && act) {
      // Mifflin-St Jeor BMR
      let bmr: number;
      if (gender === "male") {
        bmr = 10 * w + 6.25 * h - 5 * a + 5;
      } else {
        bmr = 10 * w + 6.25 * h - 5 * a - 161;
      }
      
      const tdee = Math.round(bmr * act);
      setResult({
        tdee,
        lose: tdee - 500,
        gain: tdee + 500,
      });
    }
  };

  const reset = () => {
    setAge("");
    setGender("");
    setWeight("");
    setHeight("");
    setActivity("");
    setResult(null);
  };

  return (
    <Card id="tdee" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>TDEE Calculator</CardTitle>
            <CardDescription>Calculate your Total Daily Energy Expenditure</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tdee-age">Age (years)</Label>
            <Input
              id="tdee-age"
              type="number"
              placeholder="30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tdee-weight">Weight (kg)</Label>
            <Input
              id="tdee-weight"
              type="number"
              placeholder="70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tdee-height">Height (cm)</Label>
            <Input
              id="tdee-height"
              type="number"
              placeholder="175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
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
        
        <div className="flex gap-2">
          <Button onClick={calculateTDEE} className="flex-1">Calculate</Button>
          <Button onClick={reset} variant="outline">Reset</Button>
        </div>

        {result && (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-secondary/50 text-center">
              <p className="text-sm text-muted-foreground">Maintenance Calories</p>
              <p className="text-3xl font-bold text-primary">{result.tdee.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">calories/day</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                <p className="text-xs text-muted-foreground">Weight Loss</p>
                <p className="text-xl font-bold text-blue-500">{result.lose.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">cal/day</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 text-center">
                <p className="text-xs text-muted-foreground">Weight Gain</p>
                <p className="text-xl font-bold text-green-500">{result.gain.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">cal/day</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TDEECalculator;
