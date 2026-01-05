import { useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
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

// Semantic colors matching HealthMetricCard - in order around the radar
const METRIC_COLORS = {
  Steps: "#3b82f6",      // blue-500
  Calories: "#f97316",   // orange-500
  Exercise: "#22c55e",   // green-500
  Heart: "#ef4444",      // red-500
  Sleep: "#a855f7",      // purple-500
  Distance: "#06b6d4",   // cyan-500
};

// Normalize each metric to 0-100 scale based on typical goals
const normalizeMetrics = (data: HealthRadarChartProps) => {
  const normalizeHeartRate = (hr: number) => {
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
      color: METRIC_COLORS.Steps,
    },
    {
      metric: "Calories",
      value: Math.min(100, (data.calories / 500) * 100),
      fullMark: 100,
      color: METRIC_COLORS.Calories,
    },
    {
      metric: "Exercise",
      value: Math.min(100, (data.activeMinutes / 30) * 100),
      fullMark: 100,
      color: METRIC_COLORS.Exercise,
    },
    {
      metric: "Heart",
      value: normalizeHeartRate(data.heartRate),
      fullMark: 100,
      color: METRIC_COLORS.Heart,
    },
    {
      metric: "Sleep",
      value: Math.min(100, (data.sleep / 480) * 100),
      fullMark: 100,
      color: METRIC_COLORS.Sleep,
    },
    {
      metric: "Distance",
      value: Math.min(100, (data.distance / 5000) * 100),
      fullMark: 100,
      color: METRIC_COLORS.Distance,
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
      {/* Conic gradient background overlay - positioned behind chart */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `conic-gradient(from -60deg at 50% 50%, 
            ${METRIC_COLORS.Steps}40 0deg, 
            ${METRIC_COLORS.Calories}40 60deg, 
            ${METRIC_COLORS.Exercise}40 120deg, 
            ${METRIC_COLORS.Heart}40 180deg, 
            ${METRIC_COLORS.Sleep}40 240deg, 
            ${METRIC_COLORS.Distance}40 300deg, 
            ${METRIC_COLORS.Steps}40 360deg
          )`,
          maskImage: 'radial-gradient(circle at 50% 50%, transparent 15%, black 50%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 15%, black 50%, transparent 72%)',
          opacity: 0.7,
        }}
      />

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
          <defs>
            {/* Radial gradient: transparent center to visible edges */}
            <radialGradient id="radarFillGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity={0} />
              <stop offset="60%" stopColor="white" stopOpacity={0.1} />
              <stop offset="100%" stopColor="white" stopOpacity={0.25} />
            </radialGradient>
            {/* Multi-color stroke gradient */}
            <linearGradient id="radarStrokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={METRIC_COLORS.Steps} />
              <stop offset="17%" stopColor={METRIC_COLORS.Calories} />
              <stop offset="33%" stopColor={METRIC_COLORS.Exercise} />
              <stop offset="50%" stopColor={METRIC_COLORS.Heart} />
              <stop offset="67%" stopColor={METRIC_COLORS.Sleep} />
              <stop offset="83%" stopColor={METRIC_COLORS.Distance} />
              <stop offset="100%" stopColor={METRIC_COLORS.Steps} />
            </linearGradient>
          </defs>
          <PolarGrid 
            stroke="hsl(var(--muted-foreground))" 
            strokeOpacity={0.15}
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
          <Radar
            name="Health"
            dataKey="value"
            stroke="url(#radarStrokeGradient)"
            strokeWidth={2}
            fill="url(#radarFillGradient)"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export { calculateOverallScore };
