import { ReactNode, useRef, useState, useEffect, Children } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  /** Show navigation arrows on hover (desktop) */
  showArrows?: boolean;
  /** Show pagination dots */
  showPagination?: boolean;
  /** Gap between items */
  gap?: "sm" | "md" | "lg";
  /** Padding at edges */
  edgePadding?: boolean;
}

export function HorizontalScroll({
  children,
  className,
  showArrows = true,
  showPagination = true,
  gap = "md",
  edgePadding = true,
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [visibleItems, setVisibleItems] = useState(1);

  // Count children and calculate visible items
  useEffect(() => {
    const count = Children.count(children);
    setTotalItems(count);
    
    const updateVisibleItems = () => {
      if (!scrollRef.current) return;
      const containerWidth = scrollRef.current.clientWidth;
      const firstChild = scrollRef.current.firstElementChild as HTMLElement;
      if (firstChild) {
        const itemWidth = firstChild.offsetWidth + 16; // including gap
        const visible = Math.floor(containerWidth / itemWidth) || 1;
        setVisibleItems(visible);
      }
    };
    
    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, [children]);

  // Track scroll position to update active index
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const scrollLeft = scrollRef.current.scrollLeft;
      const containerWidth = scrollRef.current.clientWidth;
      const scrollWidth = scrollRef.current.scrollWidth;
      
      // Calculate which "page" we're on
      const maxScroll = scrollWidth - containerWidth;
      const pages = Math.ceil(totalItems / visibleItems);
      const currentPage = Math.round((scrollLeft / maxScroll) * (pages - 1));
      setActiveIndex(Math.max(0, Math.min(currentPage, pages - 1)));
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [totalItems, visibleItems]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollToPage = (pageIndex: number) => {
    if (!scrollRef.current) return;
    const containerWidth = scrollRef.current.clientWidth;
    const scrollWidth = scrollRef.current.scrollWidth;
    const maxScroll = scrollWidth - containerWidth;
    const pages = Math.ceil(totalItems / visibleItems);
    const targetScroll = (pageIndex / (pages - 1)) * maxScroll;
    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  const gapClasses = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  };

  const pages = Math.ceil(totalItems / visibleItems);
  const showDots = showPagination && pages > 1;

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

      {/* Scroll Container with padding to prevent hover clipping */}
      <div
        ref={scrollRef}
        className={cn(
          "flex overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 -my-4",
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

      {/* Pagination dots */}
      {showDots && (
        <div className="flex justify-center items-center gap-1.5 mt-4">
          {Array.from({ length: pages }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToPage(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === activeIndex
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
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
