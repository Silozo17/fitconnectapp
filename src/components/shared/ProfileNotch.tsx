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
        "absolute left-1/2 -translate-x-1/2 z-[51]",
        // Position at bottom of header
        "-bottom-6",
        // Circle styling
        "w-12 h-12 rounded-full",
        // Glass effect matching nav
        "bg-background/80 backdrop-blur-xl border border-border/40",
        // Icon centering
        "flex items-center justify-center",
        // Interactive states
        "transition-all duration-300 ease-out",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
        // Shadow for depth
        "shadow-lg",
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
