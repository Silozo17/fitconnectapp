import { memo, ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export const SectionHeader = memo(({ 
  title, 
  description, 
  icon: Icon,
  action,
  className,
  size = "default"
}: SectionHeaderProps) => {
  const sizeClasses = {
    sm: {
      title: "text-base font-semibold",
      description: "text-xs",
      icon: "w-4 h-4",
      gap: "gap-2",
    },
    default: {
      title: "text-lg font-semibold",
      description: "text-sm",
      icon: "w-5 h-5",
      gap: "gap-3",
    },
    lg: {
      title: "text-xl font-bold",
      description: "text-sm",
      icon: "w-6 h-6",
      gap: "gap-4",
    },
  };

  const styles = sizeClasses[size];

  return (
    <div className={cn("flex items-start justify-between", className)}>
      <div className={cn("flex items-start", styles.gap)}>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className={cn(styles.icon, "text-primary")} aria-hidden="true" />
          </div>
        )}
        <div className="space-y-0.5">
          <h2 className={cn(styles.title, "text-foreground")}>{title}</h2>
          {description && (
            <p className={cn(styles.description, "text-muted-foreground")}>
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
});

SectionHeader.displayName = "SectionHeader";
