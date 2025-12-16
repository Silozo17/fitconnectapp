import { Card, CardContent } from "@/components/ui/card";
import { Users, Dumbbell, Calendar, DollarSign, TrendingUp, TrendingDown, MessageSquare, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetDisplayFormat } from "@/lib/widget-formats";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

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

const colorMap: Record<string, string> = {
  stats_users: "text-blue-500 bg-blue-500/10",
  stats_coaches: "text-orange-500 bg-orange-500/10",
  stats_sessions: "text-green-500 bg-green-500/10",
  stats_revenue: "text-primary bg-primary/10",
  stats_messages: "text-purple-500 bg-purple-500/10",
  stats_reviews: "text-amber-500 bg-amber-500/10",
  stats_clients: "text-blue-500 bg-blue-500/10",
  stats_rating: "text-amber-500 bg-amber-500/10",
  business_earnings: "text-primary bg-primary/10",
  business_packages: "text-green-500 bg-green-500/10",
  business_subscriptions: "text-purple-500 bg-purple-500/10",
};

const chartColorMap: Record<string, string> = {
  stats_users: "hsl(217, 91%, 60%)",
  stats_coaches: "hsl(25, 95%, 53%)",
  stats_sessions: "hsl(142, 76%, 36%)",
  stats_revenue: "hsl(var(--primary))",
  stats_messages: "hsl(271, 91%, 65%)",
  stats_reviews: "hsl(43, 96%, 56%)",
  stats_clients: "hsl(217, 91%, 60%)",
  stats_rating: "hsl(43, 96%, 56%)",
  business_earnings: "hsl(var(--primary))",
  business_packages: "hsl(142, 76%, 36%)",
  business_subscriptions: "hsl(271, 91%, 65%)",
};

// Generate mock trend data if not provided
function generateMockTrendData(value: number | string): { name: string; value: number }[] {
  const numValue = typeof value === "number" ? value : parseFloat(value) || 100;
  return Array.from({ length: 7 }, (_, i) => ({
    name: `Day ${i + 1}`,
    value: Math.round(numValue * (0.7 + Math.random() * 0.6)),
  }));
}

export function StatWidget({ 
  type, 
  title, 
  value, 
  change, 
  size = "small", 
  displayFormat = "number",
  trendData 
}: StatWidgetProps) {
  const Icon = iconMap[type] || Users;
  const colorClass = colorMap[type] || "text-primary bg-primary/10";
  const chartColor = chartColorMap[type] || "hsl(var(--primary))";
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
    <div className="flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClass)}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <p className="text-2xl font-bold">{formattedValue}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      {change !== undefined && (
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium",
          change >= 0 ? "text-green-500" : "text-red-500"
        )}>
          {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
  );

  const renderBarChart = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorClass)}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
        <span className="text-lg font-bold">{formattedValue}</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={data}>
          <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} />
          <Tooltip 
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
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
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorClass)}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
        <span className="text-lg font-bold">{formattedValue}</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} dot={false} />
          <Tooltip 
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
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
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorClass)}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
        <span className="text-lg font-bold">{formattedValue}</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={chartColor} fill={`url(#gradient-${type})`} strokeWidth={2} />
          <Tooltip 
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const renderPieChart = () => (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={0}
              outerRadius={30}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={chartColor} />
              <Cell fill="hsl(var(--muted))" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1">
        <p className="text-2xl font-bold">{formattedValue}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      {change !== undefined && (
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium",
          change >= 0 ? "text-green-500" : "text-red-500"
        )}>
          {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
  );

  const renderDonutChart = () => (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={18}
              outerRadius={30}
              paddingAngle={2}
              dataKey="value"
            >
              <Cell fill={chartColor} />
              <Cell fill="hsl(var(--muted))" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold">{numericValue}%</span>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-lg font-bold">{formattedValue}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
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
    <Card className={cn(
      "hover:shadow-lg transition-shadow",
      size === "large" && "col-span-2"
    )}>
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
