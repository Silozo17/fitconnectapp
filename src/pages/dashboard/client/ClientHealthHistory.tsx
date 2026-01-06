import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { 
  Activity, 
  Footprints, 
  Flame, 
  Heart, 
  Moon, 
  Timer, 
  Bike, 
  Waves, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { useHealthData } from "@/hooks/useHealthData";
import { DashboardSectionHeader, ContentSection } from "@/components/shared";
import { cn } from "@/lib/utils";

const DATA_TYPES = [
  { key: "steps", label: "Steps", icon: Footprints, color: "text-blue-500", bgColor: "bg-blue-500/10", unit: "" },
  { key: "calories", label: "Calories", icon: Flame, color: "text-orange-500", bgColor: "bg-orange-500/10", unit: "kcal" },
  { key: "heart_rate", label: "Heart Rate", icon: Heart, color: "text-red-500", bgColor: "bg-red-500/10", unit: "bpm" },
  { key: "sleep", label: "Sleep", icon: Moon, color: "text-purple-500", bgColor: "bg-purple-500/10", unit: "hrs" },
  { key: "active_minutes", label: "Active Time", icon: Timer, color: "text-green-500", bgColor: "bg-green-500/10", unit: "min" },
  { key: "distance_walking", label: "Walking", icon: Footprints, color: "text-cyan-500", bgColor: "bg-cyan-500/10", unit: "m" },
  { key: "distance_cycling", label: "Cycling", icon: Bike, color: "text-emerald-500", bgColor: "bg-emerald-500/10", unit: "m" },
  { key: "distance_swimming", label: "Swimming", icon: Waves, color: "text-blue-400", bgColor: "bg-blue-400/10", unit: "m" },
] as const;

const ClientHealthHistory = () => {
  const { t } = useTranslation('settings');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<"7" | "30" | "90">("30");
  
  const days = parseInt(dateRange);
  const startDate = subDays(new Date(), days);
  const endDate = new Date();

  // Fetch all data types
  const { data: stepsData } = useHealthData({ dataType: "steps", startDate, endDate });
  const { data: caloriesData } = useHealthData({ dataType: "calories", startDate, endDate });
  const { data: heartRateData } = useHealthData({ dataType: "heart_rate", startDate, endDate });
  const { data: sleepData } = useHealthData({ dataType: "sleep", startDate, endDate });
  const { data: activeMinutesData } = useHealthData({ dataType: "active_minutes", startDate, endDate });
  const { data: walkingData } = useHealthData({ dataType: "distance_walking", startDate, endDate });
  const { data: cyclingData } = useHealthData({ dataType: "distance_cycling", startDate, endDate });
  const { data: swimmingData } = useHealthData({ dataType: "distance_swimming", startDate, endDate });

  const allData = useMemo(() => ({
    steps: stepsData || [],
    calories: caloriesData || [],
    heart_rate: heartRateData || [],
    sleep: sleepData || [],
    active_minutes: activeMinutesData || [],
    distance_walking: walkingData || [],
    distance_cycling: cyclingData || [],
    distance_swimming: swimmingData || [],
  }), [stepsData, caloriesData, heartRateData, sleepData, activeMinutesData, walkingData, cyclingData, swimmingData]);

  // Get dates that have data for calendar highlighting
  const datesWithData = useMemo(() => {
    const dates = new Set<string>();
    Object.values(allData).forEach(dataArray => {
      dataArray.forEach(d => {
        if (d.recorded_at) {
          dates.add(format(new Date(d.recorded_at), "yyyy-MM-dd"));
        }
      });
    });
    return dates;
  }, [allData]);

  // Get data for selected date
  const selectedDateData = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const result: Record<string, number | null> = {};
    
    Object.entries(allData).forEach(([type, data]) => {
      const entry = data.find(d => d.recorded_at?.startsWith(dateStr));
      result[type] = entry?.value ?? null;
    });
    
    return result;
  }, [selectedDate, allData]);

  // Calculate averages
  const averages = useMemo(() => {
    const result: Record<string, number | null> = {};
    
    Object.entries(allData).forEach(([type, data]) => {
      if (data.length === 0) {
        result[type] = null;
      } else {
        const sum = data.reduce((acc, d) => acc + (d.value || 0), 0);
        result[type] = Math.round(sum / data.length);
      }
    });
    
    return result;
  }, [allData]);

  const formatValue = (type: string, value: number | null): string => {
    if (value === null) return "-";
    if (type === "sleep") return `${(value / 60).toFixed(1)}`;
    if (type.startsWith("distance_")) {
      if (value >= 1000) return `${(value / 1000).toFixed(1)} km`;
      return `${Math.round(value)} m`;
    }
    return value.toLocaleString();
  };

  const getUnit = (type: string, value: number | null): string => {
    if (value === null) return "";
    if (type === "sleep") return "hrs";
    if (type.startsWith("distance_") && value !== null && value >= 1000) return "";
    return DATA_TYPES.find(d => d.key === type)?.unit || "";
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const isToday = isSameDay(selectedDate, new Date());
  const hasDataForSelectedDate = Object.values(selectedDateData).some(v => v !== null);

  return (
    <ClientDashboardLayout 
      title={t('healthHistory.title', 'Health History')} 
      description={t('healthHistory.description', 'View your health data over time')}
    >
      <div className="space-y-11">
        {/* Section Header */}
        <DashboardSectionHeader
          title="Health History"
          description="View your health data over time"
        />
        
        {/* Date Selector Header */}
        <ContentSection colorTheme="primary" padding="default">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate("prev")}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="min-w-[200px]">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {isToday ? "Today" : format(selectedDate, "EEEE, d MMMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    modifiers={{
                      hasData: (date) => datesWithData.has(format(date, "yyyy-MM-dd")),
                    }}
                    modifiersStyles={{
                      hasData: { 
                        fontWeight: "bold",
                        backgroundColor: "hsl(var(--primary) / 0.1)",
                      },
                    }}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate("next")}
                disabled={isToday}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Range Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show averages for:</span>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as "7" | "30" | "90")}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ContentSection>

        {/* Selected Date Data - Apple-inspired cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DATA_TYPES.map(({ key, label, icon: Icon, color, bgColor }) => {
            const value = selectedDateData[key];
            const avg = averages[key];
            
            // Map color classes to gradient colors
            const gradientMap: Record<string, string> = {
              "text-blue-500": "from-blue-500/10 to-blue-600/5 border-blue-500/20",
              "text-orange-500": "from-orange-500/10 to-orange-600/5 border-orange-500/20",
              "text-red-500": "from-red-500/10 to-pink-600/5 border-red-500/20",
              "text-purple-500": "from-purple-500/10 to-indigo-600/5 border-purple-500/20",
              "text-green-500": "from-green-500/10 to-green-600/5 border-green-500/20",
              "text-cyan-500": "from-cyan-500/10 to-cyan-600/5 border-cyan-500/20",
              "text-emerald-500": "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20",
              "text-blue-400": "from-blue-400/10 to-blue-500/5 border-blue-400/20",
            };
            
            const accentMap: Record<string, string> = {
              "text-blue-500": "from-blue-400/60",
              "text-orange-500": "from-orange-400/60",
              "text-red-500": "from-red-400/60",
              "text-purple-500": "from-purple-400/60",
              "text-green-500": "from-green-400/60",
              "text-cyan-500": "from-cyan-400/60",
              "text-emerald-500": "from-emerald-400/60",
              "text-blue-400": "from-blue-300/60",
            };
            
            return (
              <div 
                key={key} 
                className={cn(
                  "relative bg-gradient-to-br rounded-2xl p-4 border overflow-hidden",
                  gradientMap[color] || "from-muted/10 to-muted/5 border-border/20"
                )}
              >
                {/* Top accent line */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r to-transparent",
                  accentMap[color] || "from-primary/60"
                )} />
                
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("p-2 rounded-xl", bgColor)}>
                    <Icon className={cn("w-5 h-5", color)} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{label}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground tracking-tight">
                      {formatValue(key, value)}
                    </span>
                    {value !== null && (
                      <span className="text-sm text-muted-foreground">
                        {getUnit(key, value)}
                      </span>
                    )}
                  </div>
                  
                  {avg !== null && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      <span>
                        {days}d avg: {formatValue(key, avg)} {getUnit(key, avg)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* No Data Message */}
        {!hasDataForSelectedDate && (
          <ContentSection colorTheme="muted" className="py-12 text-center">
            <Activity className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {t('healthHistory.noData', 'No health data recorded for this date')}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {t('healthHistory.syncHint', 'Sync your wearable device or add data manually')}
            </p>
          </ContentSection>
        )}

        {/* Historical Timeline */}
        <ContentSection colorTheme="primary">
          <div className="p-4 pb-2">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Recent Activity
            </h3>
          </div>
          <div className="px-4 pb-4">
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {Array.from({ length: Math.min(days, 14) }).map((_, i) => {
                const date = subDays(new Date(), i);
                const dateStr = format(date, "yyyy-MM-dd");
                
                const dayData = {
                  steps: allData.steps.find(d => d.recorded_at?.startsWith(dateStr))?.value,
                  calories: allData.calories.find(d => d.recorded_at?.startsWith(dateStr))?.value,
                  sleep: allData.sleep.find(d => d.recorded_at?.startsWith(dateStr))?.value,
                  active: allData.active_minutes.find(d => d.recorded_at?.startsWith(dateStr))?.value,
                };
                
                const hasData = Object.values(dayData).some(v => v !== undefined);
                const isSelected = isSameDay(date, selectedDate);
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left",
                      isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        hasData ? "bg-green-500" : "bg-muted-foreground/30"
                      )} />
                      <span className="font-medium text-sm">
                        {i === 0 ? "Today" : i === 1 ? "Yesterday" : format(date, "EEE, d MMM")}
                      </span>
                    </div>
                    
                    {hasData ? (
                      <div className="flex items-center gap-3 text-xs">
                        {dayData.steps && (
                          <span className="text-blue-500 flex items-center gap-1">
                            <Footprints className="w-3 h-3" />
                            {dayData.steps.toLocaleString()}
                          </span>
                        )}
                        {dayData.calories && (
                          <span className="text-orange-500 flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {dayData.calories}
                          </span>
                        )}
                        {dayData.sleep && (
                          <span className="text-purple-500 flex items-center gap-1">
                            <Moon className="w-3 h-3" />
                            {(dayData.sleep / 60).toFixed(1)}h
                          </span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">No data</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </ContentSection>
      </div>
    </ClientDashboardLayout>
  );
};

export default ClientHealthHistory;
