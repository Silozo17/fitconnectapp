import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card title */
  title?: string;
  /** Card description/subtitle */
  description?: string;
  /** Icon component to display in header */
  icon?: LucideIcon;
  /** Icon background color class */
  iconBg?: string;
  /** Show gradient overlay */
  withGradient?: boolean;
  /** Enable hover glow effect */
  withGlow?: boolean;
  /** Card variant */
  variant?: "default" | "elevated" | "interactive" | "subtle";
  /** Header actions slot */
  headerAction?: React.ReactNode;
  /** Remove default padding */
  noPadding?: boolean;
}

/**
 * Premium glass card component with consistent styling.
 * Use for dashboard cards, feature sections, and content containers.
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      title,
      description,
      icon: Icon,
      iconBg = "bg-primary/10",
      withGradient = false,
      withGlow = false,
      variant = "default",
      headerAction,
      noPadding = false,
      children,
      ...props
    },
    ref
  ) => {
    const variantMap = {
      default: "glass" as const,
      elevated: "glass-elevated" as const,
      interactive: "glass-interactive" as const,
      subtle: "glass-subtle" as const,
    };

    const hasHeader = title || description || Icon || headerAction;

    return (
      <Card
        ref={ref}
        variant={variantMap[variant]}
        withGradient={withGradient}
        withGlow={withGlow}
        className={cn(
          noPadding && "[&>div]:p-0",
          className
        )}
        {...props}
      >
        {hasHeader && (
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {Icon && (
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl shrink-0",
                  iconBg
                )}>
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="space-y-1">
                {title && (
                  <CardTitle className="text-lg font-semibold">
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription>
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            {headerAction && (
              <div className="shrink-0">
                {headerAction}
              </div>
            )}
          </CardHeader>
        )}
        <CardContent className={cn(!hasHeader && "pt-6")}>
          {children}
        </CardContent>
      </Card>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
