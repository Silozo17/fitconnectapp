import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

// SVG helper functions for the gauge
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

const getIndicatorPosition = (bmi: number, centerX: number, centerY: number, radius: number) => {
  // BMI range: 15 (underweight) to 40 (obese)
  const minBMI = 15;
  const maxBMI = 40;
  const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmi));
  
  // Map BMI to angle (180 degrees arc, from -90 to 90)
  const percentage = (clampedBMI - minBMI) / (maxBMI - minBMI);
  const angle = -90 + (percentage * 180);
  
  return polarToCartesian(centerX, centerY, radius, angle);
};

const getBMICategory = (bmi: number): { label: string; color: string } => {
  if (bmi < 18.5) {
    return { label: "Underweight", color: "text-blue-500" };
  } else if (bmi < 25) {
    return { label: "Normal", color: "text-emerald-500" };
  } else if (bmi < 30) {
    return { label: "Overweight", color: "text-yellow-500" };
  } else {
    return { label: "Obese", color: "text-red-500" };
  }
};

const BMICalculator = () => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  // Live BMI calculation
  const bmiResult = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // Convert cm to meters
    
    if (w > 0 && h > 0) {
      const bmi = w / (h * h);
      const category = getBMICategory(bmi);
      return { 
        bmi: Math.round(bmi * 10) / 10, 
        category: category.label, 
        color: category.color 
      };
    }
    return null;
  }, [weight, height]);

  const reset = () => {
    setWeight("");
    setHeight("");
  };

  // Gauge configuration
  const segments = [
    { start: -90, end: -45, color: "#3b82f6" },   // Blue - Underweight
    { start: -45, end: 18, color: "#10b981" },    // Green - Normal
    { start: 18, end: 54, color: "#eab308" },     // Yellow - Overweight
    { start: 54, end: 90, color: "#ef4444" }      // Red - Obese
  ];

  const centerX = 100;
  const centerY = 90;
  const radius = 70;

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
        {/* Gauge */}
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 200 110" className="w-full max-w-[200px]">
            {/* Background arc segments */}
            {segments.map((segment, index) => (
              <path
                key={index}
                d={describeArc(centerX, centerY, radius, segment.start, segment.end)}
                fill="none"
                stroke={segment.color}
                strokeWidth="12"
                strokeLinecap="round"
                opacity={0.3}
              />
            ))}
            
            {/* Active segment based on BMI */}
            {bmiResult && segments.map((segment, index) => {
              const bmiAngle = -90 + ((Math.min(40, Math.max(15, bmiResult.bmi)) - 15) / 25) * 180;
              if (bmiAngle >= segment.start && bmiAngle <= segment.end) {
                return (
                  <path
                    key={`active-${index}`}
                    d={describeArc(centerX, centerY, radius, segment.start, Math.min(bmiAngle, segment.end))}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                );
              } else if (bmiAngle > segment.end) {
                return (
                  <path
                    key={`active-${index}`}
                    d={describeArc(centerX, centerY, radius, segment.start, segment.end)}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                );
              }
              return null;
            })}

            {/* Indicator dot */}
            {bmiResult && (
              <circle
                cx={getIndicatorPosition(bmiResult.bmi, centerX, centerY, radius).x}
                cy={getIndicatorPosition(bmiResult.bmi, centerX, centerY, radius).y}
                r="8"
                fill="hsl(var(--background))"
                stroke="hsl(var(--foreground))"
                strokeWidth="3"
                className="drop-shadow-md"
              />
            )}

            {/* BMI Value in center */}
            <text
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              className="fill-foreground font-bold"
              fontSize="24"
            >
              {bmiResult ? bmiResult.bmi : "--"}
            </text>
            <text
              x={centerX}
              y={centerY + 15}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize="10"
            >
              BMI
            </text>
          </svg>

          {/* Category label */}
          {bmiResult && (
            <p className={`font-semibold text-lg ${bmiResult.color}`}>
              {bmiResult.category}
            </p>
          )}
          {!bmiResult && (
            <p className="text-muted-foreground text-sm">
              Enter weight and height
            </p>
          )}
        </div>

        {/* Inputs */}
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
        
        <Button onClick={reset} variant="outline" className="w-full">Reset</Button>

        <p className="text-xs text-muted-foreground text-center">
          Healthy BMI range: 18.5 - 24.9
        </p>
      </CardContent>
    </Card>
  );
};

export default BMICalculator;
