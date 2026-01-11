import { memo } from "react";
import { FileText, Clock, ChevronRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePendingSummaries } from "@/hooks/useSummaryGeneration";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { IconBadge } from "@/components/shared/IconBadge";

export const PendingSummariesWidget = memo(function PendingSummariesWidget() {
  const { data: pendingSummaries = [], isLoading } = usePendingSummaries();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (pendingSummaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <IconBadge icon={FileText} color="muted" size="lg" />
        <p className="text-sm font-medium text-foreground mt-3">No pending summaries</p>
        <p className="text-xs text-muted-foreground mt-1">
          Generate summaries from client profiles
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingSummaries.slice(0, 4).map((summary) => (
        <Link
          key={summary.id}
          to={`/dashboard/coach/clients/${summary.clientId}`}
          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <div className="flex items-center gap-3">
            <IconBadge icon={Sparkles} color="primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {summary.clientName}
              </p>
              <p className="text-xs text-muted-foreground">
                {summary.summaryType} summary • {formatDistanceToNow(summary.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className="bg-warning/20 text-warning border-warning/30">
              Pending Review
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      ))}

      {pendingSummaries.length > 4 && (
        <p className="text-xs text-muted-foreground text-center">
          +{pendingSummaries.length - 4} more pending
        </p>
      )}
    </div>
  );
});
