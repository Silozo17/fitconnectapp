import { AccentCard, AccentCardContent } from "@/components/ui/accent-card";
import { Badge } from "@/components/ui/badge";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
import { usePersonalRecords } from "@/hooks/usePersonalRecords";
import { TrendingUp, Dumbbell, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { isThisWeek } from "date-fns";

interface PersonalRecordsWidgetProps {
  className?: string;
}

export function PersonalRecordsWidget({ className }: PersonalRecordsWidgetProps) {
  const { records, recentPRs, isLoading, hasRecords } = usePersonalRecords();

  if (isLoading) {
    return (
      <AccentCard className={cn("rounded-2xl", className)}>
        <AccentCardContent className="p-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <ShimmerSkeleton className="h-4 w-28" />
              <ShimmerSkeleton className="h-4 w-16" />
            </div>
          ))}
        </AccentCardContent>
      </AccentCard>
    );
  }

  if (!hasRecords) {
    return null;
  }

  const topRecords = records.slice(0, 5);

  return (
    <AccentCard className={cn("rounded-2xl", className)}>
      <AccentCardContent className="p-5 space-y-3">
        {/* New PRs badge */}
        {recentPRs.length > 0 && (
          <div className="flex justify-end">
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
              <Sparkles className="w-3 h-3 mr-1" />
              {recentPRs.length} new PR{recentPRs.length > 1 ? 's' : ''}!
            </Badge>
          </div>
        )}

        {topRecords.map((pr, index) => {
          const isRecent = isThisWeek(new Date(pr.achievedAt));
          
          return (
            <div
              key={pr.exerciseName}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl transition-colors",
                isRecent ? "bg-success/5 border border-success/20" : "bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                  index === 0 ? "bg-primary/20 text-primary" :
                  index === 1 ? "bg-zinc-400/20 text-zinc-400" :
                  index === 2 ? "bg-primary/10 text-primary/70" :
                  "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{pr.exerciseName}</p>
                  <p className="text-xs text-muted-foreground">
                    {pr.weight}kg × {pr.reps} reps
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Dumbbell className="w-3 h-3 text-muted-foreground" />
                  <span className="font-bold text-foreground">{pr.estimatedOneRM}kg</span>
                </div>
                <p className="text-xs text-muted-foreground">est. 1RM</p>
                {pr.improvement && pr.improvement > 0 && (
                  <div className="flex items-center gap-1 text-success text-xs mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +{pr.improvement}kg
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {records.length > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            +{records.length - 5} more records
          </p>
        )}
      </AccentCardContent>
    </AccentCard>
  );
}
