import { cn } from "@/lib/utils";

interface GlobalStickyHeaderProps {
  title: string;
  description: string;
  opacity: number;
  className?: string;
}

export function GlobalStickyHeader({
  title,
  description,
  opacity,
  className,
}: GlobalStickyHeaderProps) {
  // Don't render anything if opacity is 0
  if (opacity <= 0) return null;

  return (
    <div
      className={cn(
        "sticky top-0 z-20 bg-background/80 backdrop-blur-sm transition-opacity duration-200 ease-out py-3 -mx-4 px-4 lg:-mx-6 lg:px-6",
        className
      )}
      style={{ opacity }}
    >
      <h2 className="text-lg font-semibold text-foreground font-display tracking-tight line-clamp-1">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
        {description}
      </p>
    </div>
  );
}

export default GlobalStickyHeader;
