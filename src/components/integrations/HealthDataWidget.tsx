import { useState, useMemo, useCallback } from "react";
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
  Heart,
  Moon,
  TrendingUp
} from "lucide-react";
import { useHealthData, HealthDataType } from "@/hooks/useHealthData";
import { useWearables } from "@/hooks/useWearables";
import { useSyncAllWearables } from "@/hooks/useSyncAllWearables";
import { useWearableAutoSync } from "@/hooks/useWearableAutoSync";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { differenceInHours, format, subDays } from "date-fns";
import { isDespia } from "@/lib/despia";
import ManualHealthDataModal from "./ManualHealthDataModal";

// New components - no cards inside cards!
import { HealthRadarCard } from "@/components/health/HealthRadarCard";
import { HealthMetricCard } from "@/components/health/HealthMetricCard";

interface HealthDataWidgetProps {
  className?: string;
  compact?: boolean;
}

const HealthDataWidget = ({ className, compact = false }: HealthDataWidgetProps) => {
  const { t } = useTranslation('settings');
  const { getTodayValue, getTodaySource, isLoading, data, refetch, getDataByType } = useHealthData();
  const { connections, isLoading: wearablesLoading, error: wearablesError } = useWearables();
  const { syncAll, isSyncing, appleHealthStatus, lastSyncedAt } = useSyncAllWearables();
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // Enable auto-sync every 15 minutes
  useWearableAutoSync();

  const hasConnectedDevice = connections && connections.length > 0;
  const hasData = data && data.length > 0;

  // Check if Apple Health is connected but has no data today
  const hasAppleHealth = connections?.some(c => c.provider === 'apple_health');
  const hasAppleHealthData = data?.some(d => d.source === 'apple_health');
  const appleHealthConnectedNoData = hasAppleHealth && !hasAppleHealthData && !isSyncing;
  
  // Check if we're on iOS native
  const isDespiaEnv = isDespia();
  const isIOSNative = isDespiaEnv && /iPad|iPhone|iPod/i.test(navigator.userAgent);
  const needsIOSSync = hasAppleHealth && !isIOSNative;
  
  // Check if sync is stale (more than 1 hour old)
  const isSyncStale = lastSyncedAt ? differenceInHours(new Date(), lastSyncedAt) >= 1 : true;

  // Get today's values
  const steps = getTodayValue('steps');
  const calories = getTodayValue('calories');
  const activeMinutes = getTodayValue('active_minutes');
  const heartRate = getTodayValue('heart_rate');
  const sleep = getTodayValue('sleep');
  const distanceWalking = getTodayValue('distance_walking');
  const distanceCycling = getTodayValue('distance_cycling');
  const distanceSwimming = getTodayValue('distance_swimming');
  const totalDistance = distanceWalking + distanceCycling + distanceSwimming;

  // Get weekly data for mini charts
  const getWeeklyData = useCallback((type: HealthDataType): { day: string; value: number }[] => {
    const typeData = getDataByType(type);
    
    // Create last 7 days array
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, "yyyy-MM-dd");
    });

    return last7Days.map(dateStr => {
      const entry = typeData.find(d => d.recorded_at.split('T')[0] === dateStr);
      return {
        day: format(new Date(dateStr), "EEE"),
        value: entry?.value ?? 0,
      };
    });
  }, [getDataByType]);

  // Calculate weekly trends
  const calculateTrend = useCallback((type: HealthDataType): number | undefined => {
    const weeklyData = getWeeklyData(type);
    if (weeklyData.length < 7) return undefined;

    // Compare last 3 days avg vs previous 4 days avg
    const recentAvg = weeklyData.slice(-3).reduce((sum, d) => sum + d.value, 0) / 3;
    const previousAvg = weeklyData.slice(0, 4).reduce((sum, d) => sum + d.value, 0) / 4;

    if (previousAvg === 0) return undefined;
    return Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
  }, [getWeeklyData]);

  // Format helpers
  const formatSleep = (minutes: number) => {
    if (minutes === 0) return "—";
    const hours = minutes / 60;
    return hours.toFixed(1);
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return (meters / 1000).toFixed(1);
    }
    return Math.round(meters).toString();
  };

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hrs = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    }
    return Math.round(minutes).toString();
  };

  const handleSync = async () => {
    try {
      await syncAll();
      await refetch();
    } catch (error) {
      // Error handled in hook
    }
  };

  const primarySource = getTodaySource('steps') || getTodaySource('calories');

  // Loading state
  if (isLoading && !wearablesError && wearablesLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="h-80 bg-muted/20 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 bg-muted/20 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // No device connected
  if (wearablesError || !hasConnectedDevice) {
    return (
      <Card variant="glass" className={cn("rounded-2xl", className)}>
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
    <div className={cn("space-y-3", className)}>
      {/* Alerts - NO outer card wrapper */}
      {needsIOSSync && isSyncStale && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Smartphone className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Open the app on your iPhone to sync Apple Health data
          </p>
        </div>
      )}
      
      {appleHealthConnectedNoData && isIOSNative && appleHealthStatus !== 'syncing' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/50">
          <Smartphone className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Apple Health connected — tap sync to pull today's data
          </p>
        </div>
      )}
      
      {hasConnectedDevice && !hasData && !isSyncing && !isLoading && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <RefreshCw className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            No data yet — tap sync to pull from your device
          </p>
        </div>
      )}

      {/* Radar Chart Card - Full width, STANDALONE */}
      <HealthRadarCard
        steps={steps}
        calories={calories}
        activeMinutes={activeMinutes}
        heartRate={heartRate}
        sleep={sleep}
        distance={totalDistance}
        lastSyncedAt={lastSyncedAt}
        isSyncStale={isSyncStale}
        isSyncing={isSyncing}
        primarySource={primarySource}
        onSync={handleSync}
        onManualEntry={() => setShowManualEntry(true)}
      />

      {/* Metric Cards Grid - STANDALONE cards, not nested */}
      <div className="grid grid-cols-2 gap-3">
        <HealthMetricCard
          icon={Footprints}
          label="Steps"
          value={steps.toLocaleString()}
          unit="steps"
          color="blue"
          weeklyData={getWeeklyData('steps')}
          showTrend={false}
        />
        <HealthMetricCard
          icon={Flame}
          label="Calories"
          value={calories.toLocaleString()}
          unit="kcal"
          color="orange"
          weeklyData={getWeeklyData('calories')}
          showTrend={false}
        />
        <HealthMetricCard
          icon={Timer}
          label="Exercise"
          value={formatTime(activeMinutes)}
          unit={activeMinutes >= 60 ? "" : "min"}
          color="green"
          weeklyData={getWeeklyData('active_minutes')}
          trend={calculateTrend('active_minutes')}
        />
        <HealthMetricCard
          icon={Heart}
          label="Heart Rate"
          value={heartRate > 0 ? heartRate : "—"}
          unit="bpm"
          color="red"
          weeklyData={getWeeklyData('heart_rate')}
        />
        <HealthMetricCard
          icon={Moon}
          label="Sleep"
          value={formatSleep(sleep)}
          unit="hrs"
          color="purple"
          weeklyData={getWeeklyData('sleep')}
          trend={calculateTrend('sleep')}
        />
        <HealthMetricCard
          icon={TrendingUp}
          label="Distance"
          value={formatDistance(totalDistance)}
          unit={totalDistance >= 1000 ? "km" : "m"}
          color="cyan"
          weeklyData={getWeeklyData('distance_walking')}
        />
      </div>
      
      {/* Manual Entry Modal */}
      <ManualHealthDataModal 
        open={showManualEntry} 
        onOpenChange={setShowManualEntry} 
      />
    </div>
  );
};

export default HealthDataWidget;
