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
    loop: true,
    align: "center",
    containScroll: false,
    skipSnaps: false,
  });
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slidesCount, setSlidesCount] = useState(0);

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
    
    return () => {
      emblaApi.off("scroll", onScroll);
      emblaApi.off("reInit", onScroll);
    };
  }, [emblaApi, onScroll]);

  // Calculate 3D transform for each slide based on its position relative to scroll
  const getSlideStyle = (index: number) => {
    if (!emblaApi) return {};
    
    const snapList = emblaApi.scrollSnapList();
    const scrollSnap = snapList[index] || 0;
    
    // Distance from current scroll position (-1 to 1 range for adjacent slides)
    const distance = (scrollSnap - scrollProgress) * snapList.length;
    const absDistance = Math.abs(distance);
    
    // Clamp values for smooth transitions
    const clampedDistance = Math.max(-2, Math.min(2, distance));
    const clampedAbsDistance = Math.min(2, absDistance);
    
    // 3D transforms
    const rotateY = clampedDistance * -25; // Rotate cards on Y axis
    const translateZ = clampedAbsDistance * -60; // Push away from viewer
    const scale = 1 - clampedAbsDistance * 0.12; // Scale down distant cards
    const opacity = 1 - clampedAbsDistance * 0.25; // Fade distant cards
    
    return {
      transform: `perspective(1000px) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
      opacity: Math.max(0.4, opacity),
      zIndex: 10 - Math.round(absDistance),
      transition: "transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.25s ease-out",
      willChange: "transform, opacity",
    };
  };

  const childArray = Children.toArray(children);

  return (
    <div className={cn("relative overflow-x-hidden", className)}>
      {/* Carousel viewport - overflow-hidden clips shadows */}
      <div className="overflow-hidden">
        <div 
          ref={emblaRef} 
          className="overflow-visible"
          style={{ perspective: "1000px" }}
        >
          <div 
            className="flex items-center pt-4 pb-8"
            style={{ gap: `${gap}px`, paddingLeft: "20px", paddingRight: "20px" }}
          >
            {childArray.map((child, index) => {
              if (!isValidElement(child)) return null;
              
              return (
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{
                    ...getSlideStyle(index),
                    transformStyle: "preserve-3d",
                  }}
                >
                  {cloneElement(child as React.ReactElement<any>)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pagination dots - outside overflow clip */}
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
