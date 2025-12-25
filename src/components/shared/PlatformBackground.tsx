import * as React from "react";
import { cn } from "@/lib/utils";
import platformBg from "@/assets/backgrounds/platform-bg.png";

interface PlatformBackgroundProps {
  className?: string;
  /** Intensity of the overlay darkness (0-1) */
  overlayOpacity?: number;
  /** Whether to show the background image */
  showImage?: boolean;
  /** Additional ambient glow effects */
  showAmbientGlow?: boolean;
}

/**
 * Platform-wide background component with abstract fluid green/black design.
 * Provides the foundation for glassmorphism card effects.
 * Apply to layout wrappers for consistent visual depth.
 */
export const PlatformBackground = React.memo(function PlatformBackground({
  className,
  overlayOpacity = 0.4,
  showImage = true,
  showAmbientGlow = true,
}: PlatformBackgroundProps) {
  return (
    <div 
      className={cn(
        "fixed inset-0 -z-10 pointer-events-none",
        className
      )}
      aria-hidden="true"
    >
      {/* Base dark background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Background image layer */}
      {showImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${platformBg})`,
            opacity: 1 - overlayOpacity,
          }}
        />
      )}
      
      {/* Gradient overlay for depth and readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, hsl(var(--primary) / 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, hsl(var(--primary) / 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, hsl(var(--background)) 0%, transparent 100%)
          `,
        }}
      />
      
      {/* Ambient glow orbs for extra depth */}
      {showAmbientGlow && (
        <>
          <div 
            className="absolute rounded-full animate-pulse"
            style={{ 
              width: 400,
              height: 400,
              top: "5%", 
              right: "-5%",
              background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div 
            className="absolute rounded-full animate-pulse"
            style={{ 
              width: 350,
              height: 350,
              bottom: "10%", 
              left: "-10%",
              background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
              filter: "blur(50px)",
              animationDelay: "1s",
            }}
          />
          <div 
            className="absolute rounded-full animate-pulse"
            style={{ 
              width: 250,
              height: 250,
              top: "40%", 
              left: "30%",
              background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)",
              filter: "blur(40px)",
              animationDelay: "2s",
            }}
          />
        </>
      )}
      
      {/* Top vignette for header area */}
      <div 
        className="absolute inset-x-0 top-0 h-32"
        style={{
          background: "linear-gradient(to bottom, hsl(var(--background) / 0.9), transparent)",
        }}
      />
      
      {/* Bottom gradient for mobile nav area */}
      <div 
        className="absolute inset-x-0 bottom-0 h-24 xl:hidden"
        style={{
          background: "linear-gradient(to top, hsl(var(--background) / 0.95), transparent)",
        }}
      />
    </div>
  );
});

export default PlatformBackground;
