import * as React from 'react';
import { CircularProgress } from '@/components/shared/CircularProgress';
import { cn } from '@/lib/utils';
import { Check, Trophy } from 'lucide-react';

interface ProgressCircleProps {
  value: number;
  maxValue?: number;
  title?: string;
  subtitle?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | number;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'blue' | 'purple' | 'orange' | string;
  showPercentage?: boolean;
  showCompletedIcon?: boolean;
  variant?: 'default' | 'compact' | 'glass';
  className?: string;
  children?: React.ReactNode;
}

export function ProgressCircle({
  value,
  maxValue = 100,
  title,
  subtitle,
  size = 'md',
  color = 'primary',
  showPercentage = true,
  showCompletedIcon = true,
  variant = 'default',
  className,
  children,
}: ProgressCircleProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const isComplete = percentage >= 100;
  
  const resolvedSize = typeof size === 'number' ? size : { xs: 64, sm: 80, md: 120, lg: 160 }[size];

  const containerClasses = cn(
    'flex flex-col items-center',
    variant === 'glass' && 'glass-card p-4 rounded-2xl',
    className
  );

  const displayColor = isComplete ? 'success' : color;

  return (
    <div className={containerClasses}>
      <CircularProgress
        value={value}
        maxValue={maxValue}
        size={size}
        strokeWidth="default"
        color={displayColor}
        glowEnabled={true}
      >
        {children ? children : (
          <div className="flex flex-col items-center justify-center">
            {isComplete && showCompletedIcon ? (
              <div 
                className="flex items-center justify-center rounded-full bg-emerald-500/20"
                style={{ 
                  width: resolvedSize * 0.35, 
                  height: resolvedSize * 0.35 
                }}
              >
                {percentage >= 100 ? (
                  <Trophy 
                    className="text-emerald-400" 
                    style={{ 
                      width: resolvedSize * 0.2, 
                      height: resolvedSize * 0.2 
                    }}
                  />
                ) : (
                  <Check 
                    className="text-emerald-400" 
                    style={{ 
                      width: resolvedSize * 0.2, 
                      height: resolvedSize * 0.2 
                    }}
                  />
                )}
              </div>
            ) : showPercentage ? (
              <>
                <span 
                  className="font-bold text-foreground font-display"
                  style={{ fontSize: resolvedSize * 0.22, lineHeight: 1.1 }}
                >
                  {Math.round(percentage)}
                </span>
                <span 
                  className="text-muted-foreground font-medium"
                  style={{ fontSize: resolvedSize * 0.12 }}
                >
                  %
                </span>
              </>
            ) : (
              <span 
                className="font-bold text-foreground font-display"
                style={{ fontSize: resolvedSize * 0.18, lineHeight: 1.1 }}
              >
                {value}/{maxValue}
              </span>
            )}
          </div>
        )}
      </CircularProgress>
      
      {(title || subtitle) && variant !== 'compact' && (
        <div className="text-center mt-2 space-y-0.5">
          {title && (
            <p className="text-sm font-medium text-foreground">{title}</p>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}
