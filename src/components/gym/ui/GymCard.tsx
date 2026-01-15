import * as React from "react";
import { cn } from "@/lib/utils";

interface GymCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated";
}

const GymCard = React.forwardRef<HTMLDivElement, GymCardProps>(
  ({ className, children, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          variant === "elevated" ? "gym-card-elevated" : "gym-card",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GymCard.displayName = "GymCard";

interface GymCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const GymCardHeader = React.forwardRef<HTMLDivElement, GymCardHeaderProps>(
  ({ className, icon, title, subtitle, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("gym-card-header", className)}
        {...props}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-[hsl(var(--gym-primary)/0.1)]">
              {icon}
            </div>
          )}
          <div>
            <h3 className="gym-card-title">{title}</h3>
            {subtitle && <p className="gym-card-subtitle">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);
GymCardHeader.displayName = "GymCardHeader";

const GymCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("gym-card-content", className)} {...props} />
));
GymCardContent.displayName = "GymCardContent";

const GymCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("gym-card-footer", className)} {...props} />
));
GymCardFooter.displayName = "GymCardFooter";

export { GymCard, GymCardHeader, GymCardContent, GymCardFooter };
