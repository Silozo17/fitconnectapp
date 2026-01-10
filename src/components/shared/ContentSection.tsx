import { memo, ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ContentSectionColor = 
  | "primary" 
  | "blue" 
  | "green" 
  | "orange" 
  | "red" 
  | "purple" 
  | "cyan" 
  | "yellow"
  | "muted";

interface ContentSectionProps {
  children: ReactNode;
  className?: string;
  /** Color theme for the section */
  colorTheme?: ContentSectionColor;
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

const colorStyles: Record<ContentSectionColor, {
  bg: string;
  border: string;
  accent: string;
}> = {
  primary: {
    bg: "from-primary/5 via-background to-accent/5",
    border: "border-border/50",
    accent: "from-primary/60 via-accent/40",
  },
  blue: {
    bg: "from-blue-500/10 via-background to-blue-600/5",
    border: "border-blue-500/20",
    accent: "from-blue-400/60 via-blue-500/40",
  },
  green: {
    bg: "from-green-500/10 via-background to-green-600/5",
    border: "border-green-500/20",
    accent: "from-green-400/60 via-green-500/40",
  },
  orange: {
    bg: "from-orange-500/10 via-background to-orange-600/5",
    border: "border-orange-500/20",
    accent: "from-orange-400/60 via-orange-500/40",
  },
  red: {
    bg: "from-red-500/10 via-background to-pink-600/5",
    border: "border-red-500/20",
    accent: "from-red-400/60 via-pink-400/40",
  },
  purple: {
    bg: "from-purple-500/10 via-background to-indigo-600/5",
    border: "border-purple-500/20",
    accent: "from-purple-400/60 via-indigo-400/40",
  },
  cyan: {
    bg: "from-cyan-500/10 via-background to-cyan-600/5",
    border: "border-cyan-500/20",
    accent: "from-cyan-400/60 via-cyan-500/40",
  },
  yellow: {
    bg: "from-yellow-500/10 via-background to-amber-600/5",
    border: "border-yellow-500/20",
    accent: "from-yellow-400/60 via-amber-400/40",
  },
  muted: {
    bg: "from-muted/30 via-background to-muted/20",
    border: "border-border/50",
    accent: "from-muted-foreground/30 via-muted-foreground/20",
  },
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
 * - Multiple color themes
 */
export const ContentSection = memo(({
  children,
  className,
  colorTheme = "primary",
  withAccent = true,
  padding = "default",
}: ContentSectionProps) => {
  const styles = colorStyles[colorTheme];

  return (
    <div
      className={cn(
        "relative bg-gradient-to-br rounded-2xl border overflow-hidden max-w-full",
        styles.bg,
        styles.border,
        paddingStyles[padding],
        className
      )}
    >
      {/* Top accent line */}
      {withAccent && (
        <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r to-transparent", styles.accent)} />
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
    <div className={cn("flex items-start justify-between gap-2 flex-wrap mb-3", className)}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {Icon && (
          <div className="p-2 rounded-xl bg-primary/15 shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
        <h3 className="font-semibold text-foreground text-base truncate">{title}</h3>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge}
        {action}
      </div>
    </div>
  );
});

ContentSectionHeader.displayName = "ContentSectionHeader";
