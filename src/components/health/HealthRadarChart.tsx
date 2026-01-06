import { useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Footprints, Flame, Timer, Heart, Moon, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthRadarChartProps {
  steps: number;
  calories: number;
  activeMinutes: number;
  heartRate: number;
  sleep: number; // in minutes
  distance: number; // in meters
  className?: string;
}

// Normalize each metric to 0-100 scale based on typical goals
const normalizeMetrics = (data: HealthRadarChartProps) => {
  const normalizeHeartRate = (hr: number) => {
    // Optimal resting heart rate is 60-80 bpm
    // Score based on how close to optimal (70 bpm is peak score)
    if (hr === 0) return 0;
    const optimal = 70;
    const distance = Math.abs(hr - optimal);
    return Math.max(0, Math.min(100, 100 - distance * 2));
  };

  return [
    {
      metric: "Steps",
      value: Math.min(100, (data.steps / 10000) * 100),
      fullMark: 100,
    },
    {
      metric: "Calories",
      value: Math.min(100, (data.calories / 500) * 100),
      fullMark: 100,
    },
    {
      metric: "Exercise",
      value: Math.min(100, (data.activeMinutes / 30) * 100),
      fullMark: 100,
    },
    {
      metric: "Heart",
      value: normalizeHeartRate(data.heartRate),
      fullMark: 100,
    },
    {
      metric: "Sleep",
      value: Math.min(100, (data.sleep / 480) * 100), // 8 hours = 480 min
      fullMark: 100,
    },
    {
      metric: "Distance",
      value: Math.min(100, (data.distance / 5000) * 100), // 5km target
      fullMark: 100,
    },
  ];
};

// Calculate overall score
const calculateOverallScore = (data: HealthRadarChartProps): number => {
  const normalized = normalizeMetrics(data);
  const sum = normalized.reduce((acc, item) => acc + item.value, 0);
  return Math.round(sum / normalized.length);
};

export const HealthRadarChart = ({
  steps,
  calories,
  activeMinutes,
  heartRate,
  sleep,
  distance,
  className,
}: HealthRadarChartProps) => {
  const chartData = useMemo(
    () => normalizeMetrics({ steps, calories, activeMinutes, heartRate, sleep, distance, className }),
    [steps, calories, activeMinutes, heartRate, sleep, distance]
  );

  const overallScore = useMemo(
    () => calculateOverallScore({ steps, calories, activeMinutes, heartRate, sleep, distance, className }),
    [steps, calories, activeMinutes, heartRate, sleep, distance]
  );

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-lime-400";
    if (score >= 40) return "text-yellow-400";
    if (score >= 20) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className={cn("relative", className)}>
      {/* Central score */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-center">
          <span className={cn("text-4xl font-bold", getScoreColor(overallScore))}>
            {overallScore}
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">Score</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid 
            stroke="hsl(var(--muted-foreground))" 
            strokeOpacity={0.2}
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ 
              fill: "hsl(var(--muted-foreground))", 
              fontSize: 11,
              fontWeight: 500,
            }}
            tickLine={false}
          />
          <PolarRadiusAxis 
            domain={[-20, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Health"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#radarGradient)"
            fillOpacity={0.5}
          />
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
              <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.4} />
            </linearGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export { calculateOverallScore };
