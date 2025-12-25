import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-secondary text-foreground",
        glass: "glass-interactive text-foreground",
        "glass-glow": "glass-interactive text-foreground hover:shadow-glow-sm hover:border-primary/30",
        outline: "border border-border bg-transparent hover:bg-secondary",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-elevation-1",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
      },
      size: {
        sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
        default: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
        lg: "h-12 w-12 [&_svg]:h-6 [&_svg]:w-6",
        xl: "h-14 w-14 rounded-2xl [&_svg]:h-7 [&_svg]:w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
}

/**
 * Specialized button for icon-only actions.
 * Provides consistent sizing and styling for icon buttons.
 */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(iconButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
