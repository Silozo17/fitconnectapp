import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footprints, Heart, Moon, Flame, Activity, Clock, Watch, RefreshCw } from "lucide-react";
import { useHealthData, HealthDataType } from "@/hooks/useHealthData";
import { useWearables } from "@/hooks/useWearables";
import { useSyncAllWearables } from "@/hooks/useSyncAllWearables";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const metrics: {
  type: HealthDataType;
  label: string;
  icon: React.ReactNode;
  color: string;
  format: (value: number) => string;
}[] = [
  {
    type: "steps",
    label: "Steps",
    icon: <Footprints className="w-5 h-5" />,
    color: "text-blue-400",
    format: (v) => v.toLocaleString(),
  },
  {
    type: "heart_rate",
    label: "Avg Heart Rate",
    icon: <Heart className="w-5 h-5" />,
    color: "text-red-400",
    format: (v) => `${Math.round(v)} bpm`,
  },
  {
    type: "sleep",
    label: "Sleep",
    icon: <Moon className="w-5 h-5" />,
    color: "text-purple-400",
    format: (v) => `${(v / 60).toFixed(1)} hrs`,
  },
  {
    type: "calories",
    label: "Calories Burned",
    icon: <Flame className="w-5 h-5" />,
    color: "text-orange-400",
    format: (v) => v.toLocaleString(),
  },
  {
    type: "active_minutes",
    label: "Active Minutes",
    icon: <Clock className="w-5 h-5" />,
    color: "text-green-400",
    format: (v) => `${Math.round(v)} min`,
  },
  {
    type: "distance",
    label: "Distance",
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
  const { getTodayValue, isLoading, data } = useHealthData();
  const { connections, isLoading: wearablesLoading, error: wearablesError } = useWearables();
  const { syncAll, isSyncing, lastSyncedAt } = useSyncAllWearables();

  const hasConnectedDevice = connections && connections.length > 0;
  const hasData = data && data.length > 0;

  const handleSync = async () => {
    try {
      await syncAll();
    } catch (error) {
      // Error handled in hook
    }
  };

  if (isLoading && !wearablesError && wearablesLoading) {
    return (
      <Card className={cn("bg-card/50 border-border/50", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Today's Health
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
            Today's Health
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6 gap-4">
          <div className="p-3 rounded-full bg-muted/50">
            <Watch className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              No device connected
            </p>
            <p className="text-xs text-muted-foreground">
              Connect a wearable to track your health metrics
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/client/integrations">
              Connect a Device
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const displayMetrics = compact ? metrics.slice(0, 4) : metrics;

  return (
    <Card className={cn("bg-card/50 border-border/50", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Today's Health
          </CardTitle>
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
          compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
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
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{metric.label}</p>
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
