import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PillChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  variant?: "default" | "outline" | "ghost";
}

export const PillChip = forwardRef<HTMLButtonElement, PillChipProps>(
  ({ className, active = false, variant = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
          "transition-all duration-200 whitespace-nowrap flex-shrink-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "active:scale-[0.97]",
          // Variants
          variant === "default" && [
            active
              ? "bg-primary text-primary-foreground shadow-elevation-2"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          ],
          variant === "outline" && [
            active
              ? "border-2 border-primary text-primary bg-primary/10"
              : "border border-border text-muted-foreground hover:text-foreground hover:border-border/80",
          ],
          variant === "ghost" && [
            active
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          ],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PillChip.displayName = "PillChip";

interface PillChipGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function PillChipGroup({ children, className }: PillChipGroupProps) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto scrollbar-hide py-1 px-4 -mx-4 md:px-0 md:mx-0 md:flex-wrap",
        className
      )}
    >
      {children}
    </div>
  );
}
