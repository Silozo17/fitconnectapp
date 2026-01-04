import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
import { usePersonalRecords } from "@/hooks/usePersonalRecords";
import { Trophy, TrendingUp, Dumbbell, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isThisWeek } from "date-fns";

interface PersonalRecordsWidgetProps {
  className?: string;
}

export function PersonalRecordsWidget({ className }: PersonalRecordsWidgetProps) {
  const { records, recentPRs, isLoading, hasRecords } = usePersonalRecords();

  if (isLoading) {
    return (
      <Card variant="elevated" className={cn("rounded-3xl", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <ShimmerSkeleton className="h-10 w-10 rounded-2xl" />
            <ShimmerSkeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <ShimmerSkeleton className="h-4 w-28" />
              <ShimmerSkeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!hasRecords) {
    return null;
  }

  const topRecords = records.slice(0, 5);

  return (
    <Card variant="elevated" className={cn("rounded-3xl overflow-hidden", className)}>
      {/* Gradient accent */}
      <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            Personal Records
          </CardTitle>
          {recentPRs.length > 0 && (
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
              <Sparkles className="w-3 h-3 mr-1" />
              {recentPRs.length} new PR{recentPRs.length > 1 ? 's' : ''}!
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
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
                  index === 0 ? "bg-amber-500/20 text-amber-500" :
                  index === 1 ? "bg-zinc-400/20 text-zinc-400" :
                  index === 2 ? "bg-orange-600/20 text-orange-600" :
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
      </CardContent>
    </Card>
  );
}
