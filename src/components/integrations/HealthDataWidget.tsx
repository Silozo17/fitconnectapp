import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footprints, Heart, Moon, Flame, Activity, Clock } from "lucide-react";
import { useHealthData, HealthDataType } from "@/hooks/useHealthData";
import { cn } from "@/lib/utils";

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

  const hasData = data && data.length > 0;

  if (isLoading) {
    return (
      <Card className={cn("bg-card/50 border-border/50", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Today's Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card className={cn("bg-card/50 border-border/50", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Today's Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Connect a wearable device to see your health data
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayMetrics = compact ? metrics.slice(0, 4) : metrics;

  return (
    <Card className={cn("bg-card/50 border-border/50", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Today's Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "grid gap-3",
          compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
        )}>
          {displayMetrics.map((metric) => {
            const value = getTodayValue(metric.type);
            return (
              <div
                key={metric.type}
                className="bg-muted/30 rounded-lg p-3 flex items-center gap-3"
              >
                <div className={cn("p-2 rounded-lg bg-muted/50", metric.color)}>
                  {metric.icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="font-semibold">{metric.format(value)}</p>
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
