import { memo } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineLoaderProps {
  text?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: {
    icon: "w-3 h-3",
    text: "text-xs",
    gap: "gap-1.5",
  },
  default: {
    icon: "w-4 h-4",
    text: "text-sm",
    gap: "gap-2",
  },
  lg: {
    icon: "w-5 h-5",
    text: "text-base",
    gap: "gap-2.5",
  },
};

export const InlineLoader = memo(({ 
  text = "Loading...", 
  size = "default",
  className 
}: InlineLoaderProps) => {
  const sizes = sizeClasses[size];

  return (
    <div 
      className={cn(
        "flex items-center justify-center py-4",
        sizes.gap,
        className
      )}
      role="status"
      aria-label={text}
    >
      <Loader2 
        className={cn("animate-spin text-primary", sizes.icon)} 
        aria-hidden="true" 
      />
      <span className={cn("text-muted-foreground font-medium", sizes.text)}>
        {text}
      </span>
    </div>
  );
});

InlineLoader.displayName = "InlineLoader";

// Centered full-area loader
interface AreaLoaderProps extends InlineLoaderProps {
  minHeight?: string;
}

export const AreaLoader = memo(({ 
  text = "Loading...", 
  size = "default",
  minHeight = "200px",
  className 
}: AreaLoaderProps) => {
  const sizes = sizeClasses[size];

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center",
        sizes.gap,
        className
      )}
      style={{ minHeight }}
      role="status"
      aria-label={text}
    >
      <Loader2 
        className={cn("animate-spin text-primary", sizes.icon)} 
        aria-hidden="true" 
      />
      <span className={cn("text-muted-foreground font-medium", sizes.text)}>
        {text}
      </span>
    </div>
  );
});

AreaLoader.displayName = "AreaLoader";
