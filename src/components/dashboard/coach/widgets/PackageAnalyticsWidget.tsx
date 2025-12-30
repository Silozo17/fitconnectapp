import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { usePackageAnalytics } from "@/hooks/usePackageAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, TrendingUp, Users, Percent } from "lucide-react";

export function PackageAnalyticsWidget() {
  const { data: analytics, isLoading } = usePackageAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!analytics || analytics.packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Package className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No package data</p>
        <p className="text-xs text-muted-foreground mt-1">
          Create packages to see analytics
        </p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Prepare chart data
  const chartData = analytics.packages
    .filter((p) => p.totalPurchases > 0)
    .slice(0, 5)
    .map((pkg) => ({
      name: pkg.packageName.length > 12 ? pkg.packageName.slice(0, 12) + "..." : pkg.packageName,
      revenue: pkg.totalRevenue,
      completion: pkg.completionRate,
    }));

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Total Revenue</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {formatCurrency(analytics.totalRevenue)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Avg Completion</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {analytics.avgCompletionRate.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Revenue by Package Chart */}
      {chartData.length > 0 && (
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={80} 
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {chartData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`hsl(var(--primary) / ${1 - index * 0.15})`} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Package */}
      {analytics.topPackage && (
        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
          <p className="text-xs text-muted-foreground mb-1">Top Package</p>
          <p className="text-sm font-medium text-foreground">
            {analytics.topPackage.packageName}
          </p>
          <p className="text-xs text-muted-foreground">
            {analytics.topPackage.totalPurchases} purchases • {formatCurrency(analytics.topPackage.totalRevenue)}
          </p>
        </div>
      )}
    </div>
  );
}
