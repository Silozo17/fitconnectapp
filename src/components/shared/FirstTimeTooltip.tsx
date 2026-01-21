import { useState, useEffect, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FirstTimeTooltipProps {
  children: ReactNode;
  storageKey: string;
  message: string;
  position?: "top" | "bottom" | "left" | "right";
  showDelay?: number;
  duration?: number;
  className?: string;
}

export const FirstTimeTooltip = ({
  children,
  storageKey,
  message,
  position = "bottom",
  showDelay = 500,
  duration = 3500,
  className,
}: FirstTimeTooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check if already seen on mount
  useEffect(() => {
    try {
      const seen = localStorage.getItem(storageKey);
      if (seen === "true") return;

      // Show tooltip after delay
      const showTimer = setTimeout(() => {
        setShowTooltip(true);
        // Trigger fade-in after a tiny delay for animation
        requestAnimationFrame(() => setIsVisible(true));
      }, showDelay);

      return () => clearTimeout(showTimer);
    } catch {
      // localStorage not available
    }
  }, [storageKey, showDelay]);

  // Auto-dismiss after duration
  useEffect(() => {
    if (!showTooltip) return;

    const dismissTimer = setTimeout(() => {
      dismissTooltip();
    }, duration);

    return () => clearTimeout(dismissTimer);
  }, [showTooltip, duration]);

  const dismissTooltip = useCallback(() => {
    setIsVisible(false);
    // Wait for fade-out animation before removing
    setTimeout(() => {
      setShowTooltip(false);
      try {
        localStorage.setItem(storageKey, "true");
      } catch {
        // localStorage not available
      }
    }, 200);
  }, [storageKey]);

  const handleChildClick = useCallback(() => {
    if (showTooltip) {
      dismissTooltip();
    }
  }, [showTooltip, dismissTooltip]);

  // Position classes for the tooltip
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  // Arrow classes for each position
  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-primary border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-primary border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-primary border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-primary border-y-transparent border-l-transparent",
  };

  return (
    <div className={cn("relative inline-flex", className)} onClick={handleChildClick}>
      {children}
      
      {showTooltip && (
        <div
          className={cn(
            "absolute z-[60] whitespace-nowrap",
            positionClasses[position],
            "transition-all duration-200 ease-out",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
        >
          <div className="bg-primary text-primary-foreground text-sm font-medium px-3 py-2 rounded-lg shadow-lg">
            {message}
          </div>
          {/* Arrow */}
          <div
            className={cn(
              "absolute w-0 h-0 border-[6px]",
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  );
};
