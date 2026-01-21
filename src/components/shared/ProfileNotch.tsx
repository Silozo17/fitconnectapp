import { useState, useEffect, useCallback } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";
import { STORAGE_KEYS } from "@/lib/storage-keys";

interface ProfileNotchProps {
  className?: string;
  headerHeight?: number;
}

const ProfileNotch = ({ className, headerHeight = 64 }: ProfileNotchProps) => {
  const { toggle, isOpen } = useProfilePanel();
  const actualHeaderHeight = useHeaderHeight(headerHeight);
  
  // Inline tooltip state for fixed positioning compatibility
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  // Check if tooltip was already seen
  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEYS.PROFILE_NOTCH_TOOLTIP_SEEN);
      if (seen === "true") return;

      const showTimer = setTimeout(() => {
        setShowTooltip(true);
        requestAnimationFrame(() => setIsTooltipVisible(true));
      }, 500);

      return () => clearTimeout(showTimer);
    } catch {
      // localStorage not available
    }
  }, []);

  // Auto-dismiss after 3.5 seconds
  useEffect(() => {
    if (!showTooltip) return;

    const dismissTimer = setTimeout(() => {
      dismissTooltip();
    }, 3500);

    return () => clearTimeout(dismissTimer);
  }, [showTooltip]);

  const dismissTooltip = useCallback(() => {
    setIsTooltipVisible(false);
    setTimeout(() => {
      setShowTooltip(false);
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE_NOTCH_TOOLTIP_SEEN, "true");
      } catch {
        // localStorage not available
      }
    }, 200);
  }, []);

  const handleClick = () => {
    toggle();
    if (showTooltip) {
      dismissTooltip();
    }
  };

  // Calculate tooltip position - below the notch when closed
  const tooltipTop = actualHeaderHeight + 32; // header + notch visible part + small gap

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          // Fixed positioning - always on top
          "fixed left-1/2 -translate-x-1/2 z-50",
          // Circle styling
          "w-12 h-12 rounded-full",
          // Glass effect matching nav
          "glass-nav border border-border/40",
          // Icon centering
          "flex items-center justify-center",
          // Interactive states - synced with panel animation
          "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "hover:scale-105 active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
          // Shadow for depth + green ring
          "shadow-[0_4px_20px_hsl(0_0%_0%/0.4),0_0_0_1px_hsl(var(--border)/0.3),0_0_0_3px_rgba(34,197,94,0.5)]",
          // When open, add glow
          isOpen && "ring-2 ring-primary/30",
          className
        )}
        style={{
          // Notch is 48px tall, so -24px makes it straddle the header's bottom edge
          top: isOpen 
            ? `calc(${actualHeaderHeight}px + 65vh - 24px)` 
            : `${actualHeaderHeight - 24}px`,
        }}
        aria-label={isOpen ? "Close profile" : "Open profile"}
        aria-expanded={isOpen}
      >
        {/* Shine effect overlay */}
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 via-white/5 to-transparent pointer-events-none"
          aria-hidden="true"
        />
        <User 
          className={cn(
            "w-5 h-5 text-foreground transition-transform duration-300 relative z-10",
            isOpen && "rotate-180"
          )} 
          strokeWidth={1.5} 
        />
      </button>

      {/* Tooltip rendered separately with fixed positioning */}
      {showTooltip && !isOpen && (
        <div
          className={cn(
            "fixed left-1/2 -translate-x-1/2 z-[60]",
            "w-max max-w-[min(280px,calc(100vw-32px))]",
            "transition-all duration-200 ease-out",
            isTooltipVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
          style={{ top: `${tooltipTop}px` }}
        >
          <div className="bg-primary text-primary-foreground text-sm font-medium px-3 py-2 rounded-lg shadow-lg text-center">
            Tap to see your profile! 👤
          </div>
          {/* Arrow pointing up */}
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-[6px] border-b-primary border-x-transparent border-t-transparent"
          />
        </div>
      )}
    </>
  );
};

export default ProfileNotch;
