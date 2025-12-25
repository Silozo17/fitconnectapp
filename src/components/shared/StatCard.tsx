import { memo, ReactNode } from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  description?: string;
  loading?: boolean;
  className?: string;
  iconClassName?: string;
  children?: ReactNode;
}

export const StatCard = memo(({ 
  title, 
  value, 
  icon: Icon,
  trend,
  description,
  loading = false,
  className,
  iconClassName,
  children
}: StatCardProps) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return TrendingUp;
    if (trend.value < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.value > 0) return "text-emerald-600 dark:text-emerald-400";
    if (trend.value < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  const TrendIcon = getTrendIcon();

  if (loading) {
    return (
      <Card variant="glass" className={cn("", className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="w-10 h-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className={cn("transition-shadow hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            
            {(trend || description) && (
              <div className="flex items-center gap-1.5 pt-1">
                {trend && TrendIcon && (
                  <>
                    <TrendIcon className={cn("w-3.5 h-3.5", getTrendColor())} aria-hidden="true" />
                    <span className={cn("text-xs font-medium", getTrendColor())}>
                      {trend.value > 0 ? "+" : ""}{trend.value}%
                    </span>
                  </>
                )}
                {trend?.label && (
                  <span className="text-xs text-muted-foreground">{trend.label}</span>
                )}
                {description && !trend && (
                  <span className="text-xs text-muted-foreground">{description}</span>
                )}
              </div>
            )}
          </div>
          
          {Icon && (
            <div className={cn(
              "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0",
              iconClassName
            )}>
              <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
          )}
        </div>
        
        {children}
      </CardContent>
    </Card>
  );
});

StatCard.displayName = "StatCard";

// Grid wrapper for consistent stat card layouts
interface StatCardGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const StatCardGrid = memo(({ 
  children, 
  columns = 4,
  className 
}: StatCardGridProps) => {
  const gridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridClasses[columns], className)}>
      {children}
    </div>
  );
});

StatCardGrid.displayName = "StatCardGrid";
