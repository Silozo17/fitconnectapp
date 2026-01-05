import * as React from "react";
import { cn } from "@/lib/utils";
import { isDespia } from "@/lib/despia";

interface PlatformBackgroundProps {
  className?: string;
  /** Additional ambient glow effects */
  showAmbientGlow?: boolean;
}

/**
 * Platform-wide background component with clean dark design and subtle gradient glows.
 * Features green and purple ambient orbs for depth behind cards.
 * 
 * PERF FIX: Animated glow orbs are disabled in Despia native to reduce GPU load.
 */
export const PlatformBackground = React.memo(function PlatformBackground({
  className,
  showAmbientGlow = true,
}: PlatformBackgroundProps) {
  // PERF FIX: Disable animated glow effects in native app to reduce GPU repaints
  const isNativeApp = isDespia();
  const shouldShowAmbientGlow = showAmbientGlow && !isNativeApp;
  
  return (
    <div 
      className={cn(
        "fixed inset-0 -z-10 pointer-events-none overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      {/* Base dark background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Ambient glow orbs - green and purple for health/wellness theme */}
      {shouldShowAmbientGlow && (
        <>
          {/* Green glow - top right */}
          <div 
            className="absolute rounded-full"
            style={{ 
              width: 500,
              height: 500,
              top: "5%", 
              right: "-10%",
              background: "radial-gradient(circle, hsl(142 70% 45% / 0.08) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          {/* Purple glow - bottom left */}
          <div 
            className="absolute rounded-full"
            style={{ 
              width: 450,
              height: 450,
              bottom: "10%", 
              left: "-15%",
              background: "radial-gradient(circle, hsl(280 70% 50% / 0.06) 0%, transparent 70%)",
              filter: "blur(70px)",
            }}
          />
          {/* Cyan accent glow - center right for health cards area */}
          <div 
            className="absolute rounded-full"
            style={{ 
              width: 350,
              height: 350,
              top: "35%", 
              right: "5%",
              background: "radial-gradient(circle, hsl(180 60% 45% / 0.04) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          {/* Soft primary accent - top center */}
          <div 
            className="absolute rounded-full"
            style={{ 
              width: 300,
              height: 300,
              top: "-5%", 
              left: "30%",
              background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />
        </>
      )}
      
      {/* Top vignette for header area - extends behind status bar */}
      <div 
        className="absolute inset-x-0 top-0"
        style={{
          height: "calc(env(safe-area-inset-top, 0px) + 8rem)",
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
