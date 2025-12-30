import { AlertTriangle, TrendingDown, CheckCircle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientRiskDetection, RiskLevel, ClientRiskData } from "@/hooks/useClientRiskDetection";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const riskConfig: Record<RiskLevel, { icon: typeof AlertTriangle; color: string; bgColor: string; label: string }> = {
  high: {
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "High Risk",
  },
  medium: {
    icon: TrendingDown,
    color: "text-warning",
    bgColor: "bg-warning/10",
    label: "Medium Risk",
  },
  low: {
    icon: CheckCircle,
    color: "text-success",
    bgColor: "bg-success/10",
    label: "On Track",
  },
};

function ClientRiskItem({ client }: { client: ClientRiskData }) {
  const navigate = useNavigate();
  const config = riskConfig[client.riskLevel];
  const Icon = config.icon;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => navigate(`/dashboard/coach/clients/${client.clientId}`)}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={client.avatarUrl || undefined} alt={client.clientName} />
        <AvatarFallback className="text-xs">
          {client.clientName.split(" ").map((n) => n[0]).join("").toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{client.clientName}</span>
          <Badge variant="outline" className={cn("text-xs", config.color, config.bgColor)}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {client.riskFactors.slice(0, 2).join(" · ")}
        </p>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </div>
  );
}

export function ClientRiskWidget() {
  const { data: clients, isLoading } = useClientRiskDetection();
  const navigate = useNavigate();

  // Only show clients with medium or high risk
  const atRiskClients = clients?.filter((c) => c.riskLevel !== "low").slice(0, 5) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Client Attention Needed
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

  if (atRiskClients.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            All Clients On Track
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Great job! All your clients are actively engaged.
          </p>
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
            Client Attention Needed
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {atRiskClients.length} client{atRiskClients.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {atRiskClients.map((client) => (
          <ClientRiskItem key={client.clientId} client={client} />
        ))}

        {clients && clients.filter((c) => c.riskLevel !== "low").length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => navigate("/dashboard/clients")}
          >
            View all {clients.filter((c) => c.riskLevel !== "low").length} at-risk clients
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
