import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Scale, Percent, Plus, Loader2, BarChart3 } from "lucide-react";

interface ProgressEntry {
  id: string;
  recorded_at: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  notes: string | null;
}

const ClientProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("client_progress")
        .select("id, recorded_at, weight_kg, body_fat_percentage, notes")
        .eq("client_id", profile.id)
        .order("recorded_at", { ascending: true });

      setProgress(data || []);
      setLoading(false);
    };

    fetchProgress();
  }, [user]);

  const chartData = progress.map((entry) => ({
    date: format(new Date(entry.recorded_at), "MMM d"),
    weight: entry.weight_kg,
    bodyFat: entry.body_fat_percentage,
  }));

  const latestEntry = progress[progress.length - 1];
  const previousEntry = progress[progress.length - 2];

  const weightChange =
    latestEntry?.weight_kg && previousEntry?.weight_kg
      ? latestEntry.weight_kg - previousEntry.weight_kg
      : null;

  const bodyFatChange =
    latestEntry?.body_fat_percentage && previousEntry?.body_fat_percentage
      ? latestEntry.body_fat_percentage - previousEntry.body_fat_percentage
      : null;

  return (
    <ClientDashboardLayout
      title="Progress"
      description="Track your fitness progress"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Progress</h1>
          <p className="text-muted-foreground">Track your fitness journey</p>
        </div>
        <Button disabled>
          <Plus className="w-4 h-4 mr-2" />
          Log Progress
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : progress.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No progress data yet</h3>
            <p className="text-muted-foreground">
              Your coach will log your progress measurements during sessions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Scale className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Weight</p>
                    <p className="text-2xl font-bold">
                      {latestEntry?.weight_kg?.toFixed(1) || "-"} kg
                    </p>
                    {weightChange !== null && (
                      <p
                        className={`text-sm ${
                          weightChange < 0 ? "text-green-500" : "text-orange-500"
                        }`}
                      >
                        {weightChange > 0 ? "+" : ""}
                        {weightChange.toFixed(1)} kg
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <Percent className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Body Fat</p>
                    <p className="text-2xl font-bold">
                      {latestEntry?.body_fat_percentage?.toFixed(1) || "-"}%
                    </p>
                    {bodyFatChange !== null && (
                      <p
                        className={`text-sm ${
                          bodyFatChange < 0 ? "text-green-500" : "text-orange-500"
                        }`}
                      >
                        {bodyFatChange > 0 ? "+" : ""}
                        {bodyFatChange.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Entries</p>
                    <p className="text-2xl font-bold">{progress.length}</p>
                    <p className="text-sm text-muted-foreground">total records</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weight Chart */}
          {chartData.some((d) => d.weight) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Weight Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis domain={["auto", "auto"]} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progress
                  .slice(-5)
                  .reverse()
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm font-medium">
                        {format(new Date(entry.recorded_at), "PPP")}
                      </span>
                      <div className="flex gap-4 text-sm">
                        {entry.weight_kg && (
                          <span className="text-muted-foreground">
                            {entry.weight_kg} kg
                          </span>
                        )}
                        {entry.body_fat_percentage && (
                          <span className="text-muted-foreground">
                            {entry.body_fat_percentage}% BF
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </ClientDashboardLayout>
  );
};

export default ClientProgress;
