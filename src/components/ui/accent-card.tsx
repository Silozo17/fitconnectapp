import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AccentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * AccentCard - Base card component with lime green primary accent
 * Used for all generic dashboard widgets (non-semantic cards)
 * 
 * Features:
 * - Top gradient accent line (lime green)
 * - Gradient background (from-primary/10 to-primary/5)
 * - Border with primary/20
 * - Consistent rounded-2xl styling
 */
const AccentCard = React.forwardRef<HTMLDivElement, AccentCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "glass-card",
          "border border-white/5",
          className
        )}
        {...props}
      >
        {/* Thin top accent line - bright left to dim right */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary via-primary/30 to-transparent" />
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_12px_rgba(163,230,53,0.06)] pointer-events-none" />
        {children}
      </div>
    );
  }
);
AccentCard.displayName = "AccentCard";

interface AccentCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  action?: React.ReactNode;
}

const AccentCardHeader = React.forwardRef<HTMLDivElement, AccentCardHeaderProps>(
  ({ className, icon: Icon, title, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between p-5 pb-3", className)}
        {...props}
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-2 rounded-xl bg-primary/15">
              <Icon className="w-4 h-4 text-primary" />
            </div>
          )}
          <h3 className="font-semibold text-foreground text-base">{title}</h3>
        </div>
        {action}
      </div>
    );
  }
);
AccentCardHeader.displayName = "AccentCardHeader";

const AccentCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
));
AccentCardContent.displayName = "AccentCardContent";

export { AccentCard, AccentCardHeader, AccentCardContent };
