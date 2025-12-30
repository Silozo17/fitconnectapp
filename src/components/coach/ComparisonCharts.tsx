import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

interface Props {
  data: any[];
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export function ComparisonCharts({ data }: Props) {
  const { t } = useTranslation("coach");

  // Merge all weight data points into a unified timeline
  const allDates = new Set<string>();
  data.forEach((client) => {
    client.weightData?.forEach((d: any) => {
      allDates.add(format(new Date(d.date), "yyyy-MM-dd"));
    });
  });

  const chartData = Array.from(allDates).sort().map((date) => {
    const point: any = { date };
    data.forEach((client, i) => {
      const match = client.weightData?.find((d: any) => format(new Date(d.date), "yyyy-MM-dd") === date);
      point[`client${i}`] = match?.value || null;
    });
    return point;
  });

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("clientComparison.noDataAvailable")}
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => format(new Date(v), "MMM d")}
            className="text-xs"
          />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          {data.map((client, i) => (
            <Line
              key={client.clientId}
              type="monotone"
              dataKey={`client${i}`}
              name={client.clientName}
              stroke={COLORS[i]}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
