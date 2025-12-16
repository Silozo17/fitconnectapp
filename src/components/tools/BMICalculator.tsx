import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

const BMICalculator = () => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<{ bmi: number; category: string; color: string } | null>(null);

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // Convert cm to meters
    
    if (w > 0 && h > 0) {
      const bmi = w / (h * h);
      let category = "";
      let color = "";
      
      if (bmi < 18.5) {
        category = "Underweight";
        color = "text-blue-500";
      } else if (bmi < 25) {
        category = "Normal weight";
        color = "text-primary";
      } else if (bmi < 30) {
        category = "Overweight";
        color = "text-yellow-500";
      } else {
        category = "Obese";
        color = "text-red-500";
      }
      
      setResult({ bmi: Math.round(bmi * 10) / 10, category, color });
    }
  };

  const reset = () => {
    setWeight("");
    setHeight("");
    setResult(null);
  };

  return (
    <Card id="bmi" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>BMI Calculator</CardTitle>
            <CardDescription>Calculate your Body Mass Index</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bmi-weight">Weight (kg)</Label>
            <Input
              id="bmi-weight"
              type="number"
              placeholder="70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmi-height">Height (cm)</Label>
            <Input
              id="bmi-height"
              type="number"
              placeholder="175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={calculateBMI} className="flex-1">Calculate</Button>
          <Button onClick={reset} variant="outline">Reset</Button>
        </div>

        {result && (
          <div className="p-4 rounded-lg bg-secondary/50 text-center space-y-2">
            <p className="text-3xl font-bold">{result.bmi}</p>
            <p className={`font-semibold ${result.color}`}>{result.category}</p>
            <p className="text-sm text-muted-foreground">
              Healthy BMI range: 18.5 - 24.9
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BMICalculator;
