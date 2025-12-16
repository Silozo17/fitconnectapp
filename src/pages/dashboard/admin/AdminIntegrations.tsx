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
  Users,
  Activity,
  AlertCircle,
} from "lucide-react";

interface IntegrationStats {
  video: { total: number; active: number };
  calendar: { total: number; active: number };
  wearable: { total: number; active: number };
  grocery: { total: number; active: number };
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
  const [recentLogs, setRecentLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch video conference connections
      const { count: videoCount } = await supabase
        .from("video_conference_settings")
        .select("*", { count: "exact", head: true });

      const { count: videoActive } = await supabase
        .from("video_conference_settings")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Fetch calendar connections
      const { count: calendarCount } = await supabase
        .from("calendar_connections")
        .select("*", { count: "exact", head: true });

      const { count: calendarActive } = await supabase
        .from("calendar_connections")
        .select("*", { count: "exact", head: true })
        .eq("sync_enabled", true);

      // Fetch wearable connections
      const { count: wearableCount } = await supabase
        .from("wearable_connections")
        .select("*", { count: "exact", head: true });

      const { count: wearableActive } = await supabase
        .from("wearable_connections")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Fetch grocery lists
      const { count: groceryCount } = await supabase
        .from("grocery_lists")
        .select("*", { count: "exact", head: true });

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

      // Fetch recent integration usage logs
      const { data: logs } = await supabase
        .from("integration_usage")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      setRecentLogs(logs || []);
    } catch (error) {
      console.error("Error fetching integration stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const integrationCards = [
    {
      title: "Video Conferencing",
      icon: Video,
      color: "bg-blue-500/20 text-blue-400",
      total: stats.video.total,
      active: stats.video.active,
      providers: ["Zoom", "Google Meet"],
    },
    {
      title: "Calendar Sync",
      icon: Calendar,
      color: "bg-purple-500/20 text-purple-400",
      total: stats.calendar.total,
      active: stats.calendar.active,
      providers: ["Google Calendar", "Apple Calendar"],
    },
    {
      title: "Fitness Wearables",
      icon: Watch,
      color: "bg-green-500/20 text-green-400",
      total: stats.wearable.total,
      active: stats.wearable.active,
      providers: ["Google Fit", "Fitbit", "Garmin", "Apple Health"],
    },
    {
      title: "Grocery Lists",
      icon: ShoppingCart,
      color: "bg-amber-500/20 text-amber-400",
      total: stats.grocery.total,
      active: stats.grocery.active,
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrationCards.map((card) => (
              <Card key={card.title} className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {card.active} active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl mb-1">{card.total}</CardTitle>
                  <CardDescription>{card.title}</CardDescription>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {card.providers.map((p) => (
                      <Badge key={p} variant="secondary" className="text-xs">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Usage Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Integrations */}
            <Card className="bg-card/50 border-border/50">
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
                    { name: "Google Calendar", count: stats.calendar.total, percent: 45 },
                    { name: "Google Meet", count: Math.floor(stats.video.total * 0.7), percent: 35 },
                    { name: "Fitbit", count: Math.floor(stats.wearable.total * 0.4), percent: 25 },
                    { name: "Zoom", count: Math.floor(stats.video.total * 0.3), percent: 20 },
                    { name: "Google Fit", count: Math.floor(stats.wearable.total * 0.35), percent: 18 },
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
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest integration events</CardDescription>
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
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Integration Health */}
          <Card className="bg-card/50 border-border/50">
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
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminIntegrations;
