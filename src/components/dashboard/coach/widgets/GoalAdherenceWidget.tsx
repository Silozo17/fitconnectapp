import { memo } from "react";
import { CheckCircle2, ChevronRight, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOffTrackGoals } from "@/hooks/useGoalAdherence";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { IconBadge } from "@/components/shared/IconBadge";

export const GoalAdherenceWidget = memo(function GoalAdherenceWidget() {
  const { data: offTrackGoals = [], isLoading } = useOffTrackGoals();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (offTrackGoals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <IconBadge icon={CheckCircle2} color="green" size="lg" />
        <p className="text-sm font-medium text-foreground mt-3">All goals on track</p>
        <p className="text-xs text-muted-foreground mt-1">
          Clients are progressing well
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {offTrackGoals.slice(0, 4).map((item) => (
        <Link
          key={item.goal.id}
          to={`/dashboard/coach/clients/${item.goal.clientId}`}
          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <div className="flex items-center gap-3">
            <IconBadge icon={TrendingDown} color="orange" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {item.clientName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {item.goal.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className="bg-warning/20 text-warning border-warning/30">
              {item.daysBehand}d behind
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      ))}

      {offTrackGoals.length > 4 && (
        <p className="text-xs text-muted-foreground text-center">
          +{offTrackGoals.length - 4} more off-track goals
        </p>
      )}
    </div>
  );
});
