import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Heart, Moon, Footprints, Flame, Shield } from "lucide-react";
import { useHealthData } from "@/hooks/useHealthData";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  active_minutes: { icon: Activity, label: "Active Minutes", unit: "min", color: "text-green-600" },
};

export const ClientWearableData = ({ clientId, clientName }: ClientWearableDataProps) => {
  const { t } = useTranslation("coach");
  const startDate = subDays(new Date(), 7);
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

  const isLoading = loadingSteps || loadingCalories || loadingHeart || loadingSleep || loadingActive;

  const allData = {
    steps: stepsData || [],
    calories: caloriesData || [],
    heart_rate: heartRateData || [],
    sleep: sleepData || [],
    active_minutes: activeMinutesData || [],
  };

  const hasAnyData = Object.values(allData).some(arr => arr.length > 0);

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
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          {t("clientDetail.wearableData.title", "Wearable Data")}
        </CardTitle>
        <CardDescription>
          {t("clientDetail.wearableData.description", "Last 7 days from connected devices")}
        </CardDescription>
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
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(DATA_TYPE_CONFIG).map(([type, config]) => {
                const data = allData[type as keyof typeof allData];
                const avg = getAverage(data);
                const latest = getLatest(data);
                const Icon = config.icon;
                
                return (
                  <div key={type} className="p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className="text-xs text-muted-foreground">{config.label}</span>
                    </div>
                    {latest !== null ? (
                      <div>
                        <p className={`text-xl font-bold ${config.color}`}>
                          {type === "sleep" ? (latest / 60).toFixed(1) : latest.toLocaleString()}
                          {config.unit && <span className="text-sm font-normal ml-1">{config.unit}</span>}
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

            {/* Daily Breakdown */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-secondary/30 px-4 py-2 border-b">
                <h4 className="font-medium text-sm">{t("clientDetail.wearableData.dailyBreakdown", "Daily Breakdown")}</h4>
              </div>
              <div className="divide-y">
                {Array.from({ length: 7 }).map((_, i) => {
                  const date = subDays(new Date(), i);
                  const dateStr = format(date, "yyyy-MM-dd");
                  
                  const daySteps = allData.steps.find(d => d.recorded_at?.startsWith(dateStr));
                  const dayCalories = allData.calories.find(d => d.recorded_at?.startsWith(dateStr));
                  const daySleep = allData.sleep.find(d => d.recorded_at?.startsWith(dateStr));
                  const dayActive = allData.active_minutes.find(d => d.recorded_at?.startsWith(dateStr));
                  
                  const hasData = daySteps || dayCalories || daySleep || dayActive;
                  
                  return (
                    <div key={dateStr} className="px-4 py-3 flex items-center justify-between hover:bg-secondary/20">
                      <span className="font-medium text-sm">
                        {i === 0 ? "Today" : i === 1 ? "Yesterday" : format(date, "EEE, d MMM")}
                      </span>
                      {hasData ? (
                        <div className="flex items-center gap-4 text-sm">
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
                              <Activity className="w-3 h-3 inline mr-1" />
                              {dayActive.value}m
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
