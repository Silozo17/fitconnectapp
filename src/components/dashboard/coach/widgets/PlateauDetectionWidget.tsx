import { TrendingDown, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePlateauDetection } from "@/hooks/usePlateauDetection";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export function PlateauDetectionWidget() {
  const { data: plateaus = [], isLoading } = usePlateauDetection();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const activePlateaus = plateaus.filter((p) => p.isActive);

  if (activePlateaus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6 text-success" />
        </div>
        <p className="text-sm font-medium text-foreground">No plateaus detected</p>
        <p className="text-xs text-muted-foreground mt-1">
          All clients are making progress
        </p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "severe":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "moderate":
        return "bg-warning/20 text-warning border-warning/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getMetricLabel = (type: string) => {
    switch (type) {
      case "weight":
        return "Weight";
      case "strength":
        return "Strength";
      case "cardio":
        return "Cardio";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-3">
      {activePlateaus.slice(0, 5).map((plateau) => (
        <Link
          key={`${plateau.clientId}-${plateau.metricType}`}
          to={`/dashboard/coach/clients/${plateau.clientId}`}
          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {plateau.clientName}
              </p>
              <p className="text-xs text-muted-foreground">
                {getMetricLabel(plateau.metricType)} plateau •{" "}
                {plateau.durationWeeks} weeks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getSeverityColor(plateau.severity)}>
              {plateau.severity}
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      ))}

      {activePlateaus.length > 5 && (
        <p className="text-xs text-muted-foreground text-center">
          +{activePlateaus.length - 5} more plateaus
        </p>
      )}
    </div>
  );
}
