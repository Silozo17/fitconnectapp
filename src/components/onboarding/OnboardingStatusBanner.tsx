import React from "react";
import { cn } from "@/lib/utils";

interface OnboardingStatusBannerProps {
  show: boolean;
  variant?: "success" | "info" | "warning";
  icon?: React.ReactNode;
  message: React.ReactNode;
  /** Fixed height in pixels - reserves space even when hidden */
  height?: number;
  className?: string;
}

/**
 * A fixed-height inline status banner that reserves space to prevent layout shifts.
 * Content fades in/out within the reserved space using opacity transitions.
 */
export function OnboardingStatusBanner({
  show,
  variant = "success",
  icon,
  message,
  height = 48,
  className,
}: OnboardingStatusBannerProps) {
  const variantStyles = {
    success: "bg-primary/10 border-primary/20 text-primary",
    info: "bg-secondary border-border text-foreground",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
  };

  return (
    <div
      className={cn("overflow-hidden transition-opacity duration-200", className)}
      style={{ height: `${height}px`, opacity: show ? 1 : 0 }}
      aria-hidden={!show}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border h-full",
          variantStyles[variant]
        )}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
