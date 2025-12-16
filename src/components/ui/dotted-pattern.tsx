import * as React from "react";
import { cn } from "@/lib/utils";

interface DottedPatternProps {
  variant?: "circle" | "grid";
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const DottedPattern: React.FC<DottedPatternProps> = ({ 
  className, 
  variant = "circle", 
  size = 200, 
  style,
}) => {
  if (variant === "circle") {
    return (
      <div
        className={cn("dotted-circle", className)}
        style={{
          width: size,
          height: size,
          ...style,
        }}
      />
    );
  }

  return (
    <div
      className={cn("dotted-pattern", className)}
      style={{
        width: size,
        height: size,
        ...style,
      }}
    />
  );
};

DottedPattern.displayName = "DottedPattern";

export { DottedPattern };
