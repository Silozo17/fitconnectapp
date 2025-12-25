import * as React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  maxValue?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  strokeWidth?: 'thin' | 'default' | 'thick' | number;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'blue' | 'purple' | 'orange' | string;
  trackColor?: string;
  animated?: boolean;
  animationDuration?: number;
  showValue?: boolean;
  formatValue?: (value: number, max: number) => string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  glowEnabled?: boolean;
  children?: React.ReactNode;
}

const sizeMap = {
  xs: 64,
  sm: 80,
  md: 120,
  lg: 160,
  xl: 200,
};

const strokeWidthMap = {
  thin: 6,
  default: 10,
  thick: 16,
};

const colorMap: Record<string, string> = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(142, 71%, 45%)',
  warning: 'hsl(48, 96%, 53%)',
  danger: 'hsl(0, 84%, 60%)',
  blue: 'hsl(217, 91%, 60%)',
  purple: 'hsl(280, 85%, 60%)',
  orange: 'hsl(25, 95%, 53%)',
};

const glowColorMap: Record<string, string> = {
  primary: 'hsl(var(--primary) / 0.4)',
  success: 'hsla(142, 71%, 45%, 0.4)',
  warning: 'hsla(48, 96%, 53%, 0.4)',
  danger: 'hsla(0, 84%, 60%, 0.4)',
  blue: 'hsla(217, 91%, 60%, 0.4)',
  purple: 'hsla(280, 85%, 60%, 0.4)',
  orange: 'hsla(25, 95%, 53%, 0.4)',
};

export function CircularProgress({
  value,
  maxValue = 100,
  size = 'md',
  strokeWidth = 'default',
  color = 'primary',
  trackColor = 'hsl(var(--muted) / 0.3)',
  animated = true,
  animationDuration = 800,
  showValue = true,
  formatValue,
  label,
  icon,
  className,
  glowEnabled = true,
  children,
}: CircularProgressProps) {
  const [animatedValue, setAnimatedValue] = React.useState(0);

  const resolvedSize = typeof size === 'number' ? size : sizeMap[size];
  const resolvedStrokeWidth = typeof strokeWidth === 'number' ? strokeWidth : strokeWidthMap[strokeWidth];
  const resolvedColor = colorMap[color] || color;
  const resolvedGlowColor = glowColorMap[color] || `${color.replace(')', ' / 0.4)')}`;

  const radius = (resolvedSize - resolvedStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((animatedValue / maxValue) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  React.useEffect(() => {
    if (animated) {
      const startTime = performance.now();
      const startValue = animatedValue;
      const endValue = value;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (endValue - startValue) * easeOut;
        
        setAnimatedValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setAnimatedValue(value);
    }
  }, [value, animated, animationDuration]);

  const displayValue = formatValue 
    ? formatValue(animatedValue, maxValue)
    : Math.round(animatedValue).toString();

  return (
    <div 
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: resolvedSize, height: resolvedSize }}
    >
      <svg
        width={resolvedSize}
        height={resolvedSize}
        viewBox={`0 0 ${resolvedSize} ${resolvedSize}`}
        className="transform -rotate-90"
      >
        {/* Track */}
        <circle
          cx={resolvedSize / 2}
          cy={resolvedSize / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap="round"
        />
        
        {/* Progress */}
        <circle
          cx={resolvedSize / 2}
          cy={resolvedSize / 2}
          r={radius}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: animated ? 'none' : 'stroke-dashoffset 0.5s ease-out',
            filter: glowEnabled ? `drop-shadow(0 0 6px ${resolvedGlowColor})` : undefined,
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ? children : (
          <>
            {icon && <div className="mb-0.5">{icon}</div>}
            {showValue && (
              <span 
                className="font-bold text-foreground font-display"
                style={{ 
                  fontSize: resolvedSize * 0.22,
                  lineHeight: 1.1,
                }}
              >
                {displayValue}
              </span>
            )}
            {label && (
              <span 
                className="text-muted-foreground"
                style={{ fontSize: Math.max(resolvedSize * 0.09, 10) }}
              >
                {label}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
