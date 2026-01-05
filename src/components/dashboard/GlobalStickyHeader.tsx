import { cn } from "@/lib/utils";

interface GlobalStickyHeaderProps {
  // Greeting content (shown at page top)
  greetingTitle: string;
  greetingDescription: string;
  
  // Active section content (shown when scrolling)
  sectionTitle?: string;
  sectionDescription?: string;
  
  // Visibility control
  greetingOpacity: number;
  sectionOpacity: number;
  showSection: boolean;
  
  className?: string;
}

export function GlobalStickyHeader({
  greetingTitle,
  greetingDescription,
  sectionTitle,
  sectionDescription,
  greetingOpacity,
  sectionOpacity,
  showSection,
  className,
}: GlobalStickyHeaderProps) {
  // Don't render anything if both are invisible
  if (greetingOpacity <= 0 && sectionOpacity <= 0) return null;

  return (
    <div
      className={cn(
        "sticky top-0 z-20 bg-background/80 backdrop-blur-sm py-3 -mx-4 px-4 lg:-mx-6 lg:px-6 min-h-[4.5rem]",
        className
      )}
    >
      {/* Greeting Layer */}
      <div
        className="transition-opacity duration-200 ease-out"
        style={{ opacity: greetingOpacity, display: showSection ? 'none' : 'block' }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display tracking-tight line-clamp-1">
          {greetingTitle}
        </h1>
        <p className="text-muted-foreground mt-1 text-base line-clamp-1">
          {greetingDescription}
        </p>
      </div>

      {/* Section Layer */}
      <div
        className="transition-opacity duration-200 ease-out"
        style={{ opacity: sectionOpacity, display: showSection ? 'block' : 'none' }}
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
