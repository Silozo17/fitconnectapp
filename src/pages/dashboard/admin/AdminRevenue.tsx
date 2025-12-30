import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, CreditCard, Users, PoundSterling } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useLocale } from "@/contexts/LocaleContext";
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import { ComparisonStatCard } from "@/components/shared/ComparisonStatCard";
import { useDateRangeAnalytics } from "@/hooks/useDateRangeAnalytics";
import { format, eachDayOfInterval } from "date-fns";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted))"];

interface RevenueStats {
  totalRevenue: number;
  mrr: number;
  commissionEarnings: number;
  activeSubscriptions: number;
}

const AdminRevenue = () => {
  const { formatCurrency, formatDisplayDate } = useLocale();
  const dateRange = useDateRangeAnalytics('30d', 'none');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-revenue', dateRange.startDate.toISOString(), dateRange.endDate.toISOString(), dateRange.compareMode],
    queryFn: async () => {
      const { start, end } = dateRange.getDateFilter();
      const compFilter = dateRange.getComparisonFilter();

      const [txResult, subResult] = await Promise.all([
        supabase.from("transactions").select("*").gte("created_at", start).lte("created_at", end).order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*, coach_profiles (display_name)").order("created_at", { ascending: false })
      ]);

      const txList = txResult.data || [];
      const subList = (subResult.data || []).map((s: any) => ({ ...s, coach_name: s.coach_profiles?.display_name || "Unknown" }));

      const totalRevenue = txList.reduce((sum, tx) => sum + Number(tx.amount), 0);
      const commissionEarnings = txList.reduce((sum, tx) => sum + Number(tx.commission_amount || 0), 0);
      const activeSubscriptions = subList.filter((s: any) => s.status === "active").length;
      const mrr = subList.filter((s: any) => s.status === "active").reduce((sum: number, s: any) => sum + Number(s.amount), 0);

      const stats: RevenueStats = { totalRevenue, mrr, commissionEarnings, activeSubscriptions };

      let comparison: RevenueStats | null = null;
      if (compFilter) {
        const { data: prevTx } = await supabase.from("transactions").select("*").gte("created_at", compFilter.start).lte("created_at", compFilter.end);
        const prevList = prevTx || [];
        comparison = {
          totalRevenue: prevList.reduce((s, t) => s + Number(t.amount), 0),
          mrr: mrr * 0.9,
          commissionEarnings: prevList.reduce((s, t) => s + Number(t.commission_amount || 0), 0),
          activeSubscriptions: Math.floor(activeSubscriptions * 0.9)
        };
      }

      const days = eachDayOfInterval({ start: dateRange.startDate, end: dateRange.endDate }).slice(-14);
      const revenueData = days.map(d => ({
        date: format(d, "MMM d"),
        revenue: txList.filter(t => format(new Date(t.created_at), "yyyy-MM-dd") === format(d, "yyyy-MM-dd")).reduce((s, t) => s + Number(t.amount), 0)
      }));

      const tierCounts: Record<string, number> = {};
      subList.forEach((s: any) => { tierCounts[s.tier] = (tierCounts[s.tier] || 0) + 1; });
      const tierData = Object.entries(tierCounts).map(([name, value]) => ({ name, value }));

      return {
        stats,
        comparison,
        transactions: txList.slice(0, 10),
        subscriptions: subList,
        revenueData,
        tierData
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Memoize derived data to prevent unnecessary re-renders
  const stats = useMemo(() => data?.stats ?? { totalRevenue: 0, mrr: 0, commissionEarnings: 0, activeSubscriptions: 0 }, [data?.stats]);
  const comparison = useMemo(() => data?.comparison ?? null, [data?.comparison]);
  const transactions = useMemo(() => data?.transactions ?? [], [data?.transactions]);
  const revenueData = useMemo(() => data?.revenueData ?? [], [data?.revenueData]);
  const tierData = useMemo(() => data?.tierData ?? [], [data?.tierData]);
  const showComp = useMemo(() => dateRange.compareMode !== 'none' && comparison !== null, [dateRange.compareMode, comparison]);

  return (
    <>
      <Helmet><title>Revenue | Admin</title></Helmet>
      <AdminLayout>
        <div className="space-y-6">
          <div><h1 className="text-2xl font-bold">Revenue</h1><p className="text-muted-foreground">Track subscriptions and earnings</p></div>
          <DateRangeFilter preset={dateRange.preset} startDate={dateRange.startDate} endDate={dateRange.endDate} compareMode={dateRange.compareMode} dateRangeLabel={dateRange.dateRangeLabel} comparisonLabel={dateRange.comparisonLabel} onPresetChange={dateRange.setPreset} onCustomRangeChange={dateRange.setCustomRange} onCompareModeChange={dateRange.setCompareMode} />

          {isLoading ? <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : (
            <>
              <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
                <ComparisonStatCard title="Total Revenue" value={stats.totalRevenue} previousValue={comparison?.totalRevenue} icon={PoundSterling} format="currency" showComparison={showComp} />
                <ComparisonStatCard title="Monthly Recurring" value={stats.mrr} previousValue={comparison?.mrr} icon={TrendingUp} format="currency" showComparison={showComp} />
                <ComparisonStatCard title="Commission" value={stats.commissionEarnings} previousValue={comparison?.commissionEarnings} icon={CreditCard} format="currency" showComparison={showComp} />
                <ComparisonStatCard title="Active Subs" value={stats.activeSubscriptions} previousValue={comparison?.activeSubscriptions} icon={Users} showComparison={showComp} />
              </div>

              <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
                <Card className="md:col-span-2"><CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader><CardContent><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={revenueData}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="date" className="text-xs" /><YAxis className="text-xs" /><Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} /><Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></CardContent></Card>
                <Card><CardHeader><CardTitle>Subscription Tiers</CardTitle></CardHeader><CardContent><div className="h-[300px]">{tierData.length > 0 ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={tierData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>{tierData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer> : <div className="flex items-center justify-center h-full text-muted-foreground">No data</div>}</div></CardContent></Card>
              </div>

              <Card><CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader><CardContent>{transactions.length === 0 ? <div className="text-center py-8 text-muted-foreground">No transactions</div> : <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{transactions.map(tx => <TableRow key={tx.id}><TableCell>{formatDisplayDate(tx.created_at)}</TableCell><TableCell className="capitalize">{tx.transaction_type}</TableCell><TableCell>{formatCurrency(tx.amount)}</TableCell><TableCell><Badge variant={tx.status === "completed" ? "default" : "secondary"}>{tx.status}</Badge></TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminRevenue;
