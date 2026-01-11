import { ReactNode, useCallback, useEffect, useState, useRef, Children, cloneElement, isValidElement } from "react";
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
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slidesCount, setSlidesCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Use refs for scroll progress to avoid state updates during scroll
  const scrollProgressRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const snapListRef = useRef<number[]>([]);

  // Update visual transforms directly without React state
  const updateVisuals = useCallback(() => {
    if (!containerRef.current || !emblaApi) return;
    
    const items = containerRef.current.querySelectorAll<HTMLElement>('[data-carousel-item]');
    const snapList = snapListRef.current;
    const progress = scrollProgressRef.current;
    
    items.forEach((item, index) => {
      const scrollSnap = snapList[index] || 0;
      const distance = (scrollSnap - progress) * snapList.length;
      const absDistance = Math.abs(distance);
      
      // Calculate scale: 1 (center) to 0.85 (edges)
      const scale = 1 - Math.min(absDistance * 0.075, 0.15);
      
      // Calculate dim: 0 (center) to 0.6 (edges)
      const dimAmount = Math.min(2, absDistance) * 0.3;
      
      // Calculate z-index
      const zIndex = 10 - Math.round(absDistance);
      
      // Apply directly to DOM - no React state update
      item.style.transform = `scale(${scale})`;
      item.style.zIndex = String(zIndex);
      item.style.setProperty('--carousel-dim', String(dimAmount));
    });
  }, [emblaApi]);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    
    scrollProgressRef.current = emblaApi.scrollProgress();
    
    // Cancel any pending RAF and request a new one
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    rafIdRef.current = requestAnimationFrame(updateVisuals);
  }, [emblaApi, updateVisuals]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const childArray = Children.toArray(children);

  useEffect(() => {
    if (!emblaApi) return;
    
    // Cache snap list - only recalculate on reInit
    snapListRef.current = emblaApi.scrollSnapList();
    setSlidesCount(childArray.length);
    
    // Initial visual update
    scrollProgressRef.current = emblaApi.scrollProgress();
    updateVisuals();
    setSelectedIndex(emblaApi.selectedScrollSnap());
    
    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", () => {
      snapListRef.current = emblaApi.scrollSnapList();
      onScroll();
    });
    emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
    
    // Drag state detection
    const onPointerDown = () => setIsDragging(true);
    const onPointerUp = () => setIsDragging(false);
    const onSettle = () => setIsDragging(false);
    
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);
    emblaApi.on("settle", onSettle);
    
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      emblaApi.off("scroll", onScroll);
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
      emblaApi.off("settle", onSettle);
    };
  }, [emblaApi, onScroll, updateVisuals, childArray.length]);

  return (
    <div className={cn("relative", className)}>
      {/* Carousel viewport */}
      <div 
        ref={emblaRef} 
        className="overflow-x-clip carousel-3d-viewport"
      >
        <div 
          ref={containerRef}
          className="flex items-center pt-4 pb-8"
          style={{ 
            gap: `${gap}px`, 
            paddingLeft: "20px", 
            paddingRight: "20px",
          }}
        >
          {childArray.map((child, index) => {
            if (!isValidElement(child)) return null;
            
            return (
              <div
                key={index}
                data-carousel-item
                className={cn(
                  "flex-shrink-0 carousel-3d-item",
                  // Only apply transition when NOT dragging
                  !isDragging && "carousel-3d-item--settling"
                )}
                style={{ 
                  willChange: 'transform',
                }}
              >
                {cloneElement(child as React.ReactElement<any>, {
                  style: {
                    ...(child.props?.style || {}),
                  } as React.CSSProperties,
                })}
              </div>
            );
          })}
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
