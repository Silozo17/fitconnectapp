import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CoachCardSkeletonProps {
  className?: string;
}

/**
 * Skeleton matching CoachCard layout for Find Coaches page.
 * Provides instant visual feedback while coaches load.
 */
export const CoachCardSkeleton = memo(({ className }: CoachCardSkeletonProps) => {
  return (
    <div 
      className={cn(
        "rounded-2xl border border-border/50 bg-card/50 overflow-hidden",
        className
      )}
    >
      {/* Header with avatar */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Skeleton className="h-14 w-14 rounded-full shrink-0" />
          
          {/* Name and specialties */}
          <div className="flex-1 min-w-0">
            <Skeleton className="h-5 w-32 mb-2" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          
          {/* Favorite button */}
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        </div>
      </div>
      
      {/* Stats row */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-4 text-sm">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
      
      {/* Location */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="px-4 pb-4 pt-2 flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
      </div>
    </div>
  );
});

CoachCardSkeleton.displayName = "CoachCardSkeleton";

export default CoachCardSkeleton;
