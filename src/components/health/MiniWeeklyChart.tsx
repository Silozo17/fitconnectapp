import { useMemo } from "react";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface MiniWeeklyChartProps {
  data: { day: string; value: number }[];
  color: string;
  className?: string;
}

const colorMap: Record<string, { bar: string; barMuted: string }> = {
  blue: { bar: "hsl(217, 91%, 60%)", barMuted: "hsl(217, 91%, 60%, 0.3)" },
  orange: { bar: "hsl(25, 95%, 53%)", barMuted: "hsl(25, 95%, 53%, 0.3)" },
  green: { bar: "hsl(142, 71%, 45%)", barMuted: "hsl(142, 71%, 45%, 0.3)" },
  red: { bar: "hsl(0, 84%, 60%)", barMuted: "hsl(0, 84%, 60%, 0.3)" },
  purple: { bar: "hsl(271, 91%, 65%)", barMuted: "hsl(271, 91%, 65%, 0.3)" },
  cyan: { bar: "hsl(186, 76%, 50%)", barMuted: "hsl(186, 76%, 50%, 0.3)" },
};

export const MiniWeeklyChart = ({ data, color, className }: MiniWeeklyChartProps) => {
  const colors = colorMap[color] || colorMap.blue;
  
  // Find the max value to determine which bar is "today" (last one)
  const todayIndex = data.length - 1;
  
  // Ensure we have data, otherwise show placeholder bars
  const chartData = useMemo(() => {
    if (data.length === 0) {
      return Array.from({ length: 7 }, (_, i) => ({ day: `D${i}`, value: 0 }));
    }
    return data;
  }, [data]);

  return (
    <div className={cn("h-10 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barCategoryGap="20%">
          <Bar dataKey="value" radius={[2, 2, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={index === todayIndex ? colors.bar : colors.barMuted}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
