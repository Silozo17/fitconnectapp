import { Button } from "@/components/ui/button";
import { Activity, RefreshCw, Plus, History } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { HealthRadarChart, calculateOverallScore } from "./HealthRadarChart";

interface HealthRadarCardProps {
  steps: number;
  calories: number;
  activeMinutes: number;
  heartRate: number;
  sleep: number;
  distance: number;
  lastSyncedAt: Date | null;
  isSyncStale: boolean;
  isSyncing: boolean;
  primarySource: string | null;
  onSync: () => void;
  onManualEntry: () => void;
  className?: string;
}

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

export const HealthRadarCard = ({
  steps,
  calories,
  activeMinutes,
  heartRate,
  sleep,
  distance,
  lastSyncedAt,
  isSyncStale,
  isSyncing,
  primarySource,
  onSync,
  onManualEntry,
  className,
}: HealthRadarCardProps) => {
  const overallScore = calculateOverallScore({ 
    steps, calories, activeMinutes, heartRate, sleep, distance 
  });

  return (
    <div
      className={cn(
        "relative bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-5 border border-border/50 overflow-hidden",
        className
      )}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-accent/40 to-transparent" />

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-1 mb-4">
        {lastSyncedAt && (
          <span className={cn(
            "text-xs mr-2",
            isSyncStale ? "text-amber-500" : "text-muted-foreground"
          )}>
            {formatDistanceToNow(lastSyncedAt, { addSuffix: true })}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onManualEntry}
          className="h-8 w-8"
          title="Add health data manually"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-8 w-8"
          title="View health history"
        >
          <Link to="/dashboard/client/health-history">
            <History className="w-4 h-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSync}
          disabled={isSyncing}
          className="h-8 w-8"
          title="Sync wearable data"
        >
          <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
        </Button>
      </div>

      {/* Radar Chart */}
      <HealthRadarChart
        steps={steps}
        calories={calories}
        activeMinutes={activeMinutes}
        heartRate={heartRate}
        sleep={sleep}
        distance={distance}
      />

      {/* Quick stats row */}
      <div className="flex items-center justify-center gap-6 mt-2 text-sm">
        <div className="text-center">
          <span className="text-foreground font-semibold">{steps.toLocaleString()}</span>
          <span className="text-muted-foreground ml-1">steps</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="text-center">
          <span className="text-foreground font-semibold">{calories}</span>
          <span className="text-muted-foreground ml-1">kcal</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="text-center">
          <span className="text-foreground font-semibold">{activeMinutes}</span>
          <span className="text-muted-foreground ml-1">min</span>
        </div>
      </div>
    </div>
  );
};
