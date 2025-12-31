import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, TrendingUp, Target, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { usePackageAnalytics, usePackageComparison } from "@/hooks/usePackageAnalytics";
import { useLocale } from "@/contexts/LocaleContext";
import { PackageComparisonChart } from "@/components/dashboard/coach/PackageComparisonChart";
import { PackageOptimizationTips } from "@/components/dashboard/coach/PackageOptimizationTips";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FeatureGate } from "@/components/FeatureGate";

const CoachPackageAnalytics = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useLocale();
  const [period, setPeriod] = useState("6months");
  
  const { data: analytics, isLoading } = usePackageAnalytics();

  if (isLoading) {
    return (
      <DashboardLayout title={t('analytics.packagePerformance', 'Package Performance')} description="">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  const packages = analytics?.packages || [];
  const monthlyData = analytics?.monthlyData || [];
  const totalRevenue = analytics?.totalRevenue || 0;
  const avgCompletionRate = analytics?.avgCompletionRate || 0;
  const topPackage = analytics?.topPackage;
  const totalActivePurchases = analytics?.totalActivePurchases || 0;

  const chartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--primary))" },
    purchases: { label: "Purchases", color: "hsl(var(--accent))" },
  };

  return (
    <DashboardLayout title={t('analytics.packagePerformance', 'Package Performance')} description={t('analytics.packageDesc', 'Analyze your session packages performance')}>
      <FeatureGate feature="package_analytics">
      <div className="space-y-6 overflow-x-hidden">
        {/* Header with Period Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {t('analytics.packagePerformance', 'Package Performance')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('analytics.trackPackages', 'Track how your session packages are performing')}
            </p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">{t('analytics.last3Months', 'Last 3 Months')}</SelectItem>
              <SelectItem value="6months">{t('analytics.last6Months', 'Last 6 Months')}</SelectItem>
              <SelectItem value="12months">{t('analytics.lastYear', 'Last Year')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{t('analytics.totalRevenue', 'Total Revenue')}</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">
                {formatCurrency(totalRevenue)}
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-success" />
                <span className="text-sm text-muted-foreground">{t('analytics.avgCompletion', 'Avg Completion')}</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">
                {Math.round(avgCompletionRate)}%
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">{t('analytics.topPackage', 'Top Package')}</span>
              </div>
              <p className="text-lg font-display font-bold text-foreground truncate">
                {topPackage?.packageName || '-'}
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-warning" />
                <span className="text-sm text-muted-foreground">{t('analytics.activePurchases', 'Active')}</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">
                {totalActivePurchases}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-secondary flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">{t('analytics.overview', 'Overview')}</TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs sm:text-sm">{t('analytics.comparison', 'Comparison')}</TabsTrigger>
            <TabsTrigger value="tips" className="text-xs sm:text-sm">{t('analytics.tips', 'Optimization Tips')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Revenue Chart */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-lg">{t('analytics.revenueOverTime', 'Revenue Over Time')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Package Metrics Table */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-lg">{t('analytics.packageMetrics', 'Package Metrics')}</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('packages.package', 'Package')}</TableHead>
                      <TableHead className="text-right">{t('analytics.revenue', 'Revenue')}</TableHead>
                      <TableHead className="text-right">{t('analytics.purchases', 'Purchases')}</TableHead>
                      <TableHead className="text-right">{t('analytics.completionRate', 'Completion')}</TableHead>
                      <TableHead className="text-right">{t('analytics.avgSessionsUsed', 'Avg Used')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          {t('analytics.noPackages', 'No packages to display')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      packages.map((pkg) => (
                        <TableRow key={pkg.packageId}>
                          <TableCell className="font-medium">{pkg.packageName}</TableCell>
                          <TableCell className="text-right">{formatCurrency(pkg.totalRevenue)}</TableCell>
                          <TableCell className="text-right">{pkg.totalPurchases}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={pkg.completionRate >= 80 ? "default" : pkg.completionRate >= 50 ? "secondary" : "outline"}>
                              {Math.round(pkg.completionRate)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{pkg.avgSessionsUsed.toFixed(1)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison">
            <PackageComparisonChart packages={packages} />
          </TabsContent>

          <TabsContent value="tips">
            <PackageOptimizationTips packages={packages} summary={analytics} />
          </TabsContent>
        </Tabs>
      </div>
      </FeatureGate>
    </DashboardLayout>
  );
};

export default CoachPackageAnalytics;
