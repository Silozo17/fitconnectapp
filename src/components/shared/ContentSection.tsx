import { memo, ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentSectionProps {
  children: ReactNode;
  className?: string;
  /** Add top accent line (default true) */
  withAccent?: boolean;
  /** Card padding preset */
  padding?: "none" | "sm" | "default" | "lg";
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  default: "p-4 md:p-5",
  lg: "p-5 md:p-6",
};

/**
 * ContentSection - Wrapper with gradient background and accent line
 * 
 * Use for dashboard sections that aren't MetricCards but need the same styling
 * 
 * Features:
 * - Top accent line (primary gradient)
 * - Gradient background
 * - rounded-2xl border
 * - Flexible padding options
 */
export const ContentSection = memo(({
  children,
  className,
  withAccent = true,
  padding = "default",
}: ContentSectionProps) => {
  return (
    <div
      className={cn(
        "relative bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl border border-border/50 overflow-hidden",
        paddingStyles[padding],
        className
      )}
    >
      {/* Top accent line */}
      {withAccent && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-accent/40 to-transparent" />
      )}
      {children}
    </div>
  );
});

ContentSection.displayName = "ContentSection";

interface ContentSectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  badge?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * ContentSectionHeader - Header row for ContentSection
 */
export const ContentSectionHeader = memo(({
  icon: Icon,
  title,
  badge,
  action,
  className,
}: ContentSectionHeaderProps) => {
  return (
    <div className={cn("flex items-start justify-between mb-3", className)}>
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="p-2 rounded-xl bg-primary/15">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
        <h3 className="font-semibold text-foreground text-base">{title}</h3>
        {badge}
      </div>
      {action}
    </div>
  );
});

ContentSectionHeader.displayName = "ContentSectionHeader";
