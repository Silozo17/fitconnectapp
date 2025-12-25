import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings } from 'lucide-react';
import { useClientProfileData, calculateBMI, getBMICategory } from '@/hooks/useClientProfileData';
import { cn } from '@/lib/utils';

// Convert polar coordinates to cartesian for SVG
// SVG y-axis points DOWN, so we subtract to draw arcs UPWARD
function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy - radius * Math.sin(angleInRadians)  // SUBTRACT for upward arcs
  };
}

// Generate SVG arc path
// For a semi-circle gauge: angles go from 180 (left) to 0 (right), sweeping upward
function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  
  // For going from higher angle to lower (e.g., 180 to 135), we sweep counter-clockwise (0)
  const sweepFlag = startAngle > endAngle ? 0 : 1;
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}

// Get position for the indicator dot based on BMI value
function getIndicatorPosition(bmi: number, cx: number, cy: number, radius: number) {
  // BMI scale: 15 (underweight) to 40 (obese) mapped across the arc
  const minBMI = 15;
  const maxBMI = 40;
  const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmi));
  const percentage = (clampedBMI - minBMI) / (maxBMI - minBMI);
  
  // Map percentage to angle: 180° (left, low BMI) to 0° (right, high BMI)
  const angle = 180 - (percentage * 180);
  
  return polarToCartesian(cx, cy, radius, angle);
}

export function BMIWidget() {
  const { data: profile, isLoading } = useClientProfileData();
  
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const bmi = calculateBMI(profile?.weight_kg, profile?.height_cm);
  const hasMissingData = !profile?.weight_kg || !profile?.height_cm;
  
  // Gauge dimensions - semi-circle opening upward
  const width = 260;
  const height = 140;
  const cx = width / 2;
  const cy = height - 10; // Center at bottom so arc goes upward
  const radius = 100;
  const strokeWidth = 14;
  
  // Segment angles: 180° (left) to 0° (right), going counter-clockwise (upward arc)
  // Order: Underweight (left/blue) → Normal (green) → Overweight (yellow) → Obese (right/red)
  const segments = [
    { startAngle: 180, endAngle: 137, color: '#3B82F6' },  // Underweight - blue
    { startAngle: 134, endAngle: 91, color: '#22C55E' },   // Normal - green
    { startAngle: 88, endAngle: 45, color: '#EAB308' },    // Overweight - yellow
    { startAngle: 42, endAngle: 0, color: '#EF4444' },     // Obese - red
  ];
  
  const category = bmi ? getBMICategory(bmi) : null;
  const indicatorPos = bmi ? getIndicatorPosition(bmi, cx, cy, radius) : null;
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">BMI</h3>
          {hasMissingData && (
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link to="/dashboard/client/settings/profile">
                <Settings className="h-4 w-4 mr-1" />
                Set up
              </Link>
            </Button>
          )}
        </div>
        
        {hasMissingData ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="opacity-30">
              {segments.map((seg, i) => (
                <path
                  key={i}
                  d={describeArc(cx, cy, radius, seg.startAngle, seg.endAngle)}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
              ))}
            </svg>
            <p className="text-sm text-muted-foreground mt-2">
              {!profile?.height_cm && !profile?.weight_kg 
                ? 'Add your height and weight to see BMI'
                : !profile?.height_cm 
                  ? 'Add your height to calculate BMI'
                  : 'Log your weight to calculate BMI'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
              {/* Background segments */}
              {segments.map((seg, i) => (
                <path
                  key={i}
                  d={describeArc(cx, cy, radius, seg.startAngle, seg.endAngle)}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  className="opacity-80"
                />
              ))}
              
              {/* Indicator dot */}
              {indicatorPos && (
                <circle
                  cx={indicatorPos.x}
                  cy={indicatorPos.y}
                  r={8}
                  fill="white"
                  stroke="hsl(var(--background))"
                  strokeWidth={3}
                  className="drop-shadow-lg"
                />
              )}
            </svg>
            
            {/* BMI Value and Category */}
            <div className="text-center -mt-8">
              <span className="text-4xl font-bold text-foreground">
                {bmi?.toFixed(1)}
              </span>
              {category && (
                <p className={cn('text-sm font-medium mt-1', category.color)}>
                  {category.label}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
