import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  children: ReactNode;
  className?: string;
  /** Show curved bottom edge */
  curved?: boolean;
  /** Background style variant */
  variant?: "default" | "gradient" | "subtle";
}

export function HeroSection({
  children,
  className,
  curved = true,
  variant = "default",
}: HeroSectionProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        // Extend to edges
        "-mx-4 px-4 md:-mx-6 md:px-6",
        // Background variants
        variant === "gradient" && "gradient-header",
        variant === "subtle" && "bg-card/50",
        // Curved bottom
        curved && "pb-8",
        className
      )}
    >
      {/* Background gradient overlay */}
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none",
          variant === "default" && "bg-gradient-to-b from-primary/5 via-transparent to-transparent"
        )}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Curved bottom edge */}
      {curved && (
        <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 w-full h-full"
          >
            <path
              d="M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z"
              className="fill-background"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
