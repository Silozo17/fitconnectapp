import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";

interface DashboardSectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export const DashboardSectionHeader = memo(({ 
  title, 
  description, 
  className 
}: DashboardSectionHeaderProps) => {
  // Split title to apply gradient to the last word
  const { prefix, lastWord } = useMemo(() => {
    const words = title.trim().split(" ");
    if (words.length === 1) {
      return { prefix: "", lastWord: words[0] };
    }
    const lastWord = words.pop() || "";
    return { prefix: words.join(" ") + " ", lastWord };
  }, [title]);

  return (
    <div className={cn("mb-4", className)}>
      <h2 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight">
        {prefix}<span className="gradient-text">{lastWord}</span>
      </h2>
      {description && (
        <p className="text-muted-foreground text-sm mt-1">
          {description}
        </p>
      )}
    </div>
  );
});

DashboardSectionHeader.displayName = "DashboardSectionHeader";
