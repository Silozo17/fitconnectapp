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
        // Glass effect with subtle green border
        "glass-nav border-2 border-primary/40",
        // Subtle static glow (not pulsing)
        "shadow-[0_0_12px_2px_hsl(var(--primary)/0.3)]",
        // Icon centering
        "flex items-center justify-center",
        // Positioning context for shine overlay (avoid overflow clipping artifacts)
        "relative",
        // Interactive states - synced with panel animation
        "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "hover:scale-110 hover:border-primary/60 hover:shadow-[0_0_16px_3px_hsl(var(--primary)/0.4)]",
        "active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-primary/60",
        // When open, slightly more prominent
        isOpen && "border-primary/70 shadow-[0_0_20px_4px_hsl(var(--primary)/0.4)]",
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
      {/* Shine sweep overlay */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <div className="absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      

      <User 
        className={cn(
          "w-6 h-6 text-primary transition-all duration-300 relative z-10",
          "drop-shadow-[0_0_4px_hsl(var(--primary)/0.5)]",
          isOpen && "rotate-180"
        )} 
        strokeWidth={2} 
      />
    </button>
  );
};

export default ProfileNotch;
