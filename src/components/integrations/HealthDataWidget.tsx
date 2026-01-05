import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Footprints, 
  Flame, 
  Timer, 
  Activity, 
  Watch, 
  RefreshCw, 
  Smartphone,
  Bike,
  Waves,
  TrendingUp
} from "lucide-react";
import { useHealthData, HealthDataType } from "@/hooks/useHealthData";
import { useWearables } from "@/hooks/useWearables";
import { useSyncAllWearables } from "@/hooks/useSyncAllWearables";
import { useWearableAutoSync } from "@/hooks/useWearableAutoSync";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import { isDespia } from "@/lib/despia";

interface HealthDataWidgetProps {
  className?: string;
  compact?: boolean;
}

const HealthDataWidget = ({ className, compact = false }: HealthDataWidgetProps) => {
  const { t } = useTranslation('settings');
  const { getTodayValue, getTodaySource, isLoading, data, refetch } = useHealthData();
  const { connections, isLoading: wearablesLoading, error: wearablesError } = useWearables();
  const { syncAll, isSyncing, appleHealthStatus, lastSyncedAt } = useSyncAllWearables();
  
  // Enable auto-sync every 15 minutes (excludes Apple Health due to Despia limitations)
  useWearableAutoSync();

  const hasConnectedDevice = connections && connections.length > 0;
  const hasData = data && data.length > 0;

  // Check if Apple Health is connected but has no data today
  const hasAppleHealth = connections?.some(c => c.provider === 'apple_health');
  const hasAppleHealthData = data?.some(d => d.source === 'apple_health');
  const appleHealthConnectedNoData = hasAppleHealth && !hasAppleHealthData && !isSyncing;
  
  // Check if we're on iOS native (where Apple Health sync is possible)
  const isDespiaEnv = isDespia();
  const isIOSNative = isDespiaEnv && /iPad|iPhone|iPod/i.test(navigator.userAgent);
  const needsIOSSync = hasAppleHealth && !isIOSNative;
  
  // Check if sync is stale (more than 1 hour old)
  const isSyncStale = lastSyncedAt ? differenceInHours(new Date(), lastSyncedAt) >= 1 : true;

  // Get values
  const steps = getTodayValue('steps');
  const calories = getTodayValue('calories');
  const activeMinutes = getTodayValue('active_minutes');
  const distanceWalking = getTodayValue('distance_walking');
  const distanceCycling = getTodayValue('distance_cycling');
  const distanceSwimming = getTodayValue('distance_swimming');
  const totalDistance = distanceWalking + distanceCycling + distanceSwimming;

  // Format helpers
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hrs = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    }
    return `${Math.round(minutes)} min`;
  };

  // Get distance percentage for progress bars
  const getDistancePercentage = (distance: number) => {
    if (totalDistance === 0) return 0;
    return Math.round((distance / totalDistance) * 100);
  };

  const handleSync = async () => {
    try {
      await syncAll();
      await refetch();
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
  const primarySource = getTodaySource('steps') || getTodaySource('calories');

  if (isLoading && !wearablesError && wearablesLoading) {
    return (
      <Card variant="glass" className={cn(className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            {t('integrations.todaysHealth')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="h-32 bg-muted/50 rounded-xl animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (wearablesError || !hasConnectedDevice) {
    return (
      <Card variant="glass" className={cn(className)}>
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

  return (
    <Card variant="glass" className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Today's Activity
            </CardTitle>
            {primarySource && (
              <span className="text-xs text-muted-foreground mt-0.5">
                via {getSourceDisplayName(primarySource)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {lastSyncedAt && (
              <span className={cn(
                "text-xs",
                isSyncStale ? "text-amber-500" : "text-muted-foreground"
              )}>
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
      <CardContent className="space-y-4">
        {/* Alerts */}
        {needsIOSSync && isSyncStale && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Smartphone className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Open the app on your iPhone to sync Apple Health data
            </p>
          </div>
        )}
        
        {appleHealthConnectedNoData && isIOSNative && appleHealthStatus !== 'syncing' && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
            <Smartphone className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              Apple Health connected — tap sync to pull today's data
            </p>
          </div>
        )}
        
        {hasConnectedDevice && !hasData && !isSyncing && !isLoading && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <RefreshCw className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-600 dark:text-amber-400">
              No data yet — tap sync to pull from your device
            </p>
          </div>
        )}

        {/* Hero Stats - Steps, Calories, Exercise Time */}
        <div className="grid grid-cols-3 gap-3">
          {/* Steps */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-3 border border-blue-500/20">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20">
                <Footprints className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{steps.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">steps</p>
          </div>

          {/* Active Calories */}
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-xl p-3 border border-orange-500/20">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1.5 rounded-lg bg-orange-500/20">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{calories.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">kcal</p>
          </div>

          {/* Exercise Time */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-3 border border-green-500/20">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1.5 rounded-lg bg-green-500/20">
                <Timer className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatTime(activeMinutes)}</p>
            <p className="text-xs text-muted-foreground">exercise</p>
          </div>
        </div>

        {/* Distance Breakdown */}
        <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Distance</span>
            </div>
            <span className="text-lg font-bold">{formatDistance(totalDistance)}</span>
          </div>
          
          <div className="space-y-3">
            {/* Walking/Running */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Footprints className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-muted-foreground">Walking</span>
                </div>
                <span className="font-medium">{formatDistance(distanceWalking)}</span>
              </div>
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${getDistancePercentage(distanceWalking)}%` }}
                />
              </div>
            </div>

            {/* Cycling */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Bike className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-muted-foreground">Cycling</span>
                </div>
                <span className="font-medium">{formatDistance(distanceCycling)}</span>
              </div>
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${getDistancePercentage(distanceCycling)}%` }}
                />
              </div>
            </div>

            {/* Swimming */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Waves className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-muted-foreground">Swimming</span>
                </div>
                <span className="font-medium">{formatDistance(distanceSwimming)}</span>
              </div>
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${getDistancePercentage(distanceSwimming)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthDataWidget;
