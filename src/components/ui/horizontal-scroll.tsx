import { ReactNode, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  /** Show navigation arrows on hover (desktop) */
  showArrows?: boolean;
  /** Gap between items */
  gap?: "sm" | "md" | "lg";
  /** Padding at edges */
  edgePadding?: boolean;
}

export function HorizontalScroll({
  children,
  className,
  showArrows = true,
  gap = "md",
  edgePadding = true,
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const gapClasses = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  };

  return (
    <div className={cn("group relative", className)}>
      {/* Left Arrow */}
      {showArrows && (
        <Button
          variant="floating"
          size="icon-sm"
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className={cn(
          "flex overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory",
          gapClasses[gap],
          edgePadding && "px-4 -mx-4 md:px-0 md:mx-0"
        )}
      >
        {children}
      </div>

      {/* Right Arrow */}
      {showArrows && (
        <Button
          variant="floating"
          size="icon-sm"
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Fade edges on desktop */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none hidden md:block" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none hidden md:block" />
    </div>
  );
}

interface ScrollItemProps {
  children: ReactNode;
  className?: string;
}

export function ScrollItem({ children, className }: ScrollItemProps) {
  return (
    <div className={cn("snap-start flex-shrink-0", className)}>
      {children}
    </div>
  );
}
