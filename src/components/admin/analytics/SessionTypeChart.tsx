import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Monitor, MapPin } from 'lucide-react';
import type { SessionTypeDistribution } from '@/hooks/useAdminAnalytics';

interface SessionTypeChartProps {
  data: SessionTypeDistribution[];
}

export function SessionTypeChart({ data }: SessionTypeChartProps) {
  const { t } = useTranslation('admin');

  const chartData = data.map(item => ({
    name: item.type === 'online' ? t('analytics.onlineSessions') : t('analytics.inPersonSessions'),
    value: item.count,
    fill: item.type === 'online' ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
  }));

  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            {t('analytics.sessionTypes')}
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
          <Monitor className="w-5 h-5 text-primary" />
          {t('analytics.sessionTypes')}
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
