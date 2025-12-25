import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconSquareProps {
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg";
  /** Color variant - uses semantic colors */
  color?: "primary" | "purple" | "blue" | "green" | "orange" | "pink" | "cyan" | "muted";
}

export function IconSquare({
  icon: Icon,
  className,
  iconClassName,
  size = "md",
  color = "primary",
}: IconSquareProps) {
  const sizeClasses = {
    sm: "icon-square-sm",
    md: "icon-square",
    lg: "icon-square-lg",
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-7 w-7",
  };

  const colorClasses = {
    primary: "bg-primary/15 text-primary",
    purple: "bg-accent/15 text-accent",
    blue: "bg-blue-500/15 text-blue-400",
    green: "bg-emerald-500/15 text-emerald-400",
    orange: "bg-orange-500/15 text-orange-400",
    pink: "bg-pink-500/15 text-pink-400",
    cyan: "bg-cyan-500/15 text-cyan-400",
    muted: "bg-muted text-muted-foreground",
  };

  return (
    <div className={cn(sizeClasses[size], colorClasses[color], className)}>
      <Icon className={cn(iconSizes[size], iconClassName)} strokeWidth={1.5} />
    </div>
  );
}

interface IconGridProps {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}

export function IconGrid({ children, className, columns = 4 }: IconGridProps) {
  const columnClasses = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", columnClasses[columns], className)}>
      {children}
    </div>
  );
}
