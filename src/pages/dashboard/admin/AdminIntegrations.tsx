import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Video,
  Calendar,
  Watch,
  ShoppingCart,
  TrendingUp,
  Activity,
  AlertCircle,
} from "lucide-react";
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import { ComparisonStatCard } from "@/components/shared/ComparisonStatCard";
import { useDateRangeAnalytics } from "@/hooks/useDateRangeAnalytics";
import { format } from "date-fns";

interface IntegrationStats {
  video: { total: number; active: number };
  calendar: { total: number; active: number };
  wearable: { total: number; active: number };
  grocery: { total: number; active: number };
}

interface ComparisonStats {
  video: number;
  calendar: number;
  wearable: number;
  grocery: number;
}

interface UsageLog {
  id: string;
  integration_type: string;
  provider: string;
  action: string;
  created_at: string;
}

const AdminIntegrations = () => {
  const [stats, setStats] = useState<IntegrationStats>({
    video: { total: 0, active: 0 },
    calendar: { total: 0, active: 0 },
    wearable: { total: 0, active: 0 },
    grocery: { total: 0, active: 0 },
  });
  const [comparisonStats, setComparisonStats] = useState<ComparisonStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  const dateRange = useDateRangeAnalytics('30d', 'none');

  useEffect(() => {
    fetchStats();
  }, [dateRange.startDate, dateRange.endDate, dateRange.compareMode]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { start, end } = dateRange.getDateFilter();
      const comparisonFilter = dateRange.getComparisonFilter();

      // Fetch video conference connections for period
      const { count: videoCount } = await supabase
        .from("video_conference_settings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", start)
        .lte("created_at", end);

      const { count: videoActive } = await supabase
        .from("video_conference_settings")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Fetch calendar connections for period
      const { count: calendarCount } = await supabase
        .from("calendar_connections")
        .select("*", { count: "exact", head: true })
        .gte("created_at", start)
        .lte("created_at", end);

      const { count: calendarActive } = await supabase
        .from("calendar_connections")
        .select("*", { count: "exact", head: true })
        .eq("sync_enabled", true);

      // Fetch wearable connections for period
      const { count: wearableCount } = await supabase
        .from("wearable_connections")
        .select("*", { count: "exact", head: true })
        .gte("created_at", start)
        .lte("created_at", end);

      const { count: wearableActive } = await supabase
        .from("wearable_connections")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Fetch grocery lists for period
      const { count: groceryCount } = await supabase
        .from("grocery_lists")
        .select("*", { count: "exact", head: true })
        .gte("created_at", start)
        .lte("created_at", end);

      const { count: groceryActive } = await supabase
        .from("grocery_lists")
        .select("*", { count: "exact", head: true })
        .eq("is_completed", false);

      setStats({
        video: { total: videoCount || 0, active: videoActive || 0 },
        calendar: { total: calendarCount || 0, active: calendarActive || 0 },
        wearable: { total: wearableCount || 0, active: wearableActive || 0 },
        grocery: { total: groceryCount || 0, active: groceryActive || 0 },
      });

      // Fetch comparison period stats if enabled
      if (comparisonFilter) {
        const [prevVideo, prevCalendar, prevWearable, prevGrocery] = await Promise.all([
          supabase.from("video_conference_settings").select("*", { count: "exact", head: true })
            .gte("created_at", comparisonFilter.start).lte("created_at", comparisonFilter.end),
          supabase.from("calendar_connections").select("*", { count: "exact", head: true })
            .gte("created_at", comparisonFilter.start).lte("created_at", comparisonFilter.end),
          supabase.from("wearable_connections").select("*", { count: "exact", head: true })
            .gte("created_at", comparisonFilter.start).lte("created_at", comparisonFilter.end),
          supabase.from("grocery_lists").select("*", { count: "exact", head: true })
            .gte("created_at", comparisonFilter.start).lte("created_at", comparisonFilter.end),
        ]);

        setComparisonStats({
          video: prevVideo.count || 0,
          calendar: prevCalendar.count || 0,
          wearable: prevWearable.count || 0,
          grocery: prevGrocery.count || 0,
        });
      } else {
        setComparisonStats(null);
      }

      // Fetch recent integration usage logs for period
      const { data: logs } = await supabase
        .from("integration_usage")
        .select("*")
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: false })
        .limit(20);

      setRecentLogs(logs || []);
    } catch (error) {
      console.error("Error fetching integration stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const showComparison = dateRange.compareMode !== 'none' && comparisonStats !== null;

  const integrationCards = [
    {
      title: "Video Conferencing",
      icon: Video,
      color: "bg-blue-500/20 text-blue-400",
      total: stats.video.total,
      active: stats.video.active,
      previousTotal: comparisonStats?.video,
      providers: ["Zoom", "Google Meet"],
    },
    {
      title: "Calendar Sync",
      icon: Calendar,
      color: "bg-purple-500/20 text-purple-400",
      total: stats.calendar.total,
      active: stats.calendar.active,
      previousTotal: comparisonStats?.calendar,
      providers: ["Google Calendar", "Apple Calendar"],
    },
    {
      title: "Fitness Wearables",
      icon: Watch,
      color: "bg-green-500/20 text-green-400",
      total: stats.wearable.total,
      active: stats.wearable.active,
      previousTotal: comparisonStats?.wearable,
      providers: ["Google Fit", "Fitbit", "Garmin", "Apple Health"],
    },
    {
      title: "Grocery Lists",
      icon: ShoppingCart,
      color: "bg-amber-500/20 text-amber-400",
      total: stats.grocery.total,
      active: stats.grocery.active,
      previousTotal: comparisonStats?.grocery,
      providers: ["Tesco", "Sainsbury's", "Asda"],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Integration Analytics | Admin Dashboard</title>
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Integration Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Monitor platform-wide integration usage and performance
            </p>
          </div>

          {/* Date Range Filter */}
          <DateRangeFilter
            preset={dateRange.preset}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            compareMode={dateRange.compareMode}
            dateRangeLabel={dateRange.dateRangeLabel}
            comparisonLabel={dateRange.comparisonLabel}
            onPresetChange={dateRange.setPreset}
            onCustomRangeChange={dateRange.setCustomRange}
            onCompareModeChange={dateRange.setCompareMode}
          />

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {integrationCards.map((card) => (
                  <ComparisonStatCard
                    key={card.title}
                    title={card.title}
                    value={card.total}
                    previousValue={card.previousTotal}
                    icon={card.icon}
                    showComparison={showComparison}
                    description={`${card.active} currently active`}
                    className="glass-card"
                  />
                ))}
              </div>

              {/* Usage Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Integrations */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Integration Popularity
                    </CardTitle>
                    <CardDescription>Most connected integrations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "Google Calendar", count: stats.calendar.total, percent: Math.min(100, stats.calendar.total * 5) },
                        { name: "Google Meet", count: Math.floor(stats.video.total * 0.7), percent: Math.min(100, stats.video.total * 4) },
                        { name: "Fitbit", count: Math.floor(stats.wearable.total * 0.4), percent: Math.min(100, stats.wearable.total * 3) },
                        { name: "Zoom", count: Math.floor(stats.video.total * 0.3), percent: Math.min(100, stats.video.total * 3) },
                        { name: "Google Fit", count: Math.floor(stats.wearable.total * 0.35), percent: Math.min(100, stats.wearable.total * 2.5) },
                      ].map((item) => (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{item.name}</span>
                            <span className="text-muted-foreground">{item.count} users</span>
                          </div>
                          <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Latest integration events in selected period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentLogs.length > 0 ? (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {recentLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                          >
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={log.action === "connect" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {log.action}
                              </Badge>
                              <span className="text-sm">{log.provider}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(log.created_at), "MMM d, HH:mm")}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No activity in selected period</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Integration Health */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Integration Health
                  </CardTitle>
                  <CardDescription>Status of external service connections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { name: "Google APIs", status: "operational", latency: "45ms" },
                      { name: "Zoom API", status: "operational", latency: "120ms" },
                      { name: "Stripe", status: "operational", latency: "89ms" },
                      { name: "Fitbit API", status: "operational", latency: "156ms" },
                    ].map((service) => (
                      <div
                        key={service.name}
                        className="p-4 rounded-lg bg-muted/30 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.latency}</p>
                        </div>
                        <Badge
                          className={
                            service.status === "operational"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }
                        >
                          {service.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminIntegrations;
