import { ReactNode, useCallback, useEffect, useState, Children, cloneElement, isValidElement } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

interface Carousel3DProps {
  children: ReactNode;
  className?: string;
  /** Show pagination dots */
  showPagination?: boolean;
  /** Gap between items in pixels */
  gap?: number;
}

interface Carousel3DItemProps {
  children: ReactNode;
  className?: string;
}

export function Carousel3D({
  children,
  className,
  showPagination = true,
  gap = 16,
}: Carousel3DProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    containScroll: false,
    skipSnaps: false,
  });
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slidesCount, setSlidesCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    const progress = emblaApi.scrollProgress();
    setScrollProgress(progress);
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    setSlidesCount(emblaApi.scrollSnapList().length);
    onScroll();
    
    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", onScroll);
    emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
    
    // Drag state detection for smoother transitions
    const onPointerDown = () => setIsDragging(true);
    const onPointerUp = () => setIsDragging(false);
    const onSettle = () => setIsDragging(false);
    
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);
    emblaApi.on("settle", onSettle);
    
    return () => {
      emblaApi.off("scroll", onScroll);
      emblaApi.off("reInit", onScroll);
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
      emblaApi.off("settle", onSettle);
    };
  }, [emblaApi, onScroll]);

  // Opacity-only depth effect - NO TRANSFORMS to preserve backdrop-filter/glassmorphism
  const getSlideStyle = (index: number): React.CSSProperties => {
    if (!emblaApi) return {};
    
    const snapList = emblaApi.scrollSnapList();
    const scrollSnap = snapList[index] || 0;
    
    // Distance from current scroll position
    const distance = (scrollSnap - scrollProgress) * snapList.length;
    const absDistance = Math.abs(distance);
    const clampedAbsDistance = Math.min(2, absDistance);
    
    // Opacity-only depth effect - NO transforms to preserve backdrop-filter
    const opacity = 1 - clampedAbsDistance * 0.35; // 1 → 0.65 → 0.3
    
    return {
      opacity: Math.max(0.4, opacity),
      zIndex: 10 - Math.round(absDistance),
      transition: isDragging ? 'none' : 'opacity 0.2s ease-out',
    };
  };

  const childArray = Children.toArray(children);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Carousel viewport */}
      <div className="overflow-hidden">
        <div 
          ref={emblaRef} 
          className="overflow-x-clip"
        >
          <div 
            className="flex items-center pt-4 pb-8"
            style={{ 
              gap: `${gap}px`, 
              paddingLeft: "20px", 
              paddingRight: "20px",
            }}
          >
            {childArray.map((child, index) => {
              if (!isValidElement(child)) return null;
              
              const slideStyle = getSlideStyle(index);
              
              return (
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{
                    opacity: slideStyle.opacity,
                    zIndex: slideStyle.zIndex,
                    transition: slideStyle.transition,
                  }}
                >
                  {cloneElement(child as React.ReactElement<any>)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pagination dots */}
      {showPagination && slidesCount > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-4">
          {Array.from({ length: slidesCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === selectedIndex
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Carousel3DItem({ children, className }: Carousel3DItemProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}
