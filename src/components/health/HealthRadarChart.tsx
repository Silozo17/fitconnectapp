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

  // Build conic gradient stops for smooth color blending
  const conicGradientStops = useMemo(() => {
    const colors = Object.values(METRIC_COLORS);
    const numColors = colors.length;
    const stops: string[] = [];
    
    colors.forEach((color, i) => {
      const startAngle = (i / numColors) * 360;
      const endAngle = ((i + 1) / numColors) * 360;
      stops.push(`${color} ${startAngle}deg ${endAngle}deg`);
    });
    
    // Close the loop by blending back to first color
    return stops.join(', ');
  }, []);

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
          <defs>
            {/* Create gradient segments between adjacent colors */}
            {chartData.map((item, index) => {
              const nextIndex = (index + 1) % chartData.length;
              const nextItem = chartData[nextIndex];
              return (
                <linearGradient
                  key={`gradient-${index}`}
                  id={`segmentGradient-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={item.color} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={nextItem.color} stopOpacity={0.7} />
                </linearGradient>
              );
            })}
            {/* Main radar fill with multi-color conic gradient simulation */}
            <radialGradient id="radarMultiGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.1} />
              <stop offset="50%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.5} />
            </radialGradient>
            {/* Stroke gradient that blends all colors */}
            <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
            tick={({ x, y, payload, index }) => {
              const color = chartData[index]?.color || "hsl(var(--muted-foreground))";
              return (
                <text
                  x={x}
                  y={y}
                  fill={color}
                  fontSize={11}
                  fontWeight={600}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {payload.value}
                </text>
              );
            }}
            tickLine={false}
          />
          <Radar
            name="Health"
            dataKey="value"
            stroke="url(#strokeGradient)"
            strokeWidth={2.5}
            fill="url(#radarMultiGradient)"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export { calculateOverallScore };
