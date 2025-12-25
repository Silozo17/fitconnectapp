import { memo } from "react";
import { cn } from "@/lib/utils";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  style?: React.CSSProperties;
}

export const SkeletonCard = memo(({ 
  className, 
  lines = 3, 
  showAvatar = false,
  showImage = false,
  style 
}: SkeletonCardProps) => {
  return (
    <div 
      className={cn(
        "p-5 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm",
        className
      )}
      style={style}
    >
      {showImage && (
        <ShimmerSkeleton variant="image" className="w-full h-40 mb-4" />
      )}
      
      <div className="flex items-start gap-4">
        {showAvatar && (
          <ShimmerSkeleton variant="avatar" className="w-12 h-12 shrink-0" />
        )}
        
        <div className="flex-1 space-y-3">
          <ShimmerSkeleton variant="text" className="h-5 w-3/4" />
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <ShimmerSkeleton 
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

SkeletonCard.displayName = "SkeletonCard";

interface SkeletonListProps {
  count?: number;
  className?: string;
  cardProps?: Omit<SkeletonCardProps, 'className'>;
}

export const SkeletonList = memo(({ count = 3, className, cardProps }: SkeletonListProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard 
          key={i} 
          {...cardProps}
          className="animate-fade-in"
          style={{ animationDelay: `${i * 100}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
});

SkeletonList.displayName = "SkeletonList";
