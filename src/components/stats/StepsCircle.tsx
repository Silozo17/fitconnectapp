import * as React from 'react';
import { CircularProgress } from '@/components/shared/CircularProgress';
import { Footprints } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepsCircleProps {
  current: number;
  goal?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | number;
  showIcon?: boolean;
  variant?: 'default' | 'compact' | 'glass';
  className?: string;
}

export function StepsCircle({
  current,
  goal = 10000,
  size = 'md',
  showIcon = true,
  variant = 'default',
  className,
}: StepsCircleProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isGoalMet = current >= goal;
  const color = isGoalMet ? 'success' : 'blue';
  
  const resolvedSize = typeof size === 'number' ? size : { xs: 64, sm: 80, md: 120, lg: 160 }[size];

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toLocaleString();
  };

  const containerClasses = cn(
    'flex flex-col items-center',
    variant === 'glass' && 'glass-card p-4 rounded-2xl',
    className
  );

  return (
    <div className={containerClasses}>
      <CircularProgress
        value={Math.min(current, goal)}
        maxValue={goal}
        size={size}
        strokeWidth="default"
        color={color}
        glowEnabled={true}
      >
        <div className="flex flex-col items-center justify-center">
          {showIcon && (
            <Footprints 
              className={cn(
                'mb-0.5',
                isGoalMet ? 'text-emerald-400' : 'text-blue-400'
              )}
              style={{ width: resolvedSize * 0.15, height: resolvedSize * 0.15 }}
            />
          )}
          <span 
            className="font-bold text-foreground font-display"
            style={{ fontSize: resolvedSize * 0.16, lineHeight: 1.1 }}
          >
            {formatValue(current)}
          </span>
          <span 
            className="text-muted-foreground"
            style={{ fontSize: Math.max(resolvedSize * 0.08, 9) }}
          >
            / {formatValue(goal)}
          </span>
        </div>
      </CircularProgress>
      
      {variant !== 'compact' && (
        <div className="text-center mt-2">
          <p className="text-sm font-medium text-foreground">Steps</p>
          <p className="text-xs text-muted-foreground">
            {isGoalMet ? 'Goal reached!' : `${Math.round(percentage)}% of goal`}
          </p>
        </div>
      )}
    </div>
  );
}
