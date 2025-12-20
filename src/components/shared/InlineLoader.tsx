import { memo } from "react";
import { useTranslation } from "react-i18next";
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
  text, 
  size = "default",
  className 
}: InlineLoaderProps) => {
  const { t } = useTranslation();
  const sizes = sizeClasses[size];
  const displayText = text || t('loading.default');

  return (
    <div 
      className={cn(
        "flex items-center justify-center py-4",
        sizes.gap,
        className
      )}
      role="status"
      aria-label={displayText}
    >
      <Loader2 
        className={cn("animate-spin text-primary", sizes.icon)} 
        aria-hidden="true" 
      />
      <span className={cn("text-muted-foreground font-medium", sizes.text)}>
        {displayText}
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
  text, 
  size = "default",
  minHeight = "200px",
  className 
}: AreaLoaderProps) => {
  const { t } = useTranslation();
  const sizes = sizeClasses[size];
  const displayText = text || t('loading.default');

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center",
        sizes.gap,
        className
      )}
      style={{ minHeight }}
      role="status"
      aria-label={displayText}
    >
      <Loader2 
        className={cn("animate-spin text-primary", sizes.icon)} 
        aria-hidden="true" 
      />
      <span className={cn("text-muted-foreground font-medium", sizes.text)}>
        {displayText}
      </span>
    </div>
  );
});

AreaLoader.displayName = "AreaLoader";
