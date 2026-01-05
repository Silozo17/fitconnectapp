import { cn } from "@/lib/utils";

interface GlobalStickyHeaderProps {
  // Greeting content (shown at page top)
  greetingTitle: string;
  greetingDescription: string;
  
  // Active section content (shown when scrolling)
  sectionTitle?: string;
  sectionDescription?: string;
  
  // Visibility control - opacity only, no showSection needed
  greetingOpacity: number;
  sectionOpacity: number;
  
  className?: string;
}

export function GlobalStickyHeader({
  greetingTitle,
  greetingDescription,
  sectionTitle,
  sectionDescription,
  greetingOpacity,
  sectionOpacity,
  className,
}: GlobalStickyHeaderProps) {
  // Don't render anything if both are invisible
  if (greetingOpacity <= 0 && sectionOpacity <= 0) return null;

  return (
    <div
      className={cn(
        "sticky top-0 z-0 py-3 -mx-4 px-4 lg:-mx-6 lg:px-6 min-h-[4.5rem] pointer-events-none",
        className
      )}
    >
      {/* Greeting Layer - always rendered, controlled by opacity */}
      <div
        className="absolute inset-0 px-4 lg:px-6 py-3 transition-opacity duration-200 ease-out"
        style={{ opacity: greetingOpacity }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display tracking-tight line-clamp-1">
          {greetingTitle}
        </h1>
        <p className="text-muted-foreground mt-1 text-base line-clamp-1">
          {greetingDescription}
        </p>
      </div>

      {/* Section Layer - always rendered, controlled by opacity */}
      <div
        className="absolute inset-0 px-4 lg:px-6 py-3 transition-opacity duration-200 ease-out"
        style={{ opacity: sectionOpacity }}
      >
        <h2 className="text-lg font-semibold text-foreground font-display tracking-tight line-clamp-1">
          {sectionTitle}
        </h2>
        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
          {sectionDescription}
        </p>
      </div>
    </div>
  );
}

export default GlobalStickyHeader;
