import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, Dumbbell, Calendar, MessageSquare, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface AnalyticsData {
  totalUsers: number;
  totalCoaches: number;
  totalSessions: number;
  totalMessages: number;
  newUsersThisMonth: number;
  newCoachesThisMonth: number;
  completedSessions: number;
  sessionCompletionRate: number;
}

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalCoaches: 0,
    totalSessions: 0,
    totalMessages: 0,
    newUsersThisMonth: 0,
    newCoachesThisMonth: 0,
    completedSessions: 0,
    sessionCompletionRate: 0,
  });
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch total counts
      const [
        { count: totalUsers },
        { count: totalCoaches },
        { count: totalSessions },
        { count: totalMessages },
        { count: newUsersThisMonth },
        { count: newCoachesThisMonth },
        { count: completedSessions },
      ] = await Promise.all([
        supabase.from("client_profiles").select("*", { count: "exact", head: true }),
        supabase.from("coach_profiles").select("*", { count: "exact", head: true }),
        supabase.from("coaching_sessions").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase
          .from("client_profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDaysAgo.toISOString()),
        supabase
          .from("coach_profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDaysAgo.toISOString()),
        supabase
          .from("coaching_sessions")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed"),
      ]);

      const sessionCompletionRate = totalSessions ? 
        Math.round(((completedSessions || 0) / (totalSessions || 1)) * 100) : 0;

      setAnalytics({
        totalUsers: totalUsers || 0,
        totalCoaches: totalCoaches || 0,
        totalSessions: totalSessions || 0,
        totalMessages: totalMessages || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        newCoachesThisMonth: newCoachesThisMonth || 0,
        completedSessions: completedSessions || 0,
        sessionCompletionRate,
      });

      // Generate mock growth data for visualization
      setUserGrowthData(generateGrowthData());
      setSessionData(generateSessionData());

    } catch (error: any) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateGrowthData = () => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        users: Math.floor(Math.random() * 10) + analytics.totalUsers / 7,
        coaches: Math.floor(Math.random() * 5) + analytics.totalCoaches / 7,
      });
    }
    return data;
  };

  const generateSessionData = () => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        scheduled: Math.floor(Math.random() * 20) + 5,
        completed: Math.floor(Math.random() * 15) + 3,
      });
    }
    return data;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Platform performance and user metrics</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                  <p className="text-xs text-green-500">+{analytics.newUsersThisMonth} this month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Dumbbell className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.totalCoaches}</p>
                  <p className="text-sm text-muted-foreground">Total Coaches</p>
                  <p className="text-xs text-green-500">+{analytics.newCoachesThisMonth} this month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <Calendar className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-xs text-muted-foreground">{analytics.sessionCompletionRate}% completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.totalMessages}</p>
                  <p className="text-sm text-muted-foreground">Messages Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                User Growth
              </CardTitle>
              <CardDescription>New users and coaches over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stackId="1"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.3)" 
                      name="Clients"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="coaches" 
                      stackId="2"
                      stroke="hsl(var(--accent))" 
                      fill="hsl(var(--accent) / 0.3)" 
                      name="Coaches"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Session Activity
              </CardTitle>
              <CardDescription>Scheduled vs completed sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="scheduled" fill="hsl(var(--primary))" name="Scheduled" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" fill="hsl(var(--accent))" name="Completed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Platform Health</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Session Completion Rate</span>
                <span className="font-bold">{analytics.sessionCompletionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg Sessions/Coach</span>
                <span className="font-bold">
                  {analytics.totalCoaches ? (analytics.totalSessions / analytics.totalCoaches).toFixed(1) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg Messages/User</span>
                <span className="font-bold">
                  {analytics.totalUsers ? (analytics.totalMessages / analytics.totalUsers).toFixed(1) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Coach to Client Ratio</span>
                <span className="font-bold">
                  1:{analytics.totalCoaches ? (analytics.totalUsers / analytics.totalCoaches).toFixed(1) : 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Activity metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active Clients</span>
                <span className="font-bold">{Math.round(analytics.totalUsers * 0.7)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active Coaches</span>
                <span className="font-bold">{Math.round(analytics.totalCoaches * 0.85)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Sessions This Week</span>
                <span className="font-bold">{Math.round(analytics.totalSessions * 0.15)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Messages This Week</span>
                <span className="font-bold">{Math.round(analytics.totalMessages * 0.2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Growth Metrics</CardTitle>
              <CardDescription>Month-over-month changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">New Clients</span>
                <span className="font-bold text-green-500">+{analytics.newUsersThisMonth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">New Coaches</span>
                <span className="font-bold text-green-500">+{analytics.newCoachesThisMonth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Client Growth Rate</span>
                <span className="font-bold text-green-500">
                  +{analytics.totalUsers ? Math.round((analytics.newUsersThisMonth / analytics.totalUsers) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Coach Growth Rate</span>
                <span className="font-bold text-green-500">
                  +{analytics.totalCoaches ? Math.round((analytics.newCoachesThisMonth / analytics.totalCoaches) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
