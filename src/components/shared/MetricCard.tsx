import { memo, ReactNode } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type MetricCardColor = 
  | "primary" 
  | "blue" 
  | "green" 
  | "orange" 
  | "red" 
  | "purple" 
  | "cyan" 
  | "pink" 
  | "amber" 
  | "emerald"
  | "yellow";

interface TrendInfo {
  value: number;
  direction: "up" | "down";
  suffix?: string;
}

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  /** Color theme - use colorTheme or color (alias) */
  color?: MetricCardColor;
  colorTheme?: MetricCardColor;
  /** Trend indicator - can be number (percentage) or TrendInfo object */
  trend?: number | TrendInfo;
  trendLabel?: string;
  showTrend?: boolean;
  subtext?: string;
  /** Description below the label */
  description?: string;
  action?: ReactNode;
  className?: string;
  size?: "sm" | "default" | "lg";
}

const colorStyles: Record<MetricCardColor, {
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
  accent: string;
}> = {
  primary: {
    bg: "from-primary/10 to-primary/5",
    border: "border-primary/20",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    accent: "from-primary/60",
  },
  blue: {
    bg: "from-blue-500/10 to-blue-600/5",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    accent: "from-blue-400/60",
  },
  green: {
    bg: "from-green-500/10 to-green-600/5",
    border: "border-green-500/20",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
    accent: "from-green-400/60",
  },
  orange: {
    bg: "from-orange-500/10 to-orange-600/5",
    border: "border-orange-500/20",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
    accent: "from-orange-400/60",
  },
  red: {
    bg: "from-red-500/10 to-pink-600/5",
    border: "border-red-500/20",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    accent: "from-red-400/60",
  },
  purple: {
    bg: "from-purple-500/10 to-indigo-600/5",
    border: "border-purple-500/20",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    accent: "from-purple-400/60",
  },
  cyan: {
    bg: "from-cyan-500/10 to-cyan-600/5",
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    accent: "from-cyan-400/60",
  },
  pink: {
    bg: "from-pink-500/10 to-pink-600/5",
    border: "border-pink-500/20",
    iconBg: "bg-pink-500/20",
    iconColor: "text-pink-400",
    accent: "from-pink-400/60",
  },
  amber: {
    bg: "from-amber-500/10 to-amber-600/5",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    accent: "from-amber-400/60",
  },
  emerald: {
    bg: "from-emerald-500/10 to-emerald-600/5",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    accent: "from-emerald-400/60",
  },
  yellow: {
    bg: "from-yellow-500/10 to-amber-600/5",
    border: "border-yellow-500/20",
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-400",
    accent: "from-yellow-400/60",
  },
};

const sizeStyles = {
  sm: {
    padding: "p-3",
    iconPadding: "p-1.5",
    iconSize: "w-4 h-4",
    valueSize: "text-xl",
    labelSize: "text-xs",
  },
  default: {
    padding: "p-4",
    iconPadding: "p-2",
    iconSize: "w-5 h-5",
    valueSize: "text-2xl",
    labelSize: "text-xs",
  },
  lg: {
    padding: "p-5",
    iconPadding: "p-2.5",
    iconSize: "w-6 h-6",
    valueSize: "text-3xl",
    labelSize: "text-sm",
  },
};

/**
 * MetricCard - Reusable stat card with gradient background and accent line
 * 
 * Features:
 * - Top accent line gradient
 * - Gradient background (from-color/10 to-color/5)
 * - Colored icon in rounded container
 * - Optional trend indicator
 * - Consistent rounded-2xl styling
 */
export const MetricCard = memo(({
  icon: Icon,
  label,
  value,
  unit,
  color,
  colorTheme,
  trend,
  trendLabel,
  showTrend = true,
  subtext,
  description,
  action,
  className,
  size = "default",
}: MetricCardProps) => {
  // Support both color and colorTheme props
  const resolvedColor = colorTheme || color || "primary";
  const styles = colorStyles[resolvedColor];
  const sizes = sizeStyles[size];
  
  // Normalize trend to handle both number and TrendInfo
  let trendValue: number | undefined;
  let trendDirection: "up" | "down" | undefined;
  let trendSuffix: string | undefined;
  
  if (typeof trend === "number") {
    trendValue = trend;
    trendDirection = trend > 0 ? "up" : "down";
    trendSuffix = "%";
  } else if (trend && typeof trend === "object") {
    trendValue = trend.value;
    trendDirection = trend.direction;
    trendSuffix = trend.suffix || "%";
  }
  
  const shouldShowTrend = showTrend && trendValue !== undefined && trendValue !== 0;
  const trendPositive = trendDirection === "up";

  return (
    <div
      className={cn(
        "relative bg-gradient-to-br rounded-2xl border overflow-hidden",
        styles.bg,
        styles.border,
        sizes.padding,
        className
      )}
    >
      {/* Top accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r to-transparent", styles.accent)} />

      {/* Header: Icon + Trend */}
      <div className="flex items-center justify-between mb-2">
        <div className={cn("rounded-xl", sizes.iconPadding, styles.iconBg)}>
          <Icon className={cn(sizes.iconSize, styles.iconColor)} />
        </div>
        {shouldShowTrend && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            trendPositive ? "text-green-500" : "text-red-500"
          )}>
            {trendPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trendValue > 0 ? "+" : ""}{trendValue}{trendSuffix}
            {trendLabel && <span className="ml-1 text-muted-foreground">{trendLabel}</span>}
          </div>
        )}
        {action && !shouldShowTrend && action}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        <span className={cn("font-bold text-foreground tracking-tight", sizes.valueSize)}>
          {value}
        </span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>

      {/* Label */}
      <div className={cn("text-muted-foreground mt-1", sizes.labelSize)}>{label}</div>

      {/* Optional description */}
      {description && (
        <div className="text-xs text-muted-foreground/70 mt-1">{description}</div>
      )}

      {/* Optional subtext (legacy, same as description) */}
      {subtext && !description && (
        <div className="text-xs text-muted-foreground/70 mt-1">{subtext}</div>
      )}
    </div>
  );
});

MetricCard.displayName = "MetricCard";
