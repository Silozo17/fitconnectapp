import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntegrationHealth {
  name: string;
  status: "healthy" | "degraded" | "down";
  latency: string;
}

interface IntegrationHealthWidgetProps {
  health: IntegrationHealth[];
}

const statusConfig = {
  healthy: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-500/10",
    badge: "default" as const,
    label: "Healthy",
  },
  degraded: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    badge: "secondary" as const,
    label: "Degraded",
  },
  down: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    badge: "destructive" as const,
    label: "Down",
  },
};

export function IntegrationHealthWidget({ health }: IntegrationHealthWidgetProps) {
  const healthyCount = health.filter(h => h.status === "healthy").length;
  const totalCount = health.length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            Integration Health
          </span>
          <Badge variant={healthyCount === totalCount ? "default" : "secondary"}>
            {healthyCount}/{totalCount} Online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {health.map((integration) => {
            const config = statusConfig[integration.status];
            const StatusIcon = config.icon;

            return (
              <div 
                key={integration.name}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bg)}>
                    <StatusIcon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <span className="font-medium text-sm">{integration.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{integration.latency}</span>
                  <Badge variant={config.badge} className="text-xs">
                    {config.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
