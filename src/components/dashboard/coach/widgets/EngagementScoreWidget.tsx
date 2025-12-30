import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientEngagementScore, ClientEngagementData } from "@/hooks/useClientEngagementScore";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const trendConfig = {
  up: { icon: TrendingUp, color: "text-success", label: "Improving" },
  down: { icon: TrendingDown, color: "text-destructive", label: "Declining" },
  stable: { icon: Minus, color: "text-muted-foreground", label: "Stable" },
};

function getScoreColor(score: number): string {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-destructive";
}

function getProgressColor(score: number): string {
  if (score >= 70) return "bg-success";
  if (score >= 40) return "bg-warning";
  return "bg-destructive";
}

function ClientEngagementItem({ client }: { client: ClientEngagementData }) {
  const navigate = useNavigate();
  const trend = trendConfig[client.trend];
  const TrendIcon = trend.icon;

  return (
    <div
      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => navigate(`/dashboard/clients/${client.clientId}`)}
    >
      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
        <AvatarImage src={client.avatarUrl || undefined} alt={client.clientName} />
        <AvatarFallback className="text-xs">
          {client.clientName.split(" ").map((n) => n[0]).join("").toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-xs sm:text-sm truncate">{client.clientName}</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={cn("text-xs sm:text-sm font-bold", getScoreColor(client.overallScore))}>
              {client.overallScore}
            </span>
            <TrendIcon className={cn("w-3 h-3", trend.color)} />
          </div>
        </div>
        <div className="mt-1.5">
          <Progress 
            value={client.overallScore} 
            className="h-1.5"
            indicatorClassName={getProgressColor(client.overallScore)}
          />
        </div>
      </div>
    </div>
  );
}

export function EngagementScoreWidget() {
  const { data: clients, isLoading } = useClientEngagementScore();
  const navigate = useNavigate();

  // Show clients needing attention (lowest scores first)
  const needsAttention = clients?.filter((c) => c.overallScore < 60).slice(0, 5) || [];
  const avgScore = clients && clients.length > 0
    ? Math.round(clients.reduce((sum, c) => sum + c.overallScore, 0) / clients.length)
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Client Engagement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-1.5 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Client Engagement</span>
            <span className="sm:hidden">Engagement</span>
          </CardTitle>
          <Badge variant="secondary" className={cn("text-xs", getScoreColor(avgScore))}>
            Avg: {avgScore}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {needsAttention.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            All clients are highly engaged!
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">
              Clients needing attention:
            </p>
            {needsAttention.map((client) => (
              <ClientEngagementItem key={client.clientId} client={client} />
            ))}
            {clients && clients.filter((c) => c.overallScore < 60).length > 5 && (
              <button
                onClick={() => navigate("/dashboard/clients")}
                className="w-full text-sm text-primary hover:underline mt-2"
              >
                View all {clients.filter((c) => c.overallScore < 60).length} clients
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
