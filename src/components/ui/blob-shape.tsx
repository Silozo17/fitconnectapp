import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface BlobShapeProps {
  className?: string;
  variant?: "pink" | "teal" | "orange" | "purple";
  size?: "sm" | "md" | "lg" | "xl";
}

const variantStyles = {
  pink: "bg-gradient-to-br from-gradient-pink/30 to-gradient-purple/20",
  teal: "bg-gradient-to-br from-gradient-teal/30 to-gradient-mint/20",
  orange: "bg-gradient-to-br from-gradient-orange/30 to-gradient-coral/20",
  purple: "bg-gradient-to-br from-gradient-purple/30 to-gradient-blue/20",
};

const sizeStyles = {
  sm: "w-32 h-32",
  md: "w-64 h-64",
  lg: "w-96 h-96",
  xl: "w-[500px] h-[500px]",
};

const BlobShape = forwardRef<HTMLDivElement, BlobShapeProps>(
  ({ className, variant = "pink", size = "lg" }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute rounded-full blur-3xl animate-blob-move",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
      />
    );
  }
);

BlobShape.displayName = "BlobShape";

export default BlobShape;
