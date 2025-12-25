import * as React from "react";
import { cn } from "@/lib/utils";

interface AmbientBackgroundProps {
  className?: string;
  /** Show green primary orbs */
  showPrimary?: boolean;
  /** Show purple accent orbs */
  showAccent?: boolean;
  /** Intensity of the glow (0-1) */
  intensity?: "subtle" | "medium" | "strong";
}

/**
 * Ambient decorative background with glowing orbs.
 * Add to page wrappers for atmospheric depth.
 */
export const AmbientBackground = React.memo(function AmbientBackground({
  className,
  showPrimary = true,
  showAccent = true,
  intensity = "medium",
}: AmbientBackgroundProps) {
  const opacityMap = {
    subtle: "opacity-30",
    medium: "opacity-50",
    strong: "opacity-70",
  };

  return (
    <div 
      className={cn("ambient-glow-container", opacityMap[intensity], className)}
      aria-hidden="true"
    >
      {/* Primary green orbs */}
      {showPrimary && (
        <>
          <div 
            className="glow-orb glow-orb-lg"
            style={{ 
              top: "-10%", 
              right: "-5%",
              animationDelay: "0s" 
            }}
          />
          <div 
            className="glow-orb glow-orb-md"
            style={{ 
              bottom: "20%", 
              left: "-8%",
              animationDelay: "2s" 
            }}
          />
          <div 
            className="glow-orb glow-orb-sm"
            style={{ 
              top: "40%", 
              right: "10%",
              animationDelay: "4s" 
            }}
          />
        </>
      )}

      {/* Purple accent orbs */}
      {showAccent && (
        <>
          <div 
            className="glow-orb-purple glow-orb-md"
            style={{ 
              top: "60%", 
              right: "-10%",
              animationDelay: "1s" 
            }}
          />
          <div 
            className="glow-orb-purple glow-orb-sm"
            style={{ 
              bottom: "10%", 
              left: "20%",
              animationDelay: "3s" 
            }}
          />
        </>
      )}
    </div>
  );
});

export default AmbientBackground;
