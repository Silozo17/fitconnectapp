import { memo } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, AlertCircle, MinusCircle, LucideIcon } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

type StatusType = 
  | "success" 
  | "error" 
  | "warning" 
  | "pending" 
  | "inactive" 
  | "info";

interface StatusConfig {
  icon: LucideIcon;
  labelKey: string;
  dotClass: string;
  textClass: string;
  bgClass: string;
}

const statusConfig: Record<StatusType, StatusConfig> = {
  success: {
    icon: CheckCircle,
    labelKey: "status.success",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10",
  },
  error: {
    icon: XCircle,
    labelKey: "status.error",
    dotClass: "bg-destructive",
    textClass: "text-destructive",
    bgClass: "bg-destructive/10",
  },
  warning: {
    icon: AlertCircle,
    labelKey: "status.warning",
    dotClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/10",
  },
  pending: {
    icon: Clock,
    labelKey: "status.pending",
    dotClass: "bg-blue-500",
    textClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-500/10",
  },
  inactive: {
    icon: MinusCircle,
    labelKey: "status.inactive",
    dotClass: "bg-muted-foreground",
    textClass: "text-muted-foreground",
    bgClass: "bg-muted",
  },
  info: {
    icon: AlertCircle,
    labelKey: "status.info",
    dotClass: "bg-primary",
    textClass: "text-primary",
    bgClass: "bg-primary/10",
  },
};

const sizeClasses = {
  sm: {
    dot: "w-1.5 h-1.5",
    icon: "w-3 h-3",
    text: "text-xs",
    padding: "px-1.5 py-0.5",
  },
  default: {
    dot: "w-2 h-2",
    icon: "w-4 h-4",
    text: "text-sm",
    padding: "px-2 py-1",
  },
  lg: {
    dot: "w-2.5 h-2.5",
    icon: "w-5 h-5",
    text: "text-base",
    padding: "px-3 py-1.5",
  },
};

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  showDot?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export const StatusIndicator = memo(({ 
  status, 
  label,
  showIcon = false,
  showDot = true,
  size = "default",
  className
}: StatusIndicatorProps) => {
  const { t } = useTranslation();
  const config = statusConfig[status];
  const sizes = sizeClasses[size];
  const Icon = config.icon;
  const displayLabel = label || t(config.labelKey);

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        sizes.padding,
        sizes.text,
        config.bgClass,
        config.textClass,
        className
      )}
      role="status"
      aria-label={displayLabel}
    >
      {showDot && !showIcon && (
        <span 
          className={cn("rounded-full shrink-0", sizes.dot, config.dotClass)} 
          aria-hidden="true" 
        />
      )}
      {showIcon && (
        <Icon className={cn("shrink-0", sizes.icon)} aria-hidden="true" />
      )}
      {displayLabel}
    </span>
  );
});

StatusIndicator.displayName = "StatusIndicator";

// Badge variant for simpler use cases
interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export const StatusBadge = memo(({ status, className }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const config = statusConfig[status];
  
  return (
    <span 
      className={cn(
        "w-2 h-2 rounded-full shrink-0",
        config.dotClass,
        className
      )}
      role="status"
      aria-label={t(config.labelKey)}
    />
  );
});

StatusBadge.displayName = "StatusBadge";
