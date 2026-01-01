import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";

interface ProfilePanelProps {
  children: React.ReactNode;
  headerHeight?: number;
}

const ProfilePanel = ({ children, headerHeight = 64 }: ProfilePanelProps) => {
  const { isOpen, close } = useProfilePanel();
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);

  // Use the shared hook that reads Despia's --safe-area-top CSS variable
  const actualHeaderHeight = useHeaderHeight(headerHeight);

  // Handle swipe up to close
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const swipeDistance = touchStartY.current - touchCurrentY.current;
    // If swiped up more than 50px, close the panel
    if (swipeDistance > 50) {
      close();
    }
  }, [close]);

  // Attach touch listeners when panel is open
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !isOpen) return;

    panel.addEventListener('touchstart', handleTouchStart, { passive: true });
    panel.addEventListener('touchmove', handleTouchMove, { passive: true });
    panel.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      panel.removeEventListener('touchstart', handleTouchStart);
      panel.removeEventListener('touchmove', handleTouchMove);
      panel.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  return (
    <>
      {/* Backdrop overlay - click to close */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/70 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{ top: actualHeaderHeight }}
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel container */}
      <div
        ref={panelRef}
        className={cn(
          // Positioning - below backdrop but above content
          "fixed left-0 right-0 z-[45]",
          // Height - exactly 65vh
          "h-[65vh]",
          // Glass styling
          "glass-floating",
          // Border adjustments
          "rounded-t-none border-t-0",
          // Animation - GPU accelerated with iOS-like spring easing
          "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isOpen 
            ? "opacity-100" 
            : "opacity-0 pointer-events-none"
        )}
        style={{ 
          top: actualHeaderHeight,
          willChange: 'transform, opacity',
          transformOrigin: 'top center',
          transform: isOpen 
            ? 'scaleY(1) translateZ(0)' 
            : 'scaleY(0) translateZ(0)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Profile panel"
      >
        {/* Content area - hidden when panel is closed */}
        <div 
          className={cn(
            "h-full overflow-hidden px-4 pt-4 pb-8",
            !isOpen && "invisible"
          )}
          aria-hidden={!isOpen}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default ProfilePanel;
