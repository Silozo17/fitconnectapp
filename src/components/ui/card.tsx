import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-2xl text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card border border-border shadow-elevation-1",
        elevated: "bg-card border border-border/50 shadow-elevation-3 hover:shadow-elevation-4 hover:-translate-y-1",
        floating: "bg-card border border-border/30 shadow-float-md hover:shadow-float-lg hover:-translate-y-1",
        glass: "glass-card",
        "glass-elevated": "glass-card-elevated",
        "glass-interactive": "glass-interactive cursor-pointer",
        "glass-subtle": "glass-subtle",
        "glass-premium": "glass-premium",
        ghost: "bg-transparent border-none shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Adds a subtle gradient overlay */
  withGradient?: boolean;
  /** Adds primary glow effect on hover */
  withGlow?: boolean;
  /** Adds inner highlight border for premium feel */
  withInnerHighlight?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, withGradient, withGlow, withInnerHighlight, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, className }),
        withGradient && "relative overflow-hidden",
        withGlow && "hover:shadow-interactive-hover",
        withInnerHighlight && "relative"
      )}
      {...props}
    >
      {withGradient && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" 
          aria-hidden="true"
        />
      )}
      {withInnerHighlight && (
        <div 
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{
            boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.08), inset 0 -1px 0 hsl(0 0% 0% / 0.1)"
          }}
          aria-hidden="true"
        />
      )}
      {props.children}
    </div>
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight font-display",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
