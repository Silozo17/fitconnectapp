import { Target, AlertCircle, CheckCircle2, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useOffTrackGoals } from "@/hooks/useGoalAdherence";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export function GoalAdherenceWidget() {
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
        <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6 text-success" />
        </div>
        <p className="text-sm font-medium text-foreground">All goals on track</p>
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
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-warning" />
            </div>
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
}
