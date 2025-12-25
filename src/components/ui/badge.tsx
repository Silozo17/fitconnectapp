import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "text-foreground border-border/50 bg-background/50 backdrop-blur-sm",
        // New premium variants
        success: "border-transparent bg-success/15 text-success",
        warning: "border-transparent bg-warning/15 text-warning",
        lime: "border-primary/20 bg-primary/10 text-primary",
        purple: "border-accent/20 bg-accent/10 text-accent",
        glass: "border-border/30 bg-card/50 text-foreground backdrop-blur-xl",
        soft: "border-transparent bg-muted text-muted-foreground",
        // Pill style for tags/filters
        pill: "border-border/40 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer",
        "pill-active": "border-primary/30 bg-primary/15 text-primary",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
