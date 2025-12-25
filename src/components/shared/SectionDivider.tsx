import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionDividerProps {
  className?: string;
  /** Style variant */
  variant?: "default" | "glow" | "subtle" | "gradient";
  /** Optional label in the center */
  label?: string;
  /** Spacing around the divider */
  spacing?: "sm" | "md" | "lg";
}

/**
 * Section divider for visual separation between content blocks.
 * Supports multiple styles including gradient glow effects.
 */
export function SectionDivider({
  className,
  variant = "default",
  label,
  spacing = "md",
}: SectionDividerProps) {
  const spacingMap = {
    sm: "my-4",
    md: "my-6",
    lg: "my-8",
  };

  const variantClasses = {
    default: "section-divider",
    glow: "section-divider-glow",
    subtle: "section-divider-subtle",
    gradient: "h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent",
  };

  if (label) {
    return (
      <div className={cn("flex items-center gap-4", spacingMap[spacing], className)}>
        <div className={cn("flex-1", variantClasses[variant])} />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">
          {label}
        </span>
        <div className={cn("flex-1", variantClasses[variant])} />
      </div>
    );
  }

  return (
    <div 
      className={cn(variantClasses[variant], spacingMap[spacing], className)} 
      role="separator" 
    />
  );
}

export default SectionDivider;
