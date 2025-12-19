import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
      className={cn("p-4 rounded-lg border border-border bg-card animate-pulse", className)}
      style={style}
    >
      {showImage && (
        <Skeleton className="w-full h-40 rounded-lg mb-4" />
      )}
      
      <div className="flex items-start gap-3">
        {showAvatar && (
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        )}
        
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="h-3" 
              style={{ width: `${70 - i * 15}%` }} 
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
    <div className={cn("space-y-3", className)}>
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