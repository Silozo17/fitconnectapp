import { memo } from "react";
import { Users, Dumbbell, Calendar, DollarSign, TrendingUp, TrendingDown, MessageSquare, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetDisplayFormat } from "@/lib/widget-formats";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import type { ContentSectionColor } from "@/components/shared/ContentSection";

interface StatWidgetProps {
  type: string;
  title: string;
  value: number | string;
  change?: number;
  size?: "small" | "medium" | "large" | "full";
  displayFormat?: WidgetDisplayFormat;
  trendData?: { name: string; value: number }[];
}

const iconMap: Record<string, React.ComponentType<any>> = {
  stats_users: Users,
  stats_coaches: Dumbbell,
  stats_sessions: Calendar,
  stats_revenue: DollarSign,
  stats_messages: MessageSquare,
  stats_reviews: Star,
  stats_clients: Users,
  stats_rating: Star,
  business_earnings: DollarSign,
  business_packages: Calendar,
  business_subscriptions: DollarSign,
};

// Map widget types to ContentSection color themes
const colorThemeMap: Record<string, ContentSectionColor> = {
  stats_users: "blue",
  stats_coaches: "orange",
  stats_sessions: "green",
  stats_revenue: "primary",
  stats_messages: "purple",
  stats_reviews: "yellow",
  stats_clients: "blue",
  stats_rating: "yellow",
  business_earnings: "primary",
  business_packages: "green",
  business_subscriptions: "purple",
};

// Color styles matching MetricCard pattern
const colorStyles: Record<ContentSectionColor, {
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
  accent: string;
  chartColor: string;
}> = {
  primary: {
    bg: "from-primary/10 to-primary/5",
    border: "border-primary/20",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    accent: "from-primary/60",
    chartColor: "hsl(var(--primary))",
  },
  blue: {
    bg: "from-blue-500/10 to-blue-600/5",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    accent: "from-blue-400/60",
    chartColor: "hsl(217, 91%, 60%)",
  },
  green: {
    bg: "from-green-500/10 to-green-600/5",
    border: "border-green-500/20",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
    accent: "from-green-400/60",
    chartColor: "hsl(142, 76%, 36%)",
  },
  orange: {
    bg: "from-orange-500/10 to-orange-600/5",
    border: "border-orange-500/20",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
    accent: "from-orange-400/60",
    chartColor: "hsl(25, 95%, 53%)",
  },
  red: {
    bg: "from-red-500/10 to-pink-600/5",
    border: "border-red-500/20",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    accent: "from-red-400/60",
    chartColor: "hsl(0, 84%, 60%)",
  },
  purple: {
    bg: "from-purple-500/10 to-indigo-600/5",
    border: "border-purple-500/20",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    accent: "from-purple-400/60",
    chartColor: "hsl(271, 91%, 65%)",
  },
  cyan: {
    bg: "from-cyan-500/10 to-cyan-600/5",
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    accent: "from-cyan-400/60",
    chartColor: "hsl(187, 85%, 53%)",
  },
  yellow: {
    bg: "from-yellow-500/10 to-amber-600/5",
    border: "border-yellow-500/20",
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-400",
    accent: "from-yellow-400/60",
    chartColor: "hsl(43, 96%, 56%)",
  },
  muted: {
    bg: "from-muted/30 to-muted/20",
    border: "border-border/50",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    accent: "from-muted-foreground/30",
    chartColor: "hsl(var(--muted-foreground))",
  },
};

// Generate mock trend data if not provided
function generateMockTrendData(value: number | string): { name: string; value: number }[] {
  const numValue = typeof value === "number" ? value : parseFloat(value) || 100;
  return Array.from({ length: 7 }, (_, i) => ({
    name: `Day ${i + 1}`,
    value: Math.round(numValue * (0.7 + Math.random() * 0.6)),
  }));
}

export const StatWidget = memo(function StatWidget({ 
  type, 
  title, 
  value, 
  change, 
  size = "small", 
  displayFormat = "number",
  trendData 
}: StatWidgetProps) {
  const Icon = iconMap[type] || Users;
  const colorTheme = colorThemeMap[type] || "primary";
  const styles = colorStyles[colorTheme];
  const data = trendData || generateMockTrendData(value);
  
  const formattedValue = type === "stats_revenue" || type === "business_earnings"
    ? typeof value === "number" ? `£${value.toLocaleString()}` : value
    : value;

  const numericValue = typeof value === "number" ? value : parseFloat(value) || 0;
  const pieData = [
    { name: "Value", value: numericValue },
    { name: "Remaining", value: Math.max(0, 100 - numericValue) },
  ];

  const renderNumberFormat = () => (
    <div className="flex items-center gap-3">
      <div className={cn("p-2 rounded-xl", styles.iconBg)}>
        <Icon className={cn("w-5 h-5", styles.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-foreground tracking-tight">{formattedValue}</p>
        <p className="text-xs text-muted-foreground truncate">{title}</p>
      </div>
      {change !== undefined && (
        <div className={cn(
          "flex items-center gap-0.5 text-xs font-medium shrink-0",
          change >= 0 ? "text-green-500" : "text-red-500"
        )}>
          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change > 0 ? "+" : ""}{Math.abs(change)}%
        </div>
      )}
    </div>
  );

  const renderBarChart = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg", styles.iconBg)}>
            <Icon className={cn("w-4 h-4", styles.iconColor)} />
          </div>
          <span className="text-xs text-muted-foreground">{title}</span>
        </div>
        <span className="text-lg font-bold text-foreground">{formattedValue}</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={data}>
          <Bar dataKey="value" fill={styles.chartColor} radius={[4, 4, 0, 0]} />
          <Tooltip 
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderLineChart = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg", styles.iconBg)}>
            <Icon className={cn("w-4 h-4", styles.iconColor)} />
          </div>
          <span className="text-xs text-muted-foreground">{title}</span>
        </div>
        <span className="text-lg font-bold text-foreground">{formattedValue}</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={styles.chartColor} strokeWidth={2} dot={false} />
          <Tooltip 
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderAreaChart = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg", styles.iconBg)}>
            <Icon className={cn("w-4 h-4", styles.iconColor)} />
          </div>
          <span className="text-xs text-muted-foreground">{title}</span>
        </div>
        <span className="text-lg font-bold text-foreground">{formattedValue}</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={styles.chartColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={styles.chartColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={styles.chartColor} fill={`url(#gradient-${type})`} strokeWidth={2} />
          <Tooltip 
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const renderPieChart = () => (
    <div className="flex items-center gap-3">
      <div className="relative w-14 h-14 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={0}
              outerRadius={26}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={styles.chartColor} />
              <Cell fill="hsl(var(--muted))" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-foreground tracking-tight">{formattedValue}</p>
        <p className="text-xs text-muted-foreground truncate">{title}</p>
      </div>
      {change !== undefined && (
        <div className={cn(
          "flex items-center gap-0.5 text-xs font-medium shrink-0",
          change >= 0 ? "text-green-500" : "text-red-500"
        )}>
          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
  );

  const renderDonutChart = () => (
    <div className="flex items-center gap-3">
      <div className="relative w-14 h-14 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={16}
              outerRadius={26}
              paddingAngle={2}
              dataKey="value"
            >
              <Cell fill={styles.chartColor} />
              <Cell fill="hsl(var(--muted))" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-foreground">{numericValue}%</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-lg font-bold text-foreground tracking-tight">{formattedValue}</p>
        <p className="text-xs text-muted-foreground truncate">{title}</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (displayFormat) {
      case "bar":
        return renderBarChart();
      case "line":
        return renderLineChart();
      case "area":
        return renderAreaChart();
      case "pie":
        return renderPieChart();
      case "donut":
        return renderDonutChart();
      default:
        return renderNumberFormat();
    }
  };

  return (
    <div 
      className={cn(
        "relative bg-gradient-to-br rounded-2xl border overflow-hidden p-4",
        "hover:shadow-lg transition-shadow",
        styles.bg,
        styles.border,
        size === "large" && "col-span-2"
      )}
    >
      {/* Top accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r to-transparent", styles.accent)} />
      {renderContent()}
    </div>
  );
});
