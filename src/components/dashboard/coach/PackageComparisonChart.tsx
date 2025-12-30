import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import type { PackageMetrics } from "@/hooks/usePackageAnalytics";

interface PackageComparisonChartProps {
  packages: PackageMetrics[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
];

export function PackageComparisonChart({ packages }: PackageComparisonChartProps) {
  const { t } = useTranslation();
  const [selectedPackages, setSelectedPackages] = useState<string[]>(
    packages.slice(0, 4).map(p => p.packageId)
  );
  const [metric, setMetric] = useState<"totalRevenue" | "completionRate" | "totalPurchases" | "avgSessionsUsed">("totalRevenue");

  const metricLabels = {
    totalRevenue: t('analytics.revenue', 'Revenue'),
    completionRate: t('analytics.completionRate', 'Completion Rate'),
    totalPurchases: t('analytics.purchases', 'Purchases'),
    avgSessionsUsed: t('analytics.avgSessionsUsed', 'Avg Sessions Used'),
  };

  const filteredPackages = packages.filter(p => selectedPackages.includes(p.packageId));

  const chartData = filteredPackages.map((pkg, index) => ({
    name: pkg.packageName.length > 15 ? pkg.packageName.substring(0, 15) + '...' : pkg.packageName,
    value: pkg[metric],
    fill: COLORS[index % COLORS.length],
  }));

  const chartConfig = {
    value: { label: metricLabels[metric], color: "hsl(var(--primary))" },
  };

  const togglePackage = (pkgId: string) => {
    setSelectedPackages(prev => {
      if (prev.includes(pkgId)) {
        return prev.filter(id => id !== pkgId);
      }
      if (prev.length >= 4) return prev;
      return [...prev, pkgId];
    });
  };

  return (
    <Card variant="glass">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="text-lg">{t('analytics.comparison', 'Package Comparison')}</CardTitle>
        <Select value={metric} onValueChange={(v) => setMetric(v as typeof metric)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="totalRevenue">{t('analytics.revenue', 'Revenue')}</SelectItem>
            <SelectItem value="completionRate">{t('analytics.completionRate', 'Completion Rate')}</SelectItem>
            <SelectItem value="totalPurchases">{t('analytics.purchases', 'Purchases')}</SelectItem>
            <SelectItem value="avgSessionsUsed">{t('analytics.avgSessionsUsed', 'Avg Sessions Used')}</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Package Selector */}
        <div className="flex flex-wrap gap-2">
          {packages.map((pkg, index) => (
            <Badge
              key={pkg.packageId}
              variant={selectedPackages.includes(pkg.packageId) ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              style={selectedPackages.includes(pkg.packageId) ? { backgroundColor: COLORS[selectedPackages.indexOf(pkg.packageId) % COLORS.length] } : {}}
              onClick={() => togglePackage(pkg.packageId)}
            >
              {pkg.packageName}
            </Badge>
          ))}
        </div>
        
        {selectedPackages.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            {t('analytics.selectPackages', 'Select packages to compare')}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
