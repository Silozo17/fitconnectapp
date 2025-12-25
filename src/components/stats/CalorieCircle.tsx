import * as React from 'react';
import { CircularProgress } from '@/components/shared/CircularProgress';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalorieCircleProps {
  current: number;
  target: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | number;
  showIcon?: boolean;
  variant?: 'default' | 'compact' | 'glass';
  className?: string;
}

export function CalorieCircle({
  current,
  target,
  size = 'md',
  showIcon = true,
  variant = 'default',
  className,
}: CalorieCircleProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isOverTarget = current > target;
  const color = isOverTarget ? 'danger' : 'orange';
  
  const resolvedSize = typeof size === 'number' ? size : { xs: 64, sm: 80, md: 120, lg: 160 }[size];

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return Math.round(value).toString();
  };

  const containerClasses = cn(
    'flex flex-col items-center',
    variant === 'glass' && 'glass-card p-4 rounded-2xl',
    className
  );

  return (
    <div className={containerClasses}>
      <CircularProgress
        value={Math.min(current, target)}
        maxValue={target}
        size={size}
        strokeWidth="default"
        color={color}
        glowEnabled={true}
        formatValue={() => formatValue(current)}
        label={`/ ${formatValue(target)}`}
      >
        <div className="flex flex-col items-center justify-center">
          {showIcon && (
            <Flame 
              className={cn(
                'mb-0.5',
                isOverTarget ? 'text-red-400' : 'text-orange-400'
              )}
              style={{ width: resolvedSize * 0.15, height: resolvedSize * 0.15 }}
            />
          )}
          <span 
            className="font-bold text-foreground font-display"
            style={{ fontSize: resolvedSize * 0.18, lineHeight: 1.1 }}
          >
            {formatValue(current)}
          </span>
          <span 
            className="text-muted-foreground"
            style={{ fontSize: Math.max(resolvedSize * 0.09, 10) }}
          >
            / {formatValue(target)}
          </span>
        </div>
      </CircularProgress>
      
      {variant !== 'compact' && (
        <div className="text-center mt-2">
          <p className="text-sm font-medium text-foreground">Calories</p>
          <p className="text-xs text-muted-foreground">
            {Math.round(percentage)}% of daily goal
          </p>
        </div>
      )}
    </div>
  );
}
