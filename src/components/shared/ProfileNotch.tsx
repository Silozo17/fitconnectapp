import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";

interface ProfileNotchProps {
  className?: string;
  headerHeight?: number;
}

const ProfileNotch = ({ className, headerHeight = 64 }: ProfileNotchProps) => {
  const { toggle, isOpen } = useProfilePanel();
  
  // Use the shared hook that reads Despia's --safe-area-top CSS variable
  const actualHeaderHeight = useHeaderHeight(headerHeight);

  return (
    <button
      onClick={toggle}
      className={cn(
        // Fixed positioning - always on top
        "fixed left-1/2 -translate-x-1/2 z-50",
        // Circle styling - slightly larger for prominence
        "w-14 h-14 rounded-full",
        // Glass effect with green accent border
        "glass-nav border-2 border-primary/60",
        // Green glow ring
        "ring-2 ring-primary/70",
        // Icon centering
        "flex items-center justify-center",
        // Animated glow effect
        "notch-glow-pulse",
        // Interactive states - synced with panel animation
        "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "hover:scale-110 hover:ring-primary active:scale-95",
        "focus:outline-none focus:ring-4 focus:ring-primary/80",
        // When open, intensify the glow
        isOpen && "ring-4 ring-primary border-primary",
        className
      )}
      style={{
        // Notch is 56px tall, so -28px makes it straddle the header's bottom edge
        top: isOpen 
          ? `calc(${actualHeaderHeight}px + 65vh - 28px)` 
          : `${actualHeaderHeight - 28}px`,
      }}
      aria-label={isOpen ? "Close profile" : "Open profile"}
      aria-expanded={isOpen}
    >
      <User 
        className={cn(
          "w-6 h-6 text-primary transition-all duration-300",
          "drop-shadow-[0_0_8px_hsl(var(--primary)/0.8)]",
          isOpen && "rotate-180 text-primary"
        )} 
        strokeWidth={2} 
      />
    </button>
  );
};

export default ProfileNotch;
