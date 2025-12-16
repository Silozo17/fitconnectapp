import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Percent } from "lucide-react";

const BodyFatCalculator = () => {
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [waist, setWaist] = useState("");
  const [neck, setNeck] = useState("");
  const [hip, setHip] = useState("");
  const [result, setResult] = useState<{ bodyFat: number; category: string; color: string } | null>(null);

  const calculateBodyFat = () => {
    const h = parseFloat(height);
    const w = parseFloat(waist);
    const n = parseFloat(neck);
    const hipVal = parseFloat(hip);
    
    if (h > 0 && w > 0 && n > 0 && gender) {
      let bodyFat: number;
      
      // US Navy Method
      if (gender === "male") {
        bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
      } else {
        if (!hipVal || hipVal <= 0) return;
        bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(w + hipVal - n) + 0.22100 * Math.log10(h)) - 450;
      }
      
      let category = "";
      let color = "";
      
      if (gender === "male") {
        if (bodyFat < 6) { category = "Essential Fat"; color = "text-blue-500"; }
        else if (bodyFat < 14) { category = "Athletes"; color = "text-primary"; }
        else if (bodyFat < 18) { category = "Fitness"; color = "text-green-500"; }
        else if (bodyFat < 25) { category = "Average"; color = "text-yellow-500"; }
        else { category = "Obese"; color = "text-red-500"; }
      } else {
        if (bodyFat < 14) { category = "Essential Fat"; color = "text-blue-500"; }
        else if (bodyFat < 21) { category = "Athletes"; color = "text-primary"; }
        else if (bodyFat < 25) { category = "Fitness"; color = "text-green-500"; }
        else if (bodyFat < 32) { category = "Average"; color = "text-yellow-500"; }
        else { category = "Obese"; color = "text-red-500"; }
      }
      
      setResult({ bodyFat: Math.round(bodyFat * 10) / 10, category, color });
    }
  };

  const reset = () => {
    setGender("");
    setHeight("");
    setWaist("");
    setNeck("");
    setHip("");
    setResult(null);
  };

  return (
    <Card id="body-fat" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Percent className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Body Fat Calculator</CardTitle>
            <CardDescription>Estimate body fat % using the Navy method</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="bf-height">Height (cm)</Label>
            <Input
              id="bf-height"
              type="number"
              placeholder="175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bf-waist">Waist (cm)</Label>
            <Input
              id="bf-waist"
              type="number"
              placeholder="80"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bf-neck">Neck (cm)</Label>
            <Input
              id="bf-neck"
              type="number"
              placeholder="38"
              value={neck}
              onChange={(e) => setNeck(e.target.value)}
            />
          </div>
          {gender === "female" && (
            <div className="space-y-2 col-span-2">
              <Label htmlFor="bf-hip">Hip (cm)</Label>
              <Input
                id="bf-hip"
                type="number"
                placeholder="95"
                value={hip}
                onChange={(e) => setHip(e.target.value)}
              />
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button onClick={calculateBodyFat} className="flex-1">Calculate</Button>
          <Button onClick={reset} variant="outline">Reset</Button>
        </div>

        {result && (
          <div className="p-4 rounded-lg bg-secondary/50 text-center space-y-2">
            <p className="text-3xl font-bold">{result.bodyFat}%</p>
            <p className={`font-semibold ${result.color}`}>{result.category}</p>
            <p className="text-sm text-muted-foreground">
              Measure at navel level for waist, narrowest point for neck
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BodyFatCalculator;
