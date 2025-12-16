import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientProgress, ProgressMeasurements } from '@/hooks/useClientProgress';
import { format, parseISO } from 'date-fns';

interface ProgressChartProps {
  data: ClientProgress[];
  type: 'weight' | 'bodyFat' | 'measurements';
}

export const ProgressChart = ({ data, type }: ProgressChartProps) => {
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

  if (chartData.length < 2) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg capitalize">
            {type === 'bodyFat' ? 'Body Fat %' : type} Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Need at least 2 entries to show trend
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
            name="Weight (kg)"
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
            name="Body Fat %"
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
        <Line type="monotone" dataKey="chest" name="Chest" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
        <Line type="monotone" dataKey="waist" name="Waist" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
        <Line type="monotone" dataKey="hips" name="Hips" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
        <Line type="monotone" dataKey="biceps" name="Biceps" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
        <Line type="monotone" dataKey="thighs" name="Thighs" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7' }} />
      </LineChart>
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg capitalize">
          {type === 'bodyFat' ? 'Body Fat %' : type === 'measurements' ? 'Body Measurements' : 'Weight'} Trend
        </CardTitle>
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
