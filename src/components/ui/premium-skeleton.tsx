import * as React from "react";
import { cn } from "@/lib/utils";

interface PremiumSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "avatar" | "text" | "button" | "image";
}

const PremiumSkeleton = React.forwardRef<HTMLDivElement, PremiumSkeletonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "animate-pulse rounded-xl bg-muted/50";
    
    const variantStyles = {
      default: "",
      card: "p-4 rounded-2xl border border-border/30 bg-card/50",
      avatar: "rounded-full",
      text: "h-4",
      button: "h-12 rounded-xl",
      image: "aspect-video rounded-2xl",
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      />
    );
  }
);
PremiumSkeleton.displayName = "PremiumSkeleton";

interface ShimmerSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "avatar" | "text" | "button" | "image";
}

const ShimmerSkeleton = React.forwardRef<HTMLDivElement, ShimmerSkeletonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "relative overflow-hidden rounded-xl bg-muted/30";
    
    const variantStyles = {
      default: "",
      card: "p-4 rounded-2xl border border-border/30",
      avatar: "rounded-full",
      text: "h-4",
      button: "h-12 rounded-xl",
      image: "aspect-video rounded-2xl",
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        <div 
          className="absolute inset-0 -translate-x-full animate-shimmer"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--muted-foreground) / 0.08), transparent)",
          }}
        />
      </div>
    );
  }
);
ShimmerSkeleton.displayName = "ShimmerSkeleton";

interface SkeletonCardPremiumProps {
  className?: string;
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  shimmer?: boolean;
  style?: React.CSSProperties;
}

const SkeletonCardPremium = React.memo(({ 
  className, 
  lines = 3, 
  showAvatar = false,
  showImage = false,
  shimmer = true,
}: SkeletonCardPremiumProps) => {
  const SkeletonComponent = shimmer ? ShimmerSkeleton : PremiumSkeleton;
  
  return (
    <div 
      className={cn(
        "p-5 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm",
        className
      )}
    >
      {showImage && (
        <SkeletonComponent variant="image" className="w-full h-40 mb-4" />
      )}
      
      <div className="flex items-start gap-4">
        {showAvatar && (
          <SkeletonComponent variant="avatar" className="w-12 h-12 shrink-0" />
        )}
        
        <div className="flex-1 space-y-3">
          <SkeletonComponent variant="text" className="h-5 w-3/4" />
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <SkeletonComponent 
              key={i} 
              variant="text"
              className="h-3.5" 
              style={{ width: `${75 - i * 15}%` }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
});
SkeletonCardPremium.displayName = "SkeletonCardPremium";

interface SkeletonListPremiumProps {
  count?: number;
  className?: string;
  cardProps?: Omit<SkeletonCardPremiumProps, 'className'>;
}

const SkeletonListPremium = React.memo(({ count = 3, className, cardProps }: SkeletonListPremiumProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCardPremium 
          key={i} 
          {...cardProps}
          className="animate-fade-in"
          style={{ animationDelay: `${i * 100}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
});
SkeletonListPremium.displayName = "SkeletonListPremium";

export { PremiumSkeleton, ShimmerSkeleton, SkeletonCardPremium, SkeletonListPremium };
