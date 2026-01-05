import { useRef, useState, useEffect, ReactNode, memo } from "react";

interface ScrollFadeSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

const ScrollFadeSection = memo(({ title, description, children, className = "" }: ScrollFadeSectionProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [headerOpacity, setHeaderOpacity] = useState(1);

  useEffect(() => {
    const cardsElement = cardsRef.current;
    const headerElement = headerRef.current;
    if (!cardsElement || !headerElement) return;

    const headerHeight = headerElement.offsetHeight;

    // Create observer that detects when cards collide with the sticky header
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Cards are in the intersection zone
            // boundingClientRect.top tells us how far cards are from viewport top
            const rect = entry.boundingClientRect;
            
            // Calculate how much the cards have "entered" the header zone
            const overlap = Math.max(0, headerHeight - rect.top);
            const overlapRatio = Math.min(1, overlap / headerHeight);
            
            // Inverse: more overlap = less opacity
            setHeaderOpacity(1 - overlapRatio);
          } else {
            // Cards not in intersection zone - header fully visible
            setHeaderOpacity(1);
          }
        });
      },
      {
        root: null,
        // Detect when cards reach the very top of viewport
        rootMargin: "0px 0px -90% 0px",
        threshold: Array.from({ length: 11 }, (_, i) => i * 0.1),
      }
    );

    observer.observe(cardsElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className={className}>
      {/* Sticky Header - sticks at top of scroll container, fades on card collision */}
      <div
        ref={headerRef}
        className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm transition-opacity duration-200 ease-out pb-4 pt-2 -mx-4 px-4 lg:-mx-6 lg:px-6"
        style={{ opacity: headerOpacity }}
      >
        <h2 className="text-xl md:text-2xl font-bold text-foreground font-display tracking-tight">
          {title}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          {description}
        </p>
      </div>

      {/* Cards container - scrolls underneath sticky header */}
      <div ref={cardsRef}>
        {children}
      </div>
    </section>
  );
});

ScrollFadeSection.displayName = "ScrollFadeSection";

export default ScrollFadeSection;
