import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardSkeletonProps {
  variant?: "client" | "coach";
  className?: string;
}

/**
 * Dashboard loading skeleton - provides instant visual feedback
 * while data is loading, preventing layout shift and spinner fatigue
 */
export const DashboardSkeleton = memo(({ variant = "client", className }: DashboardSkeletonProps) => {
  return (
    <div className={cn("animate-fade-in", className)}>
      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Main content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large widget */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Side widgets */}
        <div className="space-y-6">
          {/* Quick actions skeleton */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-6">
            <Skeleton className="h-5 w-28 mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Stats widget skeleton */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-6">
            <Skeleton className="h-5 w-24 mb-4" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

DashboardSkeleton.displayName = "DashboardSkeleton";

/**
 * Compact skeleton for individual widgets
 */
export const WidgetSkeleton = memo(({ className }: { className?: string }) => {
  return (
    <div className={cn("rounded-xl border border-border/50 bg-card/50 p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
});

WidgetSkeleton.displayName = "WidgetSkeleton";

/**
 * Stat card skeleton
 */
export const StatCardSkeleton = memo(({ className }: { className?: string }) => {
  return (
    <div className={cn("rounded-xl border border-border/50 bg-card/50 p-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
});

StatCardSkeleton.displayName = "StatCardSkeleton";

export default DashboardSkeleton;
