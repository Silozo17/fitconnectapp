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

// Segment definitions for the full circle
const segments = [
  { startAngle: -90, endAngle: 0, color: 'hsl(217, 91%, 60%)', range: [0, 18.5] },      // blue - underweight
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

function getIndicatorAngle(bmi: number): number {
  const minBMI = 10;
  const maxBMI = 50;
  const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmi));
  // Map BMI to angle: 10 -> -90deg, 50 -> 270deg
  return ((clampedBMI - minBMI) / (maxBMI - minBMI)) * 360 - 90;
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
  const radius = (resolvedSize - strokeWidth) / 2;
  const cx = resolvedSize / 2;
  const cy = resolvedSize / 2;

  // Use validBmi for ALL calculations to ensure consistency
  const category = validBmi ? getBMICategory(validBmi) : null;
  const indicatorAngle = validBmi ? getIndicatorAngle(validBmi) : -90;
  const indicatorPos = validBmi ? polarToCartesian(cx, cy, radius, indicatorAngle) : null;

  if (!validBmi) {
    return (
      <div 
        className={cn('relative flex items-center justify-center', className)}
        style={{ width: resolvedSize, height: resolvedSize }}
      >
        <svg width={resolvedSize} height={resolvedSize} className="opacity-30">
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
      style={{ width: resolvedSize, height: resolvedSize }}
    >
      <svg width={resolvedSize} height={resolvedSize}>
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
              cx={indicatorPos.x}
              cy={indicatorPos.y}
              r={strokeWidth * 0.8}
              fill="hsl(var(--background))"
              stroke={category?.hsl || 'hsl(var(--primary))'}
              strokeWidth={3}
              style={{
                filter: `drop-shadow(0 0 6px ${category?.hsl || 'hsl(var(--primary))'})`,
              }}
            />
            <circle
              cx={indicatorPos.x}
              cy={indicatorPos.y}
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
