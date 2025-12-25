import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings } from 'lucide-react';
import { useClientProfileData, calculateBMI, getBMICategory } from '@/hooks/useClientProfileData';
import { cn } from '@/lib/utils';

// SVG arc path generator
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

// Calculate angle position for BMI value on the gauge (180 degree arc)
function getBMIAngle(bmi: number): number {
  // BMI scale: 15 to 40 mapped to 180 degrees (left to right)
  const minBMI = 15;
  const maxBMI = 40;
  const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmi));
  const percentage = (clampedBMI - minBMI) / (maxBMI - minBMI);
  // Start at 180 (left), end at 0 (right)
  return 180 - (percentage * 180);
}

// Get position for the indicator dot
function getIndicatorPosition(bmi: number, cx: number, cy: number, radius: number) {
  const angle = getBMIAngle(bmi);
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
  
  // Gauge dimensions
  const width = 240;
  const height = 140;
  const cx = width / 2;
  const cy = height - 10;
  const radius = 100;
  const strokeWidth = 16;
  
  // Segment angles (each segment is ~45 degrees with gaps)
  const segments = [
    { startAngle: 180, endAngle: 138, color: '#3B82F6' },  // Underweight - blue
    { startAngle: 135, endAngle: 93, color: '#22C55E' },   // Normal - green
    { startAngle: 90, endAngle: 48, color: '#EAB308' },    // Overweight - yellow
    { startAngle: 45, endAngle: 0, color: '#EF4444' },     // Obese - red
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
