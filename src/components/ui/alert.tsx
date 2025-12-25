import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-2xl border p-4 [&>svg~*]:pl-8 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-card/50 text-foreground border-border/50 backdrop-blur-sm [&>svg]:text-foreground",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive backdrop-blur-sm [&>svg]:text-destructive",
        // New premium variants
        success: "border-success/30 bg-success/10 text-success backdrop-blur-sm [&>svg]:text-success",
        warning: "border-warning/30 bg-warning/10 text-warning backdrop-blur-sm [&>svg]:text-warning",
        info: "border-primary/30 bg-primary/10 text-primary backdrop-blur-sm [&>svg]:text-primary",
        glass: "border-border/30 bg-card/30 text-foreground backdrop-blur-xl shadow-elevation-1 [&>svg]:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed opacity-90", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
