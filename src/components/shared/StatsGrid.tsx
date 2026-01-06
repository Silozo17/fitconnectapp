import { memo, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsGridProps {
  children: ReactNode;
  className?: string;
  /** Number of columns - can be a simple number or responsive config */
  columns?: number | {
    default?: 1 | 2 | 3 | 4;
    sm?: 1 | 2 | 3 | 4;
    md?: 2 | 3 | 4 | 5 | 6;
    lg?: 2 | 3 | 4 | 5 | 6;
  };
  /** Gap between items */
  gap?: "sm" | "default" | "lg";
}

const columnClasses = {
  default: {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  },
  sm: {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
  },
  md: {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
  },
  lg: {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  },
};

const gapClasses = {
  sm: "gap-2",
  default: "gap-3",
  lg: "gap-4",
};

// Simple number to responsive config mapping
const simpleColumnDefaults: Record<number, { default: 1 | 2 | 3 | 4; md: 2 | 3 | 4 | 5 | 6 }> = {
  1: { default: 1, md: 2 },
  2: { default: 2, md: 2 },
  3: { default: 2, md: 3 },
  4: { default: 2, md: 4 },
  5: { default: 2, md: 5 },
  6: { default: 3, md: 6 },
};

/**
 * StatsGrid - Responsive grid for MetricCards and similar widgets
 * 
 * Features:
 * - Responsive column configuration
 * - Consistent gap spacing
 * - Common defaults: 2 cols mobile, 4 cols desktop
 * - Accepts simple number or responsive config
 */
export const StatsGrid = memo(({
  children,
  className,
  columns = { default: 2, md: 4 },
  gap = "default",
}: StatsGridProps) => {
  // Convert simple number to responsive config
  const responsiveColumns: {
    default?: 1 | 2 | 3 | 4;
    sm?: 1 | 2 | 3 | 4;
    md?: 2 | 3 | 4 | 5 | 6;
    lg?: 2 | 3 | 4 | 5 | 6;
  } = typeof columns === "number" 
    ? simpleColumnDefaults[columns] || { default: 2, md: columns as 2 | 3 | 4 | 5 | 6 }
    : columns;

  const gridClasses = [
    responsiveColumns.default && columnClasses.default[responsiveColumns.default],
    responsiveColumns.sm && columnClasses.sm[responsiveColumns.sm],
    responsiveColumns.md && columnClasses.md[responsiveColumns.md],
    responsiveColumns.lg && columnClasses.lg[responsiveColumns.lg],
  ].filter(Boolean).join(" ");

  return (
    <div className={cn("grid", gridClasses, gapClasses[gap], className)}>
      {children}
    </div>
  );
});

StatsGrid.displayName = "StatsGrid";
