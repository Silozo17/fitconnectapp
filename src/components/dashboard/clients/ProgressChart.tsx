import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ProgressData {
  date: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
}

interface ProgressChartProps {
  data: ProgressData[];
  title?: string;
}

type MetricKey = "weight" | "bodyFat" | "chest" | "waist";

const metricConfig: Record<MetricKey, { label: string; unit: string; color: string }> = {
  weight: { label: "Weight", unit: "kg", color: "hsl(var(--primary))" },
  bodyFat: { label: "Body Fat", unit: "%", color: "hsl(var(--chart-2))" },
  chest: { label: "Chest", unit: "cm", color: "hsl(var(--chart-3))" },
  waist: { label: "Waist", unit: "cm", color: "hsl(var(--chart-4))" },
};

export function ProgressChart({ data, title = "Progress Over Time" }: ProgressChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("weight");
  
  const config = metricConfig[selectedMetric];
  
  const validData = data.filter(d => d[selectedMetric] !== undefined);
  
  const getTrend = () => {
    if (validData.length < 2) return { icon: Minus, text: "No trend data", color: "text-muted-foreground" };
    
    const first = validData[0][selectedMetric] || 0;
    const last = validData[validData.length - 1][selectedMetric] || 0;
    const change = last - first;
    const percentChange = ((change / first) * 100).toFixed(1);
    
    if (change > 0) {
      return {
        icon: TrendingUp,
        text: `+${percentChange}%`,
        color: selectedMetric === "waist" || selectedMetric === "bodyFat" ? "text-red-400" : "text-green-400",
      };
    } else if (change < 0) {
      return {
        icon: TrendingDown,
        text: `${percentChange}%`,
        color: selectedMetric === "waist" || selectedMetric === "bodyFat" ? "text-green-400" : "text-red-400",
      };
    }
    return { icon: Minus, text: "No change", color: "text-muted-foreground" };
  };
  
  const trend = getTrend();
  const TrendIcon = trend.icon;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground min-w-0 truncate">{title}</CardTitle>
        <Select value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as MetricKey)}>
          <SelectTrigger className="w-full sm:w-[140px] min-w-0 max-w-full sm:max-w-[140px] overflow-hidden bg-background border-border shrink-0">
            <span className="flex-1 min-w-0 truncate">
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(metricConfig).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <TrendIcon className={`h-4 w-4 ${trend.color}`} />
          <span className={`text-sm font-medium ${trend.color}`}>{trend.text}</span>
          <span className="text-sm text-muted-foreground">
            from {validData.length > 0 ? validData[0].date : 'start'}
          </span>
        </div>
        
        <div className="h-[250px]">
          {validData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={validData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={config.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={config.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                  unit={config.unit}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [`${value} ${config.unit}`, config.label]}
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={config.color}
                  strokeWidth={2}
                  fill={`url(#gradient-${selectedMetric})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available for {config.label}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
