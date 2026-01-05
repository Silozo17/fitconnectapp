import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Activity, Heart, Moon, Footprints, Flame, Bike, Waves, Timer } from "lucide-react";
import { useHealthData } from "@/hooks/useHealthData";
import { useTranslation } from "@/hooks/useTranslation";
import { format, subDays } from "date-fns";

interface ClientWearableDataProps {
  clientId: string;
  clientName?: string;
}

const DATA_TYPE_CONFIG: Record<string, { icon: typeof Activity; label: string; unit: string; color: string }> = {
  steps: { icon: Footprints, label: "Steps", unit: "", color: "text-blue-600" },
  calories: { icon: Flame, label: "Calories", unit: "kcal", color: "text-orange-600" },
  heart_rate: { icon: Heart, label: "Heart Rate", unit: "bpm", color: "text-red-600" },
  sleep: { icon: Moon, label: "Sleep", unit: "hrs", color: "text-purple-600" },
  active_minutes: { icon: Timer, label: "Active Time", unit: "min", color: "text-green-600" },
  distance_walking: { icon: Footprints, label: "Walking", unit: "m", color: "text-cyan-600" },
  distance_cycling: { icon: Bike, label: "Cycling", unit: "m", color: "text-emerald-600" },
  distance_swimming: { icon: Waves, label: "Swimming", unit: "m", color: "text-blue-500" },
};

export const ClientWearableData = ({ clientId, clientName }: ClientWearableDataProps) => {
  const { t } = useTranslation("coach");
  const [dateRange, setDateRange] = useState<"7" | "30" | "90">("7");
  
  const days = parseInt(dateRange);
  const startDate = subDays(new Date(), days);
  const endDate = new Date();

  // Fetch all relevant health data types
  const { data: stepsData, isLoading: loadingSteps } = useHealthData({ 
    dataType: "steps", 
    startDate, 
    endDate, 
    clientId 
  });
  const { data: caloriesData, isLoading: loadingCalories } = useHealthData({ 
    dataType: "calories", 
    startDate, 
    endDate, 
    clientId 
  });
  const { data: heartRateData, isLoading: loadingHeart } = useHealthData({ 
    dataType: "heart_rate", 
    startDate, 
    endDate, 
    clientId 
  });
  const { data: sleepData, isLoading: loadingSleep } = useHealthData({ 
    dataType: "sleep", 
    startDate, 
    endDate, 
    clientId 
  });
  const { data: activeMinutesData, isLoading: loadingActive } = useHealthData({ 
    dataType: "active_minutes", 
    startDate, 
    endDate, 
    clientId 
  });
  const { data: distanceWalkingData, isLoading: loadingWalking } = useHealthData({ 
    dataType: "distance_walking", 
    startDate, 
    endDate, 
    clientId 
  });
  const { data: distanceCyclingData, isLoading: loadingCycling } = useHealthData({ 
    dataType: "distance_cycling", 
    startDate, 
    endDate, 
    clientId 
  });
  const { data: distanceSwimmingData, isLoading: loadingSwimming } = useHealthData({ 
    dataType: "distance_swimming", 
    startDate, 
    endDate, 
    clientId 
  });

  const isLoading = loadingSteps || loadingCalories || loadingHeart || loadingSleep || loadingActive || loadingWalking || loadingCycling || loadingSwimming;

  const allData = {
    steps: stepsData || [],
    calories: caloriesData || [],
    heart_rate: heartRateData || [],
    sleep: sleepData || [],
    active_minutes: activeMinutesData || [],
    distance_walking: distanceWalkingData || [],
    distance_cycling: distanceCyclingData || [],
    distance_swimming: distanceSwimmingData || [],
  };

  const hasAnyData = Object.values(allData).some(arr => arr.length > 0);
  
  // Format distance for display
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  // Calculate averages for each type
  const getAverage = (data: any[]) => {
    if (!data || data.length === 0) return null;
    const sum = data.reduce((acc, item) => acc + (item.value || 0), 0);
    return Math.round(sum / data.length);
  };

  const getLatest = (data: any[]) => {
    if (!data || data.length === 0) return null;
    const sorted = [...data].sort((a, b) => 
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    );
    return sorted[0]?.value;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t("clientDetail.wearableData.title", "Wearable Data")}
            </CardTitle>
            <CardDescription>
              Last {days} days from connected devices
            </CardDescription>
          </div>
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as "7" | "30" | "90")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {!hasAnyData ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t("clientDetail.wearableData.noData", "No wearable data available")}</p>
            <p className="text-sm mt-2">
              {t("clientDetail.wearableData.noDataHint", "Client hasn't connected any wearable devices yet")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards - Core Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {["steps", "calories", "heart_rate", "sleep", "active_minutes"].map((type) => {
                const config = DATA_TYPE_CONFIG[type];
                const data = allData[type as keyof typeof allData];
                const avg = getAverage(data);
                const latest = getLatest(data);
                const Icon = config.icon;
                
                return (
                  <div key={type} className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className="text-xs text-muted-foreground">{config.label}</span>
                    </div>
                    {latest !== null ? (
                      <div>
                        <p className={`text-lg font-bold ${config.color}`}>
                          {type === "sleep" ? (latest / 60).toFixed(1) : latest.toLocaleString()}
                          {config.unit && <span className="text-xs font-normal ml-1">{config.unit}</span>}
                        </p>
                        {avg !== null && avg !== latest && (
                          <p className="text-xs text-muted-foreground">
                            Avg: {type === "sleep" ? (avg / 60).toFixed(1) : avg.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">-</p>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Distance Cards */}
            <div className="grid grid-cols-3 gap-3">
              {["distance_walking", "distance_cycling", "distance_swimming"].map((type) => {
                const config = DATA_TYPE_CONFIG[type];
                const data = allData[type as keyof typeof allData];
                const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
                const avg = getAverage(data);
                const Icon = config.icon;
                
                return (
                  <div key={type} className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className="text-xs text-muted-foreground">{config.label}</span>
                    </div>
                    {total > 0 ? (
                      <div>
                        <p className={`text-lg font-bold ${config.color}`}>
                          {formatDistance(total)}
                        </p>
                        {avg !== null && (
                          <p className="text-xs text-muted-foreground">
                            Avg/day: {formatDistance(avg)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">-</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Daily Breakdown */}
            <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
              <div className="bg-secondary/30 px-4 py-2 border-b sticky top-0">
                <h4 className="font-medium text-sm">{t("clientDetail.wearableData.dailyBreakdown", "Daily Breakdown")}</h4>
              </div>
              <div className="divide-y">
                {Array.from({ length: days }).map((_, i) => {
                  const date = subDays(new Date(), i);
                  const dateStr = format(date, "yyyy-MM-dd");
                  
                  const daySteps = allData.steps.find(d => d.recorded_at?.startsWith(dateStr));
                  const dayCalories = allData.calories.find(d => d.recorded_at?.startsWith(dateStr));
                  const daySleep = allData.sleep.find(d => d.recorded_at?.startsWith(dateStr));
                  const dayActive = allData.active_minutes.find(d => d.recorded_at?.startsWith(dateStr));
                  const dayWalking = allData.distance_walking.find(d => d.recorded_at?.startsWith(dateStr));
                  const dayCycling = allData.distance_cycling.find(d => d.recorded_at?.startsWith(dateStr));
                  const daySwimming = allData.distance_swimming.find(d => d.recorded_at?.startsWith(dateStr));
                  
                  const hasData = daySteps || dayCalories || daySleep || dayActive || dayWalking || dayCycling || daySwimming;
                  
                  return (
                    <div key={dateStr} className="px-4 py-3 flex items-center justify-between hover:bg-secondary/20">
                      <span className="font-medium text-sm min-w-[100px]">
                        {i === 0 ? "Today" : i === 1 ? "Yesterday" : format(date, "EEE, d MMM")}
                      </span>
                      {hasData ? (
                        <div className="flex items-center gap-3 text-sm flex-wrap justify-end">
                          {daySteps && (
                            <span className="text-blue-600">
                              <Footprints className="w-3 h-3 inline mr-1" />
                              {daySteps.value?.toLocaleString()}
                            </span>
                          )}
                          {dayCalories && (
                            <span className="text-orange-600">
                              <Flame className="w-3 h-3 inline mr-1" />
                              {dayCalories.value}
                            </span>
                          )}
                          {daySleep && (
                            <span className="text-purple-600">
                              <Moon className="w-3 h-3 inline mr-1" />
                              {(daySleep.value / 60).toFixed(1)}h
                            </span>
                          )}
                          {dayActive && (
                            <span className="text-green-600">
                              <Timer className="w-3 h-3 inline mr-1" />
                              {dayActive.value}m
                            </span>
                          )}
                          {dayWalking && dayWalking.value > 0 && (
                            <span className="text-cyan-600">
                              <Footprints className="w-3 h-3 inline mr-1" />
                              {formatDistance(dayWalking.value)}
                            </span>
                          )}
                          {dayCycling && dayCycling.value > 0 && (
                            <span className="text-emerald-600">
                              <Bike className="w-3 h-3 inline mr-1" />
                              {formatDistance(dayCycling.value)}
                            </span>
                          )}
                          {daySwimming && daySwimming.value > 0 && (
                            <span className="text-blue-500">
                              <Waves className="w-3 h-3 inline mr-1" />
                              {formatDistance(daySwimming.value)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No data</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
