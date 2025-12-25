import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings } from 'lucide-react';
import { useClientProfileData, calculateBMI, getBMICategory } from '@/hooks/useClientProfileData';
import { cn } from '@/lib/utils';

// Convert polar coordinates to cartesian for SVG
function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy - radius * Math.sin(angleInRadians)
  };
}

// Generate SVG arc path
function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const sweepFlag = startAngle > endAngle ? 1 : 0;
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}

// Get position for the indicator dot based on BMI value
function getIndicatorPosition(bmi: number, cx: number, cy: number, radius: number) {
  const minBMI = 15;
  const maxBMI = 40;
  const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmi));
  const percentage = (clampedBMI - minBMI) / (maxBMI - minBMI);
  const angle = 180 - (percentage * 180);
  return polarToCartesian(cx, cy, radius, angle);
}

export function BMIWidget() {
  const { data: profile, isLoading } = useClientProfileData();
  
  if (isLoading) {
    return (
      <Card variant="elevated" className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }
  
  const bmi = calculateBMI(profile?.weight_kg, profile?.height_cm);
  const hasMissingData = !profile?.weight_kg || !profile?.height_cm;
  
  // Gauge dimensions
  const width = 280;
  const height = 150;
  const cx = width / 2;
  const cy = height - 10;
  const radius = 110;
  const strokeWidth = 16;
  
  const segments = [
    { startAngle: 180, endAngle: 135, color: 'hsl(217 91% 60%)' },  // blue
    { startAngle: 135, endAngle: 90, color: 'hsl(142 71% 45%)' },   // green
    { startAngle: 90, endAngle: 45, color: 'hsl(48 96% 53%)' },     // yellow
    { startAngle: 45, endAngle: 0, color: 'hsl(0 84% 60%)' },       // red
  ];
  
  const category = bmi ? getBMICategory(bmi) : null;
  const indicatorPos = bmi ? getIndicatorPosition(bmi, cx, cy, radius) : null;
  
  return (
    <Card variant="floating" className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground font-display">Body Mass Index</h3>
          {hasMissingData && (
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
              <Link to="/dashboard/client/settings/profile">
                <Settings className="h-4 w-4 mr-1" />
                Set up
              </Link>
            </Button>
          )}
        </div>
        
        {hasMissingData ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="opacity-20">
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
            <p className="text-sm text-muted-foreground mt-4">
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
              {/* Background track */}
              <path
                d={describeArc(cx, cy, radius, 180, 0)}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              
              {/* Colored segments */}
              {segments.map((seg, i) => (
                <path
                  key={i}
                  d={describeArc(cx, cy, radius, seg.startAngle, seg.endAngle)}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  className="drop-shadow-sm"
                />
              ))}
              
              {/* Indicator - Premium needle design */}
              {indicatorPos && (
                <>
                  {/* Glow effect */}
                  <circle
                    cx={indicatorPos.x}
                    cy={indicatorPos.y}
                    r={14}
                    fill="hsl(var(--primary) / 0.3)"
                    className="animate-pulse"
                  />
                  {/* Main indicator */}
                  <circle
                    cx={indicatorPos.x}
                    cy={indicatorPos.y}
                    r={10}
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--primary))"
                    strokeWidth={4}
                    className="drop-shadow-lg"
                  />
                  {/* Inner dot */}
                  <circle
                    cx={indicatorPos.x}
                    cy={indicatorPos.y}
                    r={4}
                    fill="hsl(var(--primary))"
                  />
                </>
              )}
            </svg>
            
            {/* BMI Value and Category */}
            <div className="text-center -mt-6">
              <span className="text-5xl font-bold text-foreground font-display">
                {bmi?.toFixed(1)}
              </span>
              {category && (
                <p className={cn('text-sm font-medium mt-2', category.color)}>
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
