import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Premium sizing - 48px touch target, shrink-safe for flex/grid
          "flex h-12 w-full min-w-0 max-w-full rounded-xl border border-input bg-background/50 px-4 py-3",
          // Typography
          "text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // Placeholder
          "placeholder:text-muted-foreground/60",
          // Focus states with glow
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-0 focus-visible:border-primary/50",
          "focus-visible:bg-background transition-all duration-200",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Backdrop effect
          "backdrop-blur-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
