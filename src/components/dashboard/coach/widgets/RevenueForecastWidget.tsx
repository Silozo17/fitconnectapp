import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRevenueForecasting } from "@/hooks/useRevenueForecasting";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

function formatCurrency(amount: number, compact = false): string {
  if (compact && amount >= 1000) {
    return `£${(amount / 1000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RevenueForecastWidget() {
  const { data, isLoading } = useRevenueForecasting();

  if (isLoading) {
    return (
      <Card className="w-full h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Revenue Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Revenue Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No revenue data available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const { metrics, monthlyData, revenueBreakdown, projectionConfidence } = data;
  const isGrowing = metrics.revenueGrowthRate > 0;

  // Prepare chart data (show 6 historical + 6 projected)
  const chartData = monthlyData.slice(0, 12).map((m) => ({
    month: m.month.split(" ")[0], // Just month abbreviation
    revenue: Math.round(m.totalRevenue),
    isProjected: m.isProjected,
  }));

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Revenue Forecast
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              projectionConfidence === "high" ? "text-success border-success" :
              projectionConfidence === "medium" ? "text-warning border-warning" :
              "text-muted-foreground"
            )}
          >
            {projectionConfidence} confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 overflow-hidden">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Monthly Recurring</p>
            <p className="text-xl font-bold">{formatCurrency(metrics.currentMRR)}</p>
            <div className="flex items-center gap-1 mt-1">
              {isGrowing ? (
                <TrendingUp className="w-3 h-3 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 text-destructive" />
              )}
              <span className={cn(
                "text-xs",
                isGrowing ? "text-success" : "text-destructive"
              )}>
                {isGrowing ? "+" : ""}{metrics.revenueGrowthRate.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Projected ARR</p>
            <p className="text-xl font-bold">{formatCurrency(metrics.projectedARR, true)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.retentionRate.toFixed(0)}% retention
            </p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="w-full aspect-[2/1] md:aspect-[3/1] min-h-[120px]">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                hide 
                domain={["auto", "auto"]}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [formatCurrency(value), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Revenue Breakdown */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] sm:text-xs mt-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            <span className="text-muted-foreground whitespace-nowrap">
              <span className="hidden sm:inline">Subs</span><span className="sm:hidden">S</span>: {formatCurrency(revenueBreakdown.subscriptions)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
            <span className="text-muted-foreground whitespace-nowrap">
              <span className="hidden sm:inline">Pkgs</span><span className="sm:hidden">P</span>: {formatCurrency(revenueBreakdown.packages)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
            <span className="text-muted-foreground whitespace-nowrap">
              <span className="hidden sm:inline">Sessions</span><span className="sm:hidden">Sess</span>: {formatCurrency(revenueBreakdown.sessions)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
