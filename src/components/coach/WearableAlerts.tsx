import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Alert {
  client_id: string;
  type: string;
  message: string;
}

interface Props {
  alerts: Alert[];
  className?: string;
}

export function WearableAlerts({ alerts, className }: Props) {
  const { t } = useTranslation("coach");

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "low_activity": return TrendingDown;
      case "poor_sleep": return Moon;
      default: return AlertTriangle;
    }
  };

  return (
    <Card variant="glass" className={cn("glass-card border-warning/30", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-warning">
          <AlertTriangle className="w-5 h-5" />
          {t("wearableDashboard.alerts")} ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.slice(0, 5).map((alert, i) => {
            const Icon = getAlertIcon(alert.type);
            return (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-warning/5">
                <Icon className="w-4 h-4 text-warning" />
                <span className="text-sm">{alert.message}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
