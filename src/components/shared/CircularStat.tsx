import * as React from 'react';
import { cn } from '@/lib/utils';
import { CircularProgress } from './CircularProgress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CircularStatProps {
  value: number;
  maxValue?: number;
  title?: string;
  subtitle?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  strokeWidth?: 'thin' | 'default' | 'thick' | number;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'blue' | 'purple' | 'orange' | string;
  variant?: 'default' | 'compact' | 'featured' | 'glass';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  formatValue?: (value: number, max: number) => string;
  label?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  glowEnabled?: boolean;
}

export function CircularStat({
  value,
  maxValue = 100,
  title,
  subtitle,
  size = 'md',
  strokeWidth = 'default',
  color = 'primary',
  variant = 'default',
  trend,
  formatValue,
  label,
  icon,
  loading = false,
  className,
  glowEnabled = true,
}: CircularStatProps) {
  const TrendIcon = trend?.direction === 'up' 
    ? TrendingUp 
    : trend?.direction === 'down' 
      ? TrendingDown 
      : Minus;

  const trendColor = trend?.direction === 'up' 
    ? 'text-emerald-400' 
    : trend?.direction === 'down' 
      ? 'text-red-400' 
      : 'text-muted-foreground';

  if (loading) {
    const resolvedSize = typeof size === 'number' ? size : { xs: 64, sm: 80, md: 120, lg: 160, xl: 200 }[size];
    return (
      <div className={cn(
        'flex flex-col items-center gap-2',
        variant === 'glass' && 'glass-card p-4',
        variant === 'featured' && 'glass-card-elevated p-5',
        className
      )}>
        <div 
          className="rounded-full bg-muted/30 animate-pulse"
          style={{ width: resolvedSize, height: resolvedSize }}
        />
        {title && <div className="h-4 w-16 bg-muted/30 rounded animate-pulse" />}
      </div>
    );
  }

  const containerClasses = cn(
    'flex flex-col items-center gap-2 transition-all duration-300',
    variant === 'glass' && 'glass-card p-4 rounded-2xl',
    variant === 'featured' && 'glass-card-elevated p-5 rounded-2xl',
    variant === 'compact' && 'gap-1',
    className
  );

  return (
    <div className={containerClasses}>
      <CircularProgress
        value={value}
        maxValue={maxValue}
        size={size}
        strokeWidth={strokeWidth}
        color={color}
        formatValue={formatValue}
        label={label}
        icon={icon}
        glowEnabled={glowEnabled}
      />
      
      {(title || subtitle || trend) && (
        <div className="text-center space-y-0.5">
          {title && (
            <h4 className={cn(
              'font-medium text-foreground font-display',
              variant === 'compact' ? 'text-xs' : 'text-sm'
            )}>
              {title}
            </h4>
          )}
          {subtitle && (
            <p className={cn(
              'text-muted-foreground',
              variant === 'compact' ? 'text-[10px]' : 'text-xs'
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn('flex items-center justify-center gap-1', trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span className="text-xs font-medium">
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
