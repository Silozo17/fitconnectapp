import { memo, useMemo } from "react";
import { useActiveSection } from "@/contexts/ScrollSectionContext";

interface ScrollContextHeaderProps {
  displayName: string;
  greeting: string;
  subtitle: string;
}

const ScrollContextHeader = memo(({ displayName, greeting, subtitle }: ScrollContextHeaderProps) => {
  const { activeSection, intersectionRatio, isAtTop } = useActiveSection();

  // Calculate opacities based on scroll state
  const { greetingOpacity, sectionOpacity } = useMemo(() => {
    if (isAtTop) {
      return { greetingOpacity: 1, sectionOpacity: 0 };
    }
    
    // Smooth transition: greeting fades out, section fades in
    const fadeProgress = Math.min(1, intersectionRatio * 1.5);
    return {
      greetingOpacity: Math.max(0, 1 - fadeProgress),
      sectionOpacity: fadeProgress,
    };
  }, [isAtTop, intersectionRatio]);

  return (
    <div className="relative h-20 md:h-24 mb-6">
      {/* Greeting layer */}
      <div
        className="absolute inset-0 flex flex-col justify-center transition-opacity duration-300 ease-out"
        style={{ opacity: greetingOpacity }}
        aria-hidden={!isAtTop}
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground font-display tracking-tight">
          {greeting}, <span className="gradient-text">{displayName || "there"}</span>
        </h1>
        <p className="text-muted-foreground mt-1 md:mt-2 text-base md:text-lg">
          {subtitle}
        </p>
      </div>

      {/* Section header layer */}
      <div
        className="absolute inset-0 flex flex-col justify-center transition-opacity duration-300 ease-out"
        style={{ opacity: sectionOpacity }}
        aria-hidden={isAtTop || !activeSection}
      >
        {activeSection && (
          <>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground font-display tracking-tight">
              {activeSection.title}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {activeSection.description}
            </p>
          </>
        )}
      </div>
    </div>
  );
});

ScrollContextHeader.displayName = "ScrollContextHeader";

export default ScrollContextHeader;
