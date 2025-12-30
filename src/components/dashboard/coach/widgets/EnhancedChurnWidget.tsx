import { AlertTriangle, TrendingDown, TrendingUp, Minus, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnhancedChurnPrediction, Trajectory, EnhancedChurnData } from "@/hooks/useEnhancedChurnPrediction";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const trajectoryConfig: Record<Trajectory, { icon: typeof TrendingUp; color: string; label: string }> = {
  improving: { icon: TrendingUp, color: "text-success", label: "Improving" },
  stable: { icon: Minus, color: "text-muted-foreground", label: "Stable" },
  declining: { icon: TrendingDown, color: "text-warning", label: "Declining" },
  critical: { icon: AlertTriangle, color: "text-destructive", label: "Critical" },
};

const urgencyConfig = {
  immediate: { color: "bg-destructive text-destructive-foreground", label: "Act Now" },
  soon: { color: "bg-warning text-warning-foreground", label: "This Week" },
  monitor: { color: "bg-muted text-muted-foreground", label: "Monitor" },
};

function ChurnClientItem({ client }: { client: EnhancedChurnData }) {
  const navigate = useNavigate();
  const trajectory = trajectoryConfig[client.trajectory];
  const urgency = urgencyConfig[client.urgency];
  const TrajectoryIcon = trajectory.icon;

  return (
    <div
      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => navigate(`/dashboard/coach/clients/${client.clientId}`)}
    >
      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
        <AvatarImage src={client.avatarUrl || undefined} alt={client.clientName} />
        <AvatarFallback className="text-xs">
          {client.clientName.split(" ").map((n) => n[0]).join("").toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="font-medium text-xs sm:text-sm truncate">{client.clientName}</span>
          <Badge className={cn("text-[10px] px-1.5 py-0 h-4 flex-shrink-0", urgency.color)}>
            <span className="hidden sm:inline">{urgency.label}</span>
            <span className="sm:hidden">{client.urgency === "immediate" ? "!" : "~"}</span>
          </Badge>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <TrajectoryIcon className={cn("w-3 h-3", trajectory.color)} />
            <span className={cn("text-[10px] sm:text-xs", trajectory.color)}>{trajectory.label}</span>
          </div>
          {client.daysUntilChurn && (
            <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-muted-foreground">
              <Clock className="w-3 h-3 hidden sm:inline" />
              <span>{client.daysUntilChurn}d</span>
            </div>
          )}
        </div>
      </div>

      {/* Mini sparkline representation - hidden on mobile */}
      <div className="hidden sm:flex items-end gap-0.5 h-6">
        {client.weeklyScores.slice(-4).map((score, i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 rounded-sm",
              score >= 70 ? "bg-success" : score >= 40 ? "bg-warning" : "bg-destructive"
            )}
            style={{ height: `${Math.max(20, score)}%` }}
          />
        ))}
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </div>
  );
}

export function EnhancedChurnWidget() {
  const { data: clients, isLoading } = useEnhancedChurnPrediction();
  const navigate = useNavigate();

  // Show only clients with immediate or soon urgency
  const urgentClients = clients?.filter((c) => c.urgency !== "monitor").slice(0, 5) || [];
  const immediateCount = clients?.filter((c) => c.urgency === "immediate").length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Churn Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (urgentClients.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            Churn Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm font-medium text-success">No immediate churn risks</p>
            <p className="text-xs text-muted-foreground mt-1">
              All clients are on a positive trajectory
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Churn Risk Analysis
          </CardTitle>
          {immediateCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {immediateCount} urgent
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {urgentClients.map((client) => (
          <ChurnClientItem key={client.clientId} client={client} />
        ))}

        {clients && clients.filter((c) => c.urgency !== "monitor").length > 5 && (
          <button
            onClick={() => navigate("/dashboard/clients")}
            className="w-full text-sm text-primary hover:underline mt-2 text-center"
          >
            View all at-risk clients
          </button>
        )}
      </CardContent>
    </Card>
  );
}
