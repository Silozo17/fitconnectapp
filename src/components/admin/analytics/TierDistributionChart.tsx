import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Crown } from 'lucide-react';
import type { TierDistribution } from '@/hooks/useAdminAnalytics';

interface TierDistributionChartProps {
  data: TierDistribution[];
}

const TIER_COLORS: Record<string, string> = {
  free: 'hsl(var(--muted-foreground))',
  starter: 'hsl(var(--accent))',
  professional: 'hsl(var(--primary))',
  enterprise: 'hsl(142.1, 76.2%, 36.3%)', // Green
};

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

export function TierDistributionChart({ data }: TierDistributionChartProps) {
  const { t } = useTranslation('admin');

  const chartData = data.map(item => ({
    name: TIER_LABELS[item.tier] || item.tier,
    value: item.count,
    fill: TIER_COLORS[item.tier] || 'hsl(var(--muted))',
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            {t('analytics.tierDistribution')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            {t('common:noData', 'No data available')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          {t('analytics.tierDistribution')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))', 
                  borderRadius: '8px' 
                }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
