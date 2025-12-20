import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientProgress, ProgressMeasurements } from '@/hooks/useClientProgress';
import { format, parseISO } from 'date-fns';

interface ProgressChartProps {
  data: ClientProgress[];
  type: 'weight' | 'bodyFat' | 'measurements';
}

export const ProgressChart = ({ data, type }: ProgressChartProps) => {
  const { t } = useTranslation("client");
  
  const chartData = useMemo(() => {
    return data.map((entry) => {
      const measurements = entry.measurements as ProgressMeasurements | null;
      return {
        date: format(parseISO(entry.recorded_at), 'MMM d'),
        fullDate: entry.recorded_at,
        weight: entry.weight_kg ? Number(entry.weight_kg) : null,
        bodyFat: entry.body_fat_percentage ? Number(entry.body_fat_percentage) : null,
        chest: measurements?.chest ?? null,
        waist: measurements?.waist ?? null,
        hips: measurements?.hips ?? null,
        biceps: measurements?.biceps ?? null,
        thighs: measurements?.thighs ?? null,
      };
    }).filter(d => {
      if (type === 'weight') return d.weight !== null;
      if (type === 'bodyFat') return d.bodyFat !== null;
      if (type === 'measurements') return d.chest || d.waist || d.hips || d.biceps || d.thighs;
      return true;
    });
  }, [data, type]);

  const getTitle = () => {
    if (type === 'bodyFat') return `${t("progress.bodyFatPercent")} ${t("progress.trend")}`;
    if (type === 'measurements') return `${t("progress.bodyMeasurements")} ${t("progress.trend")}`;
    return `${t("progress.weight")} ${t("progress.trend")}`;
  };

  if (chartData.length < 2) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            {t("progress.needTwoEntries")}
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    if (type === 'weight') {
      return (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            name={`${t("progress.weight")} (${t("progress.units.kg")})`}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      );
    }

    if (type === 'bodyFat') {
      return (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line
            type="monotone"
            dataKey="bodyFat"
            name={t("progress.bodyFatPercent")}
            stroke="#eab308"
            strokeWidth={2}
            dot={{ fill: '#eab308', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      );
    }

    return (
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Line type="monotone" dataKey="chest" name={t("progress.fields.chest")} stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
        <Line type="monotone" dataKey="waist" name={t("progress.fields.waist")} stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
        <Line type="monotone" dataKey="hips" name={t("progress.fields.hips")} stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
        <Line type="monotone" dataKey="biceps" name={t("progress.fields.biceps")} stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
        <Line type="monotone" dataKey="thighs" name={t("progress.fields.thighs")} stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7' }} />
      </LineChart>
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{getTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
