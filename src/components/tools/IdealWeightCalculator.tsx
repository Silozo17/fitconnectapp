import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target } from "lucide-react";

const IdealWeightCalculator = () => {
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<{ devine: number; robinson: number; miller: number; hamwi: number } | null>(null);

  const calculateIdealWeight = () => {
    const h = parseFloat(height);
    
    if (h > 0 && gender) {
      // Height in inches (for formulas designed in imperial)
      const heightInches = h / 2.54;
      const inchesOver5Feet = Math.max(0, heightInches - 60);
      
      let devine: number, robinson: number, miller: number, hamwi: number;
      
      if (gender === "male") {
        // Devine formula
        devine = 50 + 2.3 * inchesOver5Feet;
        // Robinson formula  
        robinson = 52 + 1.9 * inchesOver5Feet;
        // Miller formula
        miller = 56.2 + 1.41 * inchesOver5Feet;
        // Hamwi formula
        hamwi = 48 + 2.7 * inchesOver5Feet;
      } else {
        // Devine formula
        devine = 45.5 + 2.3 * inchesOver5Feet;
        // Robinson formula
        robinson = 49 + 1.7 * inchesOver5Feet;
        // Miller formula
        miller = 53.1 + 1.36 * inchesOver5Feet;
        // Hamwi formula
        hamwi = 45.5 + 2.2 * inchesOver5Feet;
      }
      
      setResult({
        devine: Math.round(devine * 10) / 10,
        robinson: Math.round(robinson * 10) / 10,
        miller: Math.round(miller * 10) / 10,
        hamwi: Math.round(hamwi * 10) / 10,
      });
    }
  };

  const reset = () => {
    setGender("");
    setHeight("");
    setResult(null);
  };

  return (
    <Card id="ideal-weight" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Ideal Body Weight</CardTitle>
            <CardDescription>Calculate your ideal weight using multiple formulas</CardDescription>
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
            <Label htmlFor="ibw-height">Height (cm)</Label>
            <Input
              id="ibw-height"
              type="number"
              placeholder="175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={calculateIdealWeight} className="flex-1">Calculate</Button>
          <Button onClick={reset} variant="outline">Reset</Button>
        </div>

        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-xs text-muted-foreground">Devine Formula</p>
                <p className="text-xl font-bold text-primary">{result.devine} kg</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-xs text-muted-foreground">Robinson Formula</p>
                <p className="text-xl font-bold text-primary">{result.robinson} kg</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-xs text-muted-foreground">Miller Formula</p>
                <p className="text-xl font-bold text-primary">{result.miller} kg</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-xs text-muted-foreground">Hamwi Formula</p>
                <p className="text-xl font-bold text-primary">{result.hamwi} kg</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Different formulas give different results. Use as a general guide, not an exact target.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IdealWeightCalculator;
