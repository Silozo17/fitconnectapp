import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";

interface ProfileNotchProps {
  className?: string;
}

const ProfileNotch = ({ className }: ProfileNotchProps) => {
  const { toggle, isOpen } = useProfilePanel();

  return (
    <button
      onClick={toggle}
      className={cn(
        // Base positioning - centered, protruding below header
        "absolute left-1/2 -translate-x-1/2 z-50",
        // Notch moves to bottom of panel when open, stays at header bottom when closed
        isOpen ? "bottom-0 translate-y-1/2" : "-bottom-6",
        // Circle styling
        "w-12 h-12 rounded-full",
        // Glass effect matching nav
        "glass-nav border border-border/40",
        // Icon centering
        "flex items-center justify-center",
        // Interactive states
        "transition-all duration-300 ease-out",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
        // Shadow for depth - seamless blend with header
        "shadow-[0_4px_20px_hsl(0_0%_0%/0.4),0_0_0_1px_hsl(var(--border)/0.3)]",
        // When open, add glow
        isOpen && "ring-2 ring-primary/30",
        className
      )}
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
