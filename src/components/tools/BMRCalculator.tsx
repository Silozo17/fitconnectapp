import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame } from "lucide-react";

const BMRCalculator = () => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculateBMR = () => {
    const a = parseFloat(age);
    const w = parseFloat(weight);
    const h = parseFloat(height);
    
    if (a > 0 && w > 0 && h > 0 && gender) {
      // Mifflin-St Jeor Equation
      let bmr: number;
      if (gender === "male") {
        bmr = 10 * w + 6.25 * h - 5 * a + 5;
      } else {
        bmr = 10 * w + 6.25 * h - 5 * a - 161;
      }
      setResult(Math.round(bmr));
    }
  };

  const reset = () => {
    setAge("");
    setGender("");
    setWeight("");
    setHeight("");
    setResult(null);
  };

  return (
    <Card id="bmr" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>BMR Calculator</CardTitle>
            <CardDescription>Calculate your Basal Metabolic Rate</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bmr-age">Age (years)</Label>
            <Input
              id="bmr-age"
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
            <Label htmlFor="bmr-weight">Weight (kg)</Label>
            <Input
              id="bmr-weight"
              type="number"
              placeholder="70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmr-height">Height (cm)</Label>
            <Input
              id="bmr-height"
              type="number"
              placeholder="175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={calculateBMR} className="flex-1">Calculate</Button>
          <Button onClick={reset} variant="outline">Reset</Button>
        </div>

        {result && (
          <div className="p-4 rounded-lg bg-secondary/50 text-center space-y-2">
            <p className="text-3xl font-bold">{result.toLocaleString()}</p>
            <p className="text-primary font-semibold">calories/day</p>
            <p className="text-sm text-muted-foreground">
              This is the minimum calories your body needs at complete rest
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BMRCalculator;
