import { memo } from "react";
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
  return (
    <div className={cn("mb-4", className)}>
      <h2 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight">
        {title}
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
