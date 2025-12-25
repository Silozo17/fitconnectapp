import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings } from 'lucide-react';
import { useClientProfileData, calculateBMI, getBMICategory } from '@/hooks/useClientProfileData';
import { cn } from '@/lib/utils';

// Convert angle in degrees to radians
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// SVG arc path generator for semi-circle (top half)
// startAngle and endAngle are in degrees where 180 = left, 0 = right
function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  // Convert to radians - we're drawing from left (180°) to right (0°)
  const startRad = toRadians(startAngle);
  const endRad = toRadians(endAngle);
  
  // Calculate start and end points
  const x1 = cx + radius * Math.cos(Math.PI - startRad);
  const y1 = cy - radius * Math.sin(Math.PI - startRad);
  const x2 = cx + radius * Math.cos(Math.PI - endRad);
  const y2 = cy - radius * Math.sin(Math.PI - endRad);
  
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  const sweepFlag = 1; // Always sweep clockwise
  
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;
}

// Get position for the indicator dot
function getIndicatorPosition(bmi: number, cx: number, cy: number, radius: number) {
  // BMI scale: 15 to 40 mapped to 180 degrees (left to right)
  const minBMI = 15;
  const maxBMI = 40;
  const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmi));
  const percentage = (clampedBMI - minBMI) / (maxBMI - minBMI);
  
  // Angle from 180° (left) to 0° (right)
  const angle = 180 - (percentage * 180);
  const rad = toRadians(angle);
  
  return {
    x: cx + radius * Math.cos(Math.PI - rad),
    y: cy - radius * Math.sin(Math.PI - rad)
  };
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
  
  // Gauge dimensions
  const width = 260;
  const height = 150;
  const cx = width / 2;
  const cy = height - 20;
  const radius = 100;
  const strokeWidth = 14;
  
  // Segment angles (180 degree arc split into 4 segments with gaps)
  // Each segment ~42° with 3° gaps between
  const segments = [
    { startAngle: 180, endAngle: 138, color: '#3B82F6' },  // Underweight - blue
    { startAngle: 135, endAngle: 93, color: '#22C55E' },   // Normal - green  
    { startAngle: 90, endAngle: 48, color: '#EAB308' },    // Overweight - yellow
    { startAngle: 45, endAngle: 3, color: '#EF4444' },     // Obese - red
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
