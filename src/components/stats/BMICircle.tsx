import * as React from 'react';
import { cn } from '@/lib/utils';

interface BMICircleProps {
  bmi: number | null;
  size?: 'sm' | 'md' | 'lg' | number;
  showCategory?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 100,
  md: 140,
  lg: 180,
};

// BMI Categories and colors - thresholds based on WHO standards
const getBMICategory = (bmi: number): { label: string; color: string; hsl: string } => {
  // Ensure bmi is a valid number
  const numericBmi = Number(bmi);
  if (isNaN(numericBmi)) return { label: 'Unknown', color: 'text-muted-foreground', hsl: 'hsl(0, 0%, 50%)' };
  
  if (numericBmi < 18.5) return { label: 'Underweight', color: 'text-blue-400', hsl: 'hsl(217, 91%, 60%)' };
  if (numericBmi < 25) return { label: 'Normal', color: 'text-emerald-400', hsl: 'hsl(142, 71%, 45%)' };
  if (numericBmi < 30) return { label: 'Overweight', color: 'text-yellow-400', hsl: 'hsl(48, 96%, 53%)' };
  return { label: 'Obese', color: 'text-red-400', hsl: 'hsl(0, 84%, 60%)' };
};

// Segment definitions - equal visual segments (90° each) for better aesthetics
// Visual: 4 equal segments, but indicator position still maps to actual BMI
const segments = [
  { startAngle: -90, endAngle: 0, color: 'hsl(217, 91%, 60%)', range: [10, 18.5] },     // blue - underweight
  { startAngle: 0, endAngle: 90, color: 'hsl(142, 71%, 45%)', range: [18.5, 25] },      // green - normal
  { startAngle: 90, endAngle: 180, color: 'hsl(48, 96%, 53%)', range: [25, 30] },       // yellow - overweight
  { startAngle: 180, endAngle: 270, color: 'hsl(0, 84%, 60%)', range: [30, 50] },       // red - obese
];

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

// Calculate the angle for the indicator dot based on BMI value
// Maps BMI to position within equal visual segments
function getIndicatorAngle(bmi: number): number {
  const segmentRanges = [
    { min: 10, max: 18.5, startAngle: -90, endAngle: 0 },    // Underweight (blue)
    { min: 18.5, max: 25, startAngle: 0, endAngle: 90 },     // Normal (green)
    { min: 25, max: 30, startAngle: 90, endAngle: 180 },     // Overweight (yellow)
    { min: 30, max: 50, startAngle: 180, endAngle: 270 },    // Obese (red)
  ];
  
  const clampedBMI = Math.max(10, Math.min(50, bmi));
  
  // Find which segment the BMI falls into and calculate position within it
  for (const seg of segmentRanges) {
    if (clampedBMI >= seg.min && clampedBMI < seg.max) {
      const progress = (clampedBMI - seg.min) / (seg.max - seg.min);
      return seg.startAngle + progress * (seg.endAngle - seg.startAngle);
    }
  }
  
  // Edge case: BMI >= 50, return end of obese segment
  return 270;
}

export function BMICircle({
  bmi,
  size = 'md',
  showCategory = true,
  className,
}: BMICircleProps) {
  // Force numeric conversion at entry point to ensure consistency
  const numericBmi = bmi !== null && bmi !== undefined ? Number(bmi) : null;
  const validBmi = numericBmi !== null && !isNaN(numericBmi) && isFinite(numericBmi) ? numericBmi : null;
  
  const resolvedSize = typeof size === 'number' ? size : sizeMap[size];
  const strokeWidth = resolvedSize * 0.1;
  const indicatorRadius = strokeWidth * 0.8;
  const indicatorStroke = 3;
  // Add padding to prevent indicator clipping
  const padding = indicatorRadius + indicatorStroke + 2;
  const containerSize = resolvedSize + padding * 2;
  const radius = (resolvedSize - strokeWidth) / 2;
  const cx = resolvedSize / 2 + padding;
  const cy = resolvedSize / 2 + padding;

  // Use validBmi for ALL calculations to ensure consistency
  const category = validBmi ? getBMICategory(validBmi) : null;
  const indicatorAngle = validBmi ? getIndicatorAngle(validBmi) : -90;
  const indicatorPos = validBmi ? polarToCartesian(cx, cy, radius, indicatorAngle) : null;

  if (!validBmi) {
    return (
      <div 
        className={cn('relative flex items-center justify-center', className)}
        style={{ width: containerSize, height: containerSize }}
      >
        <svg width={containerSize} height={containerSize} className="opacity-30" style={{ overflow: 'visible' }}>
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-muted-foreground text-xs">No data</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: containerSize, height: containerSize }}
    >
      <svg width={containerSize} height={containerSize} style={{ overflow: 'visible' }}>
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted) / 0.2)"
          strokeWidth={strokeWidth}
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
            style={{
              filter: category && seg.color === category.hsl 
                ? `drop-shadow(0 0 8px ${seg.color.replace(')', ' / 0.5)')})` 
                : undefined,
              opacity: category && seg.color === category.hsl ? 1 : 0.4,
            }}
          />
        ))}
        
        {/* Indicator dot */}
        {indicatorPos && (
          <>
            <circle
              cx={indicatorPos.x + padding}
              cy={indicatorPos.y + padding}
              r={indicatorRadius}
              fill="hsl(var(--background))"
              stroke={category?.hsl || 'hsl(var(--primary))'}
              strokeWidth={indicatorStroke}
              style={{
                filter: `drop-shadow(0 0 6px ${category?.hsl || 'hsl(var(--primary))'})`,
              }}
            />
            <circle
              cx={indicatorPos.x + padding}
              cy={indicatorPos.y + padding}
              r={strokeWidth * 0.35}
              fill={category?.hsl || 'hsl(var(--primary))'}
            />
          </>
        )}
      </svg>
      
      {/* Center value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span 
          className="font-bold text-foreground font-display"
          style={{ fontSize: resolvedSize * 0.22 }}
        >
          {validBmi.toFixed(1)}
        </span>
        {showCategory && category && (
          <span 
            className={cn('font-medium', category.color)}
            style={{ fontSize: resolvedSize * 0.1 }}
          >
            {category.label}
          </span>
        )}
      </div>
    </div>
  );
}
