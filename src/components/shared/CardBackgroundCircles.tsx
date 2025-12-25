import * as React from "react";
import { cn } from "@/lib/utils";

interface CardBackgroundCirclesProps {
  /** Preset pattern variant */
  variant?: "single" | "double" | "triple" | "scattered";
  /** Primary color for circles */
  color?: "primary" | "accent" | "mixed";
  /** Opacity/intensity of the circles */
  intensity?: "subtle" | "medium" | "strong";
  /** Size of circles */
  size?: "sm" | "md" | "lg";
  /** Custom className */
  className?: string;
}

/**
 * Decorative green circles that appear behind cards for depth.
 * Position this component as a sibling or within a relative parent.
 */
export const CardBackgroundCircles = React.memo(function CardBackgroundCircles({
  variant = "double",
  color = "primary",
  intensity = "subtle",
  size = "md",
  className,
}: CardBackgroundCirclesProps) {
  const opacityMap = {
    subtle: { primary: 0.15, secondary: 0.08 },
    medium: { primary: 0.25, secondary: 0.12 },
    strong: { primary: 0.35, secondary: 0.18 },
  };

  const sizeMap = {
    sm: { primary: 80, secondary: 60 },
    md: { primary: 140, secondary: 100 },
    lg: { primary: 220, secondary: 160 },
  };

  const opacity = opacityMap[intensity];
  const circleSize = sizeMap[size];

  const getColorStyle = (isPrimary: boolean) => {
    const alpha = isPrimary ? opacity.primary : opacity.secondary;
    
    if (color === "primary") {
      return `radial-gradient(circle, hsl(var(--primary) / ${alpha}) 0%, hsl(var(--primary) / ${alpha * 0.4}) 40%, transparent 70%)`;
    } else if (color === "accent") {
      return `radial-gradient(circle, hsl(var(--accent) / ${alpha}) 0%, hsl(var(--accent) / ${alpha * 0.4}) 40%, transparent 70%)`;
    } else {
      // Mixed: primary and accent
      return isPrimary 
        ? `radial-gradient(circle, hsl(var(--primary) / ${alpha}) 0%, hsl(var(--primary) / ${alpha * 0.4}) 40%, transparent 70%)`
        : `radial-gradient(circle, hsl(var(--accent) / ${alpha}) 0%, hsl(var(--accent) / ${alpha * 0.4}) 40%, transparent 70%)`;
    }
  };

  const baseCircleStyle = "absolute rounded-full pointer-events-none";

  return (
    <div 
      className={cn(
        "absolute inset-0 overflow-hidden rounded-[inherit] -z-10",
        className
      )}
      aria-hidden="true"
    >
      {variant === "single" && (
        <div
          className={cn(baseCircleStyle, "blur-[40px]")}
          style={{
            width: circleSize.primary,
            height: circleSize.primary,
            background: getColorStyle(true),
            top: "-20%",
            right: "-10%",
          }}
        />
      )}

      {variant === "double" && (
        <>
          <div
            className={cn(baseCircleStyle, "blur-[50px]")}
            style={{
              width: circleSize.primary,
              height: circleSize.primary,
              background: getColorStyle(true),
              top: "-15%",
              right: "-5%",
            }}
          />
          <div
            className={cn(baseCircleStyle, "blur-[40px]")}
            style={{
              width: circleSize.secondary,
              height: circleSize.secondary,
              background: getColorStyle(false),
              bottom: "-10%",
              left: "-5%",
            }}
          />
        </>
      )}

      {variant === "triple" && (
        <>
          <div
            className={cn(baseCircleStyle, "blur-[50px]")}
            style={{
              width: circleSize.primary,
              height: circleSize.primary,
              background: getColorStyle(true),
              top: "-20%",
              right: "10%",
            }}
          />
          <div
            className={cn(baseCircleStyle, "blur-[40px]")}
            style={{
              width: circleSize.secondary,
              height: circleSize.secondary,
              background: getColorStyle(false),
              bottom: "20%",
              left: "-8%",
            }}
          />
          <div
            className={cn(baseCircleStyle, "blur-[35px]")}
            style={{
              width: circleSize.secondary * 0.8,
              height: circleSize.secondary * 0.8,
              background: getColorStyle(true),
              bottom: "-10%",
              right: "30%",
            }}
          />
        </>
      )}

      {variant === "scattered" && (
        <>
          <div
            className={cn(baseCircleStyle, "blur-[60px]")}
            style={{
              width: circleSize.primary * 1.2,
              height: circleSize.primary * 1.2,
              background: getColorStyle(true),
              top: "-30%",
              left: "20%",
            }}
          />
          <div
            className={cn(baseCircleStyle, "blur-[50px]")}
            style={{
              width: circleSize.primary,
              height: circleSize.primary,
              background: getColorStyle(false),
              top: "40%",
              right: "-15%",
            }}
          />
          <div
            className={cn(baseCircleStyle, "blur-[40px]")}
            style={{
              width: circleSize.secondary,
              height: circleSize.secondary,
              background: getColorStyle(true),
              bottom: "-5%",
              left: "40%",
            }}
          />
        </>
      )}
    </div>
  );
});

export default CardBackgroundCircles;
