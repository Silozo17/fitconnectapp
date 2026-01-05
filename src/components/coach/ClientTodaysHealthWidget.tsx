import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Footprints, 
  Flame, 
  Timer, 
  TrendingUp,
  Bike,
  Waves,
  ShieldOff,
  Loader2
} from "lucide-react";
import { useHealthData } from "@/hooks/useHealthData";
import { useCoachDataAccess } from "@/hooks/useCoachDataAccess";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface ClientTodaysHealthWidgetProps {
  clientId: string;
  coachId?: string;
  className?: string;
}

export const ClientTodaysHealthWidget = ({ 
  clientId, 
  coachId,
  className 
}: ClientTodaysHealthWidgetProps) => {
  const { t } = useTranslation("coach");
  
  // Check if coach has access to wearable data
  const { data: accessCheck, isLoading: checkingAccess } = useCoachDataAccess(
    clientId, 
    coachId, 
    "wearables"
  );
  
  // Fetch today's health data for this client
  const { getTodayValue, isLoading: loadingData } = useHealthData({ clientId });

  const isLoading = checkingAccess || loadingData;

  // Get today's values
  const steps = getTodayValue('steps');
  const calories = getTodayValue('calories');
  const activeMinutes = getTodayValue('active_minutes');
  const distanceWalking = getTodayValue('distance_walking');
  const distanceCycling = getTodayValue('distance_cycling');
  const distanceSwimming = getTodayValue('distance_swimming');
  const totalDistance = distanceWalking + distanceCycling + distanceSwimming;

  const hasAnyData = steps > 0 || calories > 0 || activeMinutes > 0 || totalDistance > 0;

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

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Check if access is denied
  if (accessCheck && !accessCheck.allowed) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            {t("clientDetail.todaysHealth.title", "Today's Health")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="p-3 rounded-full bg-muted/50 mb-3">
              <ShieldOff className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("clientDetail.todaysHealth.accessDenied", "Client has restricted access to health data")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAnyData) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            {t("clientDetail.todaysHealth.title", "Today's Health")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6 text-center">
            <Activity className="w-8 h-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {t("clientDetail.todaysHealth.noData", "No health data for today")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            {t("clientDetail.todaysHealth.title", "Today's Health")}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {t("clientDetail.todaysHealth.live", "Live")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hero Stats */}
        <div className="grid grid-cols-3 gap-2">
          {/* Steps */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg p-2.5 border border-blue-500/20">
            <div className="flex items-center gap-1 mb-1">
              <Footprints className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-lg font-bold text-foreground">{steps.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">steps</p>
          </div>

          {/* Calories */}
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-lg p-2.5 border border-orange-500/20">
            <div className="flex items-center gap-1 mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <p className="text-lg font-bold text-foreground">{calories.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">kcal</p>
          </div>

          {/* Exercise Time */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg p-2.5 border border-green-500/20">
            <div className="flex items-center gap-1 mb-1">
              <Timer className="w-3.5 h-3.5 text-green-400" />
            </div>
            <p className="text-lg font-bold text-foreground">{formatTime(activeMinutes)}</p>
            <p className="text-xs text-muted-foreground">exercise</p>
          </div>
        </div>

        {/* Distance Summary */}
        {totalDistance > 0 && (
          <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium">Distance</span>
              </div>
              <span className="text-sm font-bold">{formatDistance(totalDistance)}</span>
            </div>
            
            <div className="flex items-center gap-3 text-xs">
              {distanceWalking > 0 && (
                <div className="flex items-center gap-1">
                  <Footprints className="w-3 h-3 text-cyan-400" />
                  <span className="text-muted-foreground">{formatDistance(distanceWalking)}</span>
                </div>
              )}
              {distanceCycling > 0 && (
                <div className="flex items-center gap-1">
                  <Bike className="w-3 h-3 text-emerald-400" />
                  <span className="text-muted-foreground">{formatDistance(distanceCycling)}</span>
                </div>
              )}
              {distanceSwimming > 0 && (
                <div className="flex items-center gap-1">
                  <Waves className="w-3 h-3 text-blue-400" />
                  <span className="text-muted-foreground">{formatDistance(distanceSwimming)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
