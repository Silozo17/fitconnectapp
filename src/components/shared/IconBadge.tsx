import { memo } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconBadgeColor = 
  | "primary" 
  | "blue" 
  | "green" 
  | "orange" 
  | "red" 
  | "purple" 
  | "cyan" 
  | "yellow"
  | "muted";

export type IconBadgeSize = "sm" | "default" | "lg";

interface IconBadgeProps {
  icon: LucideIcon;
  size?: IconBadgeSize;
  color?: IconBadgeColor;
  className?: string;
}

const sizeStyles: Record<IconBadgeSize, { container: string; icon: string }> = {
  sm: { container: "p-1.5 rounded-lg", icon: "h-3.5 w-3.5" },
  default: { container: "p-2 rounded-xl", icon: "h-4 w-4" },
  lg: { container: "p-3 rounded-2xl", icon: "h-5 w-5" },
};

const colorStyles: Record<IconBadgeColor, { bg: string; text: string }> = {
  primary: { bg: "bg-primary/15", text: "text-primary" },
  blue: { bg: "bg-blue-500/20", text: "text-blue-400" },
  green: { bg: "bg-green-500/20", text: "text-green-400" },
  orange: { bg: "bg-orange-500/20", text: "text-orange-400" },
  red: { bg: "bg-red-500/20", text: "text-red-400" },
  purple: { bg: "bg-purple-500/20", text: "text-purple-400" },
  cyan: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
  yellow: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  muted: { bg: "bg-muted/50", text: "text-muted-foreground" },
};

/**
 * IconBadge - Consistent icon container with background
 * 
 * Use for icons that need a colored background circle/square.
 * Consolidates the 3 variants of icon backgrounds across the codebase.
 * 
 * @example
 * <IconBadge icon={Battery} color="primary" size="lg" />
 * <IconBadge icon={Heart} color="red" />
 * <IconBadge icon={Moon} color="purple" size="sm" />
 */
export const IconBadge = memo(function IconBadge({
  icon: Icon,
  size = "default",
  color = "primary",
  className,
}: IconBadgeProps) {
  const sizeConfig = sizeStyles[size];
  const colorConfig = colorStyles[color];

  return (
    <div className={cn(sizeConfig.container, colorConfig.bg, className)}>
      <Icon className={cn(sizeConfig.icon, colorConfig.text)} />
    </div>
  );
});

IconBadge.displayName = "IconBadge";
