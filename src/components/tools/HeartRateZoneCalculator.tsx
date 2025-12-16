import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const HeartRateZoneCalculator = () => {
  const [age, setAge] = useState("");
  const [restingHR, setRestingHR] = useState("");
  const [result, setResult] = useState<{ maxHR: number; zones: { zone: number; name: string; min: number; max: number; description: string }[] } | null>(null);

  const calculateZones = () => {
    const a = parseInt(age);
    const rhr = restingHR ? parseInt(restingHR) : 0;
    
    if (a > 0) {
      const maxHR = 220 - a;
      let zones: { zone: number; name: string; min: number; max: number; description: string }[];
      
      if (rhr > 0) {
        // Karvonen formula (more accurate with RHR)
        const hrr = maxHR - rhr; // Heart Rate Reserve
        zones = [
          { zone: 1, name: "Recovery", min: Math.round(rhr + hrr * 0.5), max: Math.round(rhr + hrr * 0.6), description: "Light activity, warm-up" },
          { zone: 2, name: "Fat Burn", min: Math.round(rhr + hrr * 0.6), max: Math.round(rhr + hrr * 0.7), description: "Endurance building" },
          { zone: 3, name: "Aerobic", min: Math.round(rhr + hrr * 0.7), max: Math.round(rhr + hrr * 0.8), description: "Cardio fitness" },
          { zone: 4, name: "Anaerobic", min: Math.round(rhr + hrr * 0.8), max: Math.round(rhr + hrr * 0.9), description: "Performance training" },
          { zone: 5, name: "VO2 Max", min: Math.round(rhr + hrr * 0.9), max: maxHR, description: "Maximum effort" },
        ];
      } else {
        // Simple percentage of max HR
        zones = [
          { zone: 1, name: "Recovery", min: Math.round(maxHR * 0.5), max: Math.round(maxHR * 0.6), description: "Light activity, warm-up" },
          { zone: 2, name: "Fat Burn", min: Math.round(maxHR * 0.6), max: Math.round(maxHR * 0.7), description: "Endurance building" },
          { zone: 3, name: "Aerobic", min: Math.round(maxHR * 0.7), max: Math.round(maxHR * 0.8), description: "Cardio fitness" },
          { zone: 4, name: "Anaerobic", min: Math.round(maxHR * 0.8), max: Math.round(maxHR * 0.9), description: "Performance training" },
          { zone: 5, name: "VO2 Max", min: Math.round(maxHR * 0.9), max: maxHR, description: "Maximum effort" },
        ];
      }
      
      setResult({ maxHR, zones });
    }
  };

  const reset = () => {
    setAge("");
    setRestingHR("");
    setResult(null);
  };

  const zoneColors = [
    "bg-blue-500/20 border-blue-500/50",
    "bg-green-500/20 border-green-500/50",
    "bg-yellow-500/20 border-yellow-500/50",
    "bg-orange-500/20 border-orange-500/50",
    "bg-red-500/20 border-red-500/50",
  ];

  return (
    <Card id="heart-rate" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Heart Rate Zones</CardTitle>
            <CardDescription>Calculate your training heart rate zones</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hr-age">Age (years)</Label>
            <Input
              id="hr-age"
              type="number"
              placeholder="30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hr-resting">Resting HR (optional)</Label>
            <Input
              id="hr-resting"
              type="number"
              placeholder="60"
              value={restingHR}
              onChange={(e) => setRestingHR(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={calculateZones} className="flex-1">Calculate</Button>
          <Button onClick={reset} variant="outline">Reset</Button>
        </div>

        {result && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <p className="text-sm text-muted-foreground">Max Heart Rate</p>
              <p className="text-2xl font-bold text-primary">{result.maxHR} BPM</p>
            </div>
            <div className="space-y-2">
              {result.zones.map((zone, index) => (
                <div key={zone.zone} className={`p-3 rounded-lg border ${zoneColors[index]}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Zone {zone.zone}: {zone.name}</p>
                      <p className="text-xs text-muted-foreground">{zone.description}</p>
                    </div>
                    <p className="font-mono font-bold">{zone.min}-{zone.max}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {restingHR ? "Using Karvonen formula (more accurate)" : "Add resting HR for more accurate results"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HeartRateZoneCalculator;
