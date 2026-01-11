import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentSection } from "@/components/shared/ContentSection";

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
    color: "text-green-400",
    bg: "bg-green-500/20",
    badge: "default" as const,
    label: "Healthy",
  },
  degraded: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
    badge: "secondary" as const,
    label: "Degraded",
  },
  down: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/20",
    badge: "destructive" as const,
    label: "Down",
  },
};

export const IntegrationHealthWidget = memo(function IntegrationHealthWidget({ health }: IntegrationHealthWidgetProps) {
  const healthyCount = health.filter(h => h.status === "healthy").length;
  const totalCount = health.length;

  return (
    <ContentSection colorTheme="cyan" padding="none">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <h3 className="font-semibold text-foreground text-base">Integration Health</h3>
        </div>
        <Badge variant={healthyCount === totalCount ? "default" : "secondary"} className="text-xs">
          {healthyCount}/{totalCount} Online
        </Badge>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-4">
        <div className="space-y-2">
          {health.map((integration) => {
            const config = statusConfig[integration.status];
            const StatusIcon = config.icon;

            return (
              <div 
                key={integration.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-background/50 hover:bg-background/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bg)}>
                    <StatusIcon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <span className="font-medium text-sm text-foreground">{integration.name}</span>
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
      </div>
    </ContentSection>
  );
});
