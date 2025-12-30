import { TrendingUp, Package, ChevronRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUpsellOpportunities } from "@/hooks/useUpsellOpportunities";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export function UpsellInsightsWidget() {
  const { data: opportunities = [], isLoading } = useUpsellOpportunities();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Package className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No opportunities</p>
        <p className="text-xs text-muted-foreground mt-1">
          Check back as clients progress
        </p>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "renewal":
        return "🔄";
      case "upgrade":
        return "⬆️";
      case "addon":
        return "➕";
      case "new_package":
        return "📦";
      default:
        return "💡";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "renewal":
        return "Renewal";
      case "upgrade":
        return "Upgrade";
      case "addon":
        return "Add-on";
      case "new_package":
        return "New Package";
      default:
        return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "normal":
        return "bg-primary/20 text-primary border-primary/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-3">
      {opportunities.slice(0, 4).map((opportunity, index) => (
        <Link
          key={`${opportunity.clientId}-${opportunity.suggestionType}-${index}`}
          to={`/dashboard/coach/clients/${opportunity.clientId}`}
          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
              {getTypeIcon(opportunity.suggestionType)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {opportunity.clientName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {opportunity.reason}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={getPriorityColor(opportunity.priority)}>
              {getTypeLabel(opportunity.suggestionType)}
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      ))}

      {opportunities.length > 4 && (
        <p className="text-xs text-muted-foreground text-center">
          +{opportunities.length - 4} more opportunities
        </p>
      )}
    </div>
  );
}
