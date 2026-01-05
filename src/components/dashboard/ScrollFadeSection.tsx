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
    if (!cardsElement) return;

    // Create observer that detects when cards enter the header zone
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Calculate opacity: fade out as cards overlap header
          // When ratio is 0, header is fully visible (opacity 1)
          // When ratio increases, header fades out
          const ratio = entry.intersectionRatio;
          const newOpacity = Math.max(0, 1 - ratio * 2);
          setHeaderOpacity(newOpacity);
        });
      },
      {
        root: null,
        // Target the top 15% of the viewport where headers live
        rootMargin: "0px 0px -85% 0px",
        // Fine-grained thresholds for smooth fading
        threshold: Array.from({ length: 21 }, (_, i) => i * 0.05),
      }
    );

    observer.observe(cardsElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className={className}>
      {/* Header - fades based on card overlap */}
      <div
        ref={headerRef}
        className="transition-opacity duration-200 ease-out mb-4"
        style={{ opacity: headerOpacity }}
      >
        <h2 className="text-xl md:text-2xl font-bold text-foreground font-display tracking-tight">
          {title}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          {description}
        </p>
      </div>

      {/* Cards container - observed for intersection */}
      <div ref={cardsRef}>
        {children}
      </div>
    </section>
  );
});

ScrollFadeSection.displayName = "ScrollFadeSection";

export default ScrollFadeSection;
