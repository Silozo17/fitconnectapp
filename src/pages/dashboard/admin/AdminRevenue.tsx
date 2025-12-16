import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, CreditCard, Users, PoundSterling } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useLocale } from "@/contexts/LocaleContext";
interface RevenueStats {
  totalRevenue: number;
  mrr: number;
  commissionEarnings: number;
  activeSubscriptions: number;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  commission_amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

interface Subscription {
  id: string;
  tier: string;
  amount: number;
  status: string;
  started_at: string;
  coach_name?: string;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted))"];

const AdminRevenue = () => {
  const { formatCurrency, formatDisplayDate } = useLocale();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    mrr: 0,
    commissionEarnings: 0,
    activeSubscriptions: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [tierData, setTierData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (txError) throw txError;
      setTransactions(txData || []);

      // Fetch subscriptions with coach info
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .select(`
          *,
          coach_profiles (display_name)
        `)
        .order("created_at", { ascending: false });

      if (subError) throw subError;
      
      const formattedSubs = (subData || []).map(sub => ({
        ...sub,
        coach_name: sub.coach_profiles?.display_name || "Unknown Coach"
      }));
      setSubscriptions(formattedSubs);

      // Calculate stats
      const totalRevenue = (txData || []).reduce((sum, tx) => sum + Number(tx.amount), 0);
      const commissionEarnings = (txData || []).reduce((sum, tx) => sum + Number(tx.commission_amount || 0), 0);
      const activeSubscriptions = (subData || []).filter(s => s.status === "active").length;
      const mrr = (subData || [])
        .filter(s => s.status === "active")
        .reduce((sum, s) => sum + Number(s.amount), 0);

      setStats({
        totalRevenue,
        mrr,
        commissionEarnings,
        activeSubscriptions,
      });

      // Generate revenue chart data (mock for now, would be aggregated from real data)
      const chartData = generateRevenueChartData(txData || []);
      setRevenueData(chartData);

      // Generate tier distribution data
      const tierCounts: Record<string, number> = {};
      (subData || []).forEach(sub => {
        tierCounts[sub.tier] = (tierCounts[sub.tier] || 0) + 1;
      });
      setTierData(
        Object.entries(tierCounts).map(([name, value]) => ({ name, value }))
      );

    } catch (error: any) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateRevenueChartData = (transactions: Transaction[]) => {
    // Group by date and sum amounts
    const grouped: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
      grouped[key] = 0;
    }

    transactions.forEach(tx => {
      const date = new Date(tx.created_at);
      const key = date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
      if (grouped[key] !== undefined) {
        grouped[key] += Number(tx.amount);
      }
    });

    return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
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
            <h1 className="text-3xl font-bold">Revenue</h1>
            <p className="text-muted-foreground">Track subscriptions, commissions, and earnings</p>
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

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <PoundSterling className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.mrr)}</p>
                  <p className="text-sm text-muted-foreground">Monthly Recurring</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <CreditCard className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.commissionEarnings)}</p>
                  <p className="text-sm text-muted-foreground">Commission</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
                  <p className="text-sm text-muted-foreground">Active Subs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Daily revenue for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Tiers</CardTitle>
              <CardDescription>Distribution by tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {tierData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tierData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {tierData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No subscription data
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest platform transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 10).map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {formatDisplayDate(tx.created_at)}
                      </TableCell>
                      <TableCell className="capitalize">{tx.transaction_type}</TableCell>
                      <TableCell>{tx.description || "—"}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>{formatCurrency(tx.commission_amount || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={tx.status === "completed" ? "default" : "secondary"}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
            <CardDescription>Coach subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No subscriptions yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coach</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.coach_name}</TableCell>
                      <TableCell className="capitalize">{sub.tier}</TableCell>
                      <TableCell>{formatCurrency(sub.amount)}/mo</TableCell>
                      <TableCell>
                        <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDisplayDate(sub.started_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminRevenue;
