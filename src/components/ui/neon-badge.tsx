import * as React from "react";
import { cn } from "@/lib/utils";

interface NeonBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "lime" | "purple" | "default";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

const NeonBadge = React.forwardRef<HTMLDivElement, NeonBadgeProps>(
  ({ className, variant = "lime", size = "md", pulse = false, children, ...props }, ref) => {
    const variants = {
      lime: "bg-primary/10 text-primary border-primary/30",
      purple: "bg-accent/10 text-accent border-accent/30",
      default: "bg-secondary text-secondary-foreground border-border",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-3 py-1 text-sm",
      lg: "px-4 py-1.5 text-base",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full border font-medium transition-all",
          variants[variant],
          sizes[size],
          pulse && variant === "lime" && "animate-pulse-glow",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NeonBadge.displayName = "NeonBadge";

export { NeonBadge };
