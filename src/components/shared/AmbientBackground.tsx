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
  /** Card mode - more localized circles for use inside containers */
  cardMode?: boolean;
}

/**
 * Ambient decorative background with glowing orbs.
 * Add to page wrappers for atmospheric depth.
 * Use cardMode=true for localized depth circles behind card groups.
 */
export const AmbientBackground = React.memo(function AmbientBackground({
  className,
  showPrimary = true,
  showAccent = true,
  intensity = "medium",
  cardMode = false,
}: AmbientBackgroundProps) {
  const opacityMap = {
    subtle: "opacity-30",
    medium: "opacity-50",
    strong: "opacity-70",
  };

  // Card mode uses smaller, more focused circles
  if (cardMode) {
    return (
      <div 
        className={cn(
          "absolute inset-0 overflow-hidden pointer-events-none -z-10",
          opacityMap[intensity],
          className
        )}
        aria-hidden="true"
      >
        {showPrimary && (
          <>
            <div 
              className="absolute rounded-full"
              style={{ 
                width: 180,
                height: 180,
                top: "-10%", 
                right: "5%",
                background: "radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, hsl(var(--primary) / 0.05) 50%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            <div 
              className="absolute rounded-full"
              style={{ 
                width: 120,
                height: 120,
                bottom: "10%", 
                left: "-5%",
                background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 60%)",
                filter: "blur(30px)",
              }}
            />
          </>
        )}
        {showAccent && (
          <div 
            className="absolute rounded-full"
            style={{ 
              width: 140,
              height: 140,
              top: "50%", 
              right: "-8%",
              background: "radial-gradient(circle, hsl(var(--accent) / 0.12) 0%, transparent 60%)",
              filter: "blur(35px)",
            }}
          />
        )}
      </div>
    );
  }

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
