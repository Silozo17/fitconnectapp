import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footprints, Heart, Moon, Flame, Activity, Clock, Watch, RefreshCw } from "lucide-react";
import { useHealthData, HealthDataType } from "@/hooks/useHealthData";
import { useWearables } from "@/hooks/useWearables";
import { useSyncAllWearables } from "@/hooks/useSyncAllWearables";
import { useWearableAutoSync } from "@/hooks/useWearableAutoSync";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const metrics: {
  type: HealthDataType;
  labelKey: string;
  icon: React.ReactNode;
  color: string;
  format: (value: number) => string;
}[] = [
  {
    type: "steps",
    labelKey: "Steps",
    icon: <Footprints className="w-5 h-5" />,
    color: "text-blue-400",
    format: (v) => v.toLocaleString(),
  },
  {
    type: "heart_rate",
    labelKey: "Avg Heart Rate",
    icon: <Heart className="w-5 h-5" />,
    color: "text-red-400",
    format: (v) => `${Math.round(v)} bpm`,
  },
  {
    type: "sleep",
    labelKey: "Sleep",
    icon: <Moon className="w-5 h-5" />,
    color: "text-purple-400",
    format: (v) => `${(v / 60).toFixed(1)} hrs`,
  },
  {
    type: "calories",
    labelKey: "Calories Burned",
    icon: <Flame className="w-5 h-5" />,
    color: "text-orange-400",
    format: (v) => v.toLocaleString(),
  },
  {
    type: "active_minutes",
    labelKey: "Active Minutes",
    icon: <Clock className="w-5 h-5" />,
    color: "text-green-400",
    format: (v) => `${Math.round(v)} min`,
  },
  {
    type: "distance",
    labelKey: "Distance",
    icon: <Activity className="w-5 h-5" />,
    color: "text-cyan-400",
    format: (v) => `${(v / 1000).toFixed(1)} km`,
  },
];

interface HealthDataWidgetProps {
  className?: string;
  compact?: boolean;
}

const HealthDataWidget = ({ className, compact = false }: HealthDataWidgetProps) => {
  const { t } = useTranslation('settings');
  const { getTodayValue, getTodaySource, isLoading, data, refetch } = useHealthData();
  const { connections, isLoading: wearablesLoading, error: wearablesError } = useWearables();
  const { syncAll, isSyncing, lastSyncedAt } = useSyncAllWearables();
  
  // Enable auto-sync every 15 minutes
  useWearableAutoSync();

  const hasConnectedDevice = connections && connections.length > 0;
  const hasData = data && data.length > 0;

  const handleSync = async () => {
    try {
      await syncAll();
      // Explicitly refetch health data after sync completes
      console.log('[HealthDataWidget] Sync complete, triggering explicit refetch...');
      await refetch();
      console.log('[HealthDataWidget] Refetch complete');
    } catch (error) {
      // Error handled in hook
    }
  };

  // Get a formatted source name for display
  const getSourceDisplayName = (source: string | null): string => {
    if (!source) return '';
    const names: Record<string, string> = {
      'apple_health': 'Apple Health',
      'health_connect': 'Health Connect',
      'fitbit': 'Fitbit',
      'garmin': 'Garmin',
      'manual': 'Manual',
    };
    return names[source] || source;
  };

  // Determine the primary data source for display
  const primarySource = (() => {
    for (const metric of metrics) {
      const source = getTodaySource(metric.type);
      if (source) return source;
    }
    return null;
  })();

  if (isLoading && !wearablesError && wearablesLoading) {
    return (
      <Card className={cn("bg-card/50 border-border/50", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            {t('integrations.todaysHealth')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-14 sm:h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (wearablesError || !hasConnectedDevice) {
    return (
      <Card className={cn("bg-card/50 border-border/50", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            {t('integrations.todaysHealth')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6 gap-4">
          <div className="p-3 rounded-full bg-muted/50">
            <Watch className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {t('integrations.noDeviceConnected')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('integrations.connectWearableHint')}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/client/integrations">
              {t('integrations.connectDevice')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Always show all 6 metrics for consistency
  const displayMetrics = metrics;

  return (
    <Card className={cn("bg-card/50 border-border/50", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              {t('integrations.todaysHealth')}
            </CardTitle>
            {primarySource && (
              <span className="text-xs text-muted-foreground mt-0.5">
                via {getSourceDisplayName(primarySource)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {lastSyncedAt && (
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(lastSyncedAt, { addSuffix: true })}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSync}
              disabled={isSyncing}
              className="h-8 w-8"
              title="Sync wearable data"
            >
              <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "grid gap-2 sm:gap-3",
          compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3"
        )}>
          {displayMetrics.map((metric) => {
            const value = getTodayValue(metric.type);
            return (
              <div
                key={metric.type}
                className="bg-muted/30 rounded-lg p-2 sm:p-3 flex items-center gap-2 sm:gap-3 min-h-[56px]"
              >
                <div className={cn("p-1.5 sm:p-2 rounded-lg bg-muted/50 shrink-0", metric.color)}>
                  {metric.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{metric.labelKey}</p>
                  <p className="font-semibold text-sm sm:text-base truncate">{metric.format(value)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthDataWidget;
