import { memo } from "react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AreaChart as AreaChartIcon, LineChart as LineChartIcon, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartWidgetProps {
  type: "area" | "line" | "bar";
  title: string;
  data: { name: string; value: number }[];
  color?: string;
  colorTheme?: "primary" | "blue" | "green" | "orange" | "purple";
}

const iconMap = {
  area: AreaChartIcon,
  line: LineChartIcon,
  bar: BarChart3,
};

const colorThemes = {
  primary: {
    bg: "from-primary/10 via-background to-primary/5",
    border: "border-primary/20",
    accent: "from-primary/60 via-accent/40",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    chartColor: "hsl(var(--primary))",
  },
  blue: {
    bg: "from-blue-500/10 via-background to-blue-600/5",
    border: "border-blue-500/20",
    accent: "from-blue-400/60 via-blue-500/40",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    chartColor: "hsl(217, 91%, 60%)",
  },
  green: {
    bg: "from-green-500/10 via-background to-green-600/5",
    border: "border-green-500/20",
    accent: "from-green-400/60 via-green-500/40",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
    chartColor: "hsl(142, 76%, 36%)",
  },
  orange: {
    bg: "from-orange-500/10 via-background to-orange-600/5",
    border: "border-orange-500/20",
    accent: "from-orange-400/60 via-orange-500/40",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
    chartColor: "hsl(25, 95%, 53%)",
  },
  purple: {
    bg: "from-purple-500/10 via-background to-indigo-600/5",
    border: "border-purple-500/20",
    accent: "from-purple-400/60 via-indigo-400/40",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    chartColor: "hsl(271, 91%, 65%)",
  },
};

export const ChartWidget = memo(function ChartWidget({ 
  type, 
  title, 
  data, 
  color,
  colorTheme = "primary" 
}: ChartWidgetProps) {
  const Icon = iconMap[type];
  const theme = colorThemes[colorTheme];
  const chartColor = color || theme.chartColor;

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 10, left: -20, bottom: 0 },
    };

    switch (type) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`colorValue-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Area type="monotone" dataKey="value" stroke={chartColor} fillOpacity={1} fill={`url(#colorValue-${title})`} />
          </AreaChart>
        );
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Line type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} dot={{ fill: chartColor, r: 3 }} />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar dataKey="value" fill={chartColor} radius={[6, 6, 0, 0]} />
          </BarChart>
        );
    }
  };

  return (
    <div className={cn(
      "relative bg-gradient-to-br rounded-2xl border overflow-hidden",
      theme.bg,
      theme.border
    )}>
      {/* Top accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r to-transparent", theme.accent)} />
      
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <div className={cn("p-2 rounded-xl", theme.iconBg)}>
          <Icon className={cn("h-4 w-4", theme.iconColor)} />
        </div>
        <h3 className="font-semibold text-foreground text-base">{title}</h3>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});
