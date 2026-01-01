import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import { getEnvironment } from "@/hooks/useEnvironment";

interface ProfileNotchProps {
  className?: string;
  headerHeight?: number;
}

const ProfileNotch = ({ className, headerHeight = 64 }: ProfileNotchProps) => {
  const { toggle, isOpen } = useProfilePanel();
  
  // Get environment to determine actual header height on iOS native
  const env = getEnvironment();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1280;
  
  // Calculate actual header height
  // On iOS native mobile: base (64px, includes pb-3 via border-box) + safe area (59px) = 123px
  // On other mobile: base (64px) - CSS env() handles safe area
  // On desktop: just use the prop value (64px)
  let actualHeaderHeight = headerHeight;
  if (isMobile) {
    if (env.isDespia && env.isIOS) {
      actualHeaderHeight = 64 + 59; // 123px - min-h-16 includes padding with border-box
    } else {
      actualHeaderHeight = 64; // CSS env() handles safe area separately
    }
  }

  return (
    <button
      onClick={toggle}
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
        // Shadow for depth
        "shadow-[0_4px_20px_hsl(0_0%_0%/0.4),0_0_0_1px_hsl(var(--border)/0.3)]",
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
      <User 
        className={cn(
          "w-5 h-5 text-foreground transition-transform duration-300",
          isOpen && "rotate-180"
        )} 
        strokeWidth={1.5} 
      />
    </button>
  );
};

export default ProfileNotch;
