import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, Dumbbell, Calendar, MessageSquare, TrendingUp, Activity, Download, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from "recharts";
import { arrayToCSV, downloadCSV } from "@/lib/csv-export";
import { toast } from "sonner";
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import { ComparisonStatCard } from "@/components/shared/ComparisonStatCard";
import { useDateRangeAnalytics } from "@/hooks/useDateRangeAnalytics";
import { format, eachDayOfInterval } from "date-fns";

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalCoaches: 0, totalSessions: 0, totalMessages: 0, sessionCompletionRate: 0 });
  const [comparison, setComparison] = useState<typeof analytics | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any[]>([]);

  const dateRange = useDateRangeAnalytics('30d', 'none');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange.startDate, dateRange.endDate, dateRange.compareMode]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { start, end } = dateRange.getDateFilter();
      const compFilter = dateRange.getComparisonFilter();

      const [clients, coaches, sessions, messages] = await Promise.all([
        supabase.from("client_profiles").select("id, created_at", { count: "exact" }).gte("created_at", start).lte("created_at", end),
        supabase.from("coach_profiles").select("id, created_at", { count: "exact" }).gte("created_at", start).lte("created_at", end),
        supabase.from("coaching_sessions").select("id, status, created_at", { count: "exact" }).gte("created_at", start).lte("created_at", end),
        supabase.from("messages").select("id, created_at", { count: "exact" }).gte("created_at", start).lte("created_at", end),
      ]);

      const completed = sessions.data?.filter(s => s.status === "completed").length || 0;
      const total = sessions.count || 0;

      setAnalytics({
        totalUsers: clients.count || 0,
        totalCoaches: coaches.count || 0,
        totalSessions: total,
        totalMessages: messages.count || 0,
        sessionCompletionRate: total > 0 ? (completed / total) * 100 : 0,
      });

      if (compFilter) {
        const [pClients, pCoaches, pSessions, pMessages] = await Promise.all([
          supabase.from("client_profiles").select("id", { count: "exact" }).gte("created_at", compFilter.start).lte("created_at", compFilter.end),
          supabase.from("coach_profiles").select("id", { count: "exact" }).gte("created_at", compFilter.start).lte("created_at", compFilter.end),
          supabase.from("coaching_sessions").select("id", { count: "exact" }).gte("created_at", compFilter.start).lte("created_at", compFilter.end),
          supabase.from("messages").select("id", { count: "exact" }).gte("created_at", compFilter.start).lte("created_at", compFilter.end),
        ]);
        setComparison({ totalUsers: pClients.count || 0, totalCoaches: pCoaches.count || 0, totalSessions: pSessions.count || 0, totalMessages: pMessages.count || 0, sessionCompletionRate: 0 });
      } else {
        setComparison(null);
      }

      // Chart data
      const days = eachDayOfInterval({ start: dateRange.startDate, end: dateRange.endDate }).slice(-14);
      setUserGrowthData(days.map(d => ({ date: format(d, "MMM d"), clients: clients.data?.filter(c => format(new Date(c.created_at), "yyyy-MM-dd") === format(d, "yyyy-MM-dd")).length || 0, coaches: coaches.data?.filter(c => format(new Date(c.created_at), "yyyy-MM-dd") === format(d, "yyyy-MM-dd")).length || 0 })));
      setSessionData(days.map(d => ({ date: format(d, "MMM d"), scheduled: sessions.data?.filter(s => format(new Date(s.created_at), "yyyy-MM-dd") === format(d, "yyyy-MM-dd")).length || 0, completed: sessions.data?.filter(s => format(new Date(s.created_at), "yyyy-MM-dd") === format(d, "yyyy-MM-dd") && s.status === "completed").length || 0 })));
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = arrayToCSV(
      [
        { metric: "Total Clients", value: analytics.totalUsers },
        { metric: "Total Coaches", value: analytics.totalCoaches },
        { metric: "Total Sessions", value: analytics.totalSessions },
        { metric: "Messages", value: analytics.totalMessages }
      ],
      [
        { key: "metric", header: "Metric" },
        { key: "value", header: "Value" }
      ]
    );
    downloadCSV(csv, `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`);
    toast.success("Exported");
  };

  const showComp = dateRange.compareMode !== 'none' && comparison !== null;

  return (
    <>
      <Helmet><title>Platform Analytics | Admin</title></Helmet>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div><h1 className="text-2xl font-bold">Platform Analytics</h1><p className="text-muted-foreground">Track platform growth and engagement</p></div>
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export<ChevronDown className="w-4 h-4 ml-2" /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={handleExport}>Export Summary</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
          </div>

          <DateRangeFilter preset={dateRange.preset} startDate={dateRange.startDate} endDate={dateRange.endDate} compareMode={dateRange.compareMode} dateRangeLabel={dateRange.dateRangeLabel} comparisonLabel={dateRange.comparisonLabel} onPresetChange={dateRange.setPreset} onCustomRangeChange={dateRange.setCustomRange} onCompareModeChange={dateRange.setCompareMode} />

          {loading ? <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ComparisonStatCard title="Total Clients" value={analytics.totalUsers} previousValue={comparison?.totalUsers} icon={Users} showComparison={showComp} />
                <ComparisonStatCard title="Total Coaches" value={analytics.totalCoaches} previousValue={comparison?.totalCoaches} icon={Dumbbell} showComparison={showComp} />
                <ComparisonStatCard title="Total Sessions" value={analytics.totalSessions} previousValue={comparison?.totalSessions} icon={Calendar} showComparison={showComp} />
                <ComparisonStatCard title="Messages Sent" value={analytics.totalMessages} previousValue={comparison?.totalMessages} icon={MessageSquare} showComparison={showComp} />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />User Growth</CardTitle><CardDescription>New users over time</CardDescription></CardHeader><CardContent><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={userGrowthData}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="date" className="text-xs" /><YAxis className="text-xs" /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} /><Legend /><Area type="monotone" dataKey="clients" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} name="Clients" /><Area type="monotone" dataKey="coaches" stackId="1" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.6} name="Coaches" /></AreaChart></ResponsiveContainer></div></CardContent></Card>
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary" />Session Activity</CardTitle><CardDescription>Scheduled vs completed</CardDescription></CardHeader><CardContent><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={sessionData}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="date" className="text-xs" /><YAxis className="text-xs" /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} /><Legend /><Bar dataKey="scheduled" fill="hsl(var(--muted-foreground))" name="Scheduled" radius={[4, 4, 0, 0]} /><Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent></Card>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminAnalytics;
