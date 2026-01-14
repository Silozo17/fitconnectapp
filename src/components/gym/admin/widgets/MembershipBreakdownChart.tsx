import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface MembershipBreakdownChartProps {
  data: { name: string; value: number; color?: string }[];
  isLoading?: boolean;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function MembershipBreakdownChart({ data, isLoading }: MembershipBreakdownChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChart className="h-5 w-5" />
          Membership Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse h-32 w-32 rounded-full bg-muted" />
          </div>
        ) : data.length > 0 ? (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Members']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-center">
            <PieChart className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No membership data</p>
          </div>
        )}
        
        {/* Legend */}
        {data.length > 0 && (
          <div className="mt-4 space-y-1">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }} 
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm border-t pt-1 mt-2">
              <span className="font-medium">Total</span>
              <span className="font-bold">{total}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
