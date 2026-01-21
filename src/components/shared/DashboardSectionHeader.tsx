import { memo, useMemo, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardSectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * DashboardSectionHeader - Universal section header for all dashboards
 * 
 * Features:
 * - Gradient on last word of title
 * - Consistent typography (font-display, text-xl/2xl, font-bold)
 * - Muted description below
 * - Optional action slot on right
 * - Standard mb-4 spacing built in
 */
export const DashboardSectionHeader = memo(({ 
  title, 
  description,
  action,
  className 
}: DashboardSectionHeaderProps) => {
  // Split title to apply gradient to the last word
  const { prefix, lastWord } = useMemo(() => {
    const words = title.trim().split(" ");
    if (words.length === 1) {
      return { prefix: "", lastWord: words[0] };
    }
    const last = words.pop() || "";
    return { prefix: words.join(" ") + " ", lastWord: last };
  }, [title]);

  return (
    <div className={cn(
      "mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4",
      className
    )}>
      <div className="min-w-0">
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight">
          {prefix}<span className="gradient-text">{lastWord}</span>
        </h2>
        {description && (
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 w-full sm:w-auto">{action}</div>}
    </div>
  );
});

DashboardSectionHeader.displayName = "DashboardSectionHeader";
