import { cn } from "@/lib/utils";

interface GlobalStickyHeaderProps {
  // Mode determines which content to show
  mode: "greeting" | "section";
  
  // Greeting content
  greetingTitle: string;
  greetingDescription: string;
  
  // Section content (when mode is "section")
  sectionTitle?: string;
  sectionDescription?: string;
  
  // Controls fade animation
  opacity: number;
  
  className?: string;
}

export function GlobalStickyHeader({
  mode,
  greetingTitle,
  greetingDescription,
  sectionTitle,
  sectionDescription,
  opacity,
  className,
}: GlobalStickyHeaderProps) {
  const isGreeting = mode === "greeting";
  
  return (
    <div
      className={cn(
        "sticky top-0 z-30 h-[72px] bg-background/95 backdrop-blur-sm -mx-4 px-4 lg:-mx-6 lg:px-6",
        "flex flex-col justify-center",
        className
      )}
    >
      <div
        className="transition-opacity duration-200 ease-out"
        style={{ opacity }}
      >
        {isGreeting ? (
          // Greeting state
          <>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display tracking-tight line-clamp-1">
              {greetingTitle}
            </h1>
            <p className="text-muted-foreground mt-0.5 text-base line-clamp-1">
              {greetingDescription}
            </p>
          </>
        ) : (
          // Section state
          <>
            <h2 className="text-lg font-semibold text-foreground font-display tracking-tight line-clamp-1">
              {sectionTitle}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
              {sectionDescription}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default GlobalStickyHeader;
