import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from "date-fns";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  Activity,
  UserPlus,
  UserMinus,
  Loader2,
} from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export default function GymAdminAnalytics() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym } = useGym();
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  const dateRangeStart = subDays(new Date(), dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90);

  // Fetch analytics data
  const { data: memberStats, isLoading: loadingMembers } = useQuery({
    queryKey: ["gym-analytics-members", gymId, dateRange],
    queryFn: async () => {
      // Total members
      const { count: totalMembers } = await supabase
        .from("gym_members")
        .select("*", { count: "exact", head: true })
        .eq("gym_id", gymId)
        .eq("status", "active");

      // New members in period
      const { count: newMembers } = await supabase
        .from("gym_members")
        .select("*", { count: "exact", head: true })
        .eq("gym_id", gymId)
        .gte("created_at", dateRangeStart.toISOString());

      // Active memberships
      const { count: activeMemberships } = await supabase
        .from("gym_memberships")
        .select("*", { count: "exact", head: true })
        .eq("gym_id", gymId)
        .eq("status", "active");

      // Churned (cancelled) in period
      const { count: churnedMembers } = await supabase
        .from("gym_memberships")
        .select("*", { count: "exact", head: true })
        .eq("gym_id", gymId)
        .eq("status", "cancelled")
        .gte("cancelled_at", dateRangeStart.toISOString());

      return {
        totalMembers: totalMembers || 0,
        newMembers: newMembers || 0,
        activeMemberships: activeMemberships || 0,
        churnedMembers: churnedMembers || 0,
      };
    },
    enabled: !!gymId,
  });

  const { data: revenueStats, isLoading: loadingRevenue } = useQuery({
    queryKey: ["gym-analytics-revenue", gymId, dateRange],
    queryFn: async () => {
      const { data: payments } = await supabase
        .from("gym_payments")
        .select("amount, created_at, payment_type")
        .eq("gym_id", gymId)
        .eq("status", "completed")
        .gte("created_at", dateRangeStart.toISOString());

      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const membershipRevenue = payments?.filter(p => p.payment_type === "membership" || p.payment_type === "membership_renewal")
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Group by day for chart
      const revenueByDay = eachDayOfInterval({
        start: dateRangeStart,
        end: new Date(),
      }).map(date => {
        const dayPayments = payments?.filter(p => isSameDay(new Date(p.created_at), date)) || [];
        return {
          date: format(date, "MMM d"),
          revenue: dayPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        };
      });

      return {
        totalRevenue,
        membershipRevenue,
        avgRevenue: totalRevenue / (dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90),
        revenueByDay,
      };
    },
    enabled: !!gymId,
  });

  const { data: checkInStats, isLoading: loadingCheckIns } = useQuery({
    queryKey: ["gym-analytics-checkins", gymId, dateRange],
    queryFn: async () => {
      const { data: checkIns } = await supabase
        .from("gym_check_ins")
        .select("checked_in_at, check_in_method")
        .eq("gym_id", gymId)
        .gte("checked_in_at", dateRangeStart.toISOString());

      const totalCheckIns = checkIns?.length || 0;

      // Group by day for chart
      const checkInsByDay = eachDayOfInterval({
        start: dateRangeStart,
        end: new Date(),
      }).map(date => {
        const dayCheckIns = checkIns?.filter(c => isSameDay(new Date(c.checked_in_at), date)) || [];
        return {
          date: format(date, "MMM d"),
          checkIns: dayCheckIns.length,
        };
      });

      // Group by hour for peak times
      const checkInsByHour = Array.from({ length: 24 }, (_, hour) => {
        const hourCheckIns = checkIns?.filter(c => new Date(c.checked_in_at).getHours() === hour) || [];
        return {
          hour: format(new Date().setHours(hour, 0, 0, 0), "ha"),
          checkIns: hourCheckIns.length,
        };
      });

      return {
        totalCheckIns,
        avgDaily: totalCheckIns / (dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90),
        checkInsByDay,
        checkInsByHour,
      };
    },
    enabled: !!gymId,
  });

  const { data: planDistribution } = useQuery({
    queryKey: ["gym-analytics-plans", gymId],
    queryFn: async () => {
      const { data: memberships } = await supabase
        .from("gym_memberships")
        .select("plan:membership_plans(name)")
        .eq("gym_id", gymId)
        .eq("status", "active");

      const distribution: Record<string, number> = {};
      memberships?.forEach((m: any) => {
        const planName = m.plan?.name || "Unknown";
        distribution[planName] = (distribution[planName] || 0) + 1;
      });

      return Object.entries(distribution).map(([name, value]) => ({
        name,
        value,
      }));
    },
    enabled: !!gymId,
  });

  const isLoading = loadingMembers || loadingRevenue || loadingCheckIns;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track performance metrics for {gym?.name}
          </p>
        </div>
        <Select value={dateRange} onValueChange={(v: "7d" | "30d" | "90d") => setDateRange(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Members</p>
                    <p className="text-3xl font-bold">{memberStats?.totalMembers}</p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <UserPlus className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">+{memberStats?.newMembers}</span>
                  <span className="ml-1 text-muted-foreground">new this period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-3xl font-bold">
                      £{revenueStats?.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-full bg-green-500/10 p-3">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    £{revenueStats?.avgRevenue.toFixed(2)}/day avg
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Check-Ins</p>
                    <p className="text-3xl font-bold">{checkInStats?.totalCheckIns}</p>
                  </div>
                  <div className="rounded-full bg-blue-500/10 p-3">
                    <Activity className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {checkInStats?.avgDaily.toFixed(1)}/day avg
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Churn Rate</p>
                    <p className="text-3xl font-bold">
                      {memberStats?.activeMemberships
                        ? ((memberStats?.churnedMembers / memberStats.activeMemberships) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div className="rounded-full bg-amber-500/10 p-3">
                    <UserMinus className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingDown className="mr-1 h-4 w-4 text-amber-500" />
                  <span className="text-muted-foreground">
                    {memberStats?.churnedMembers} cancelled
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="revenue" className="space-y-6">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="membership">Membership</TabsTrigger>
            </TabsList>

            {/* Revenue Tab */}
            <TabsContent value="revenue" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>Daily revenue for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueStats?.revenueByDay}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={(v) => `£${v}`} />
                        <Tooltip
                          formatter={(value: number) => [`£${value.toFixed(2)}`, "Revenue"]}
                          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Check-Ins</CardTitle>
                    <CardDescription>Check-ins per day for the selected period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={checkInStats?.checkInsByDay}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip
                            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                          />
                          <Bar dataKey="checkIns" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Peak Hours</CardTitle>
                    <CardDescription>Most popular times for check-ins</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={checkInStats?.checkInsByHour.filter(h => h.checkIns > 0)}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="hour" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip
                            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                          />
                          <Bar dataKey="checkIns" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Membership Tab */}
            <TabsContent value="membership" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Distribution</CardTitle>
                    <CardDescription>Active memberships by plan type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={planDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {planDistribution?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Membership Summary</CardTitle>
                    <CardDescription>Overview of membership status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span>Active Memberships</span>
                      </div>
                      <span className="font-bold">{memberStats?.activeMemberships}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span>New This Period</span>
                      </div>
                      <span className="font-bold">{memberStats?.newMembers}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span>Cancelled</span>
                      </div>
                      <span className="font-bold">{memberStats?.churnedMembers}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-amber-500" />
                        <span>Retention Rate</span>
                      </div>
                      <span className="font-bold">
                        {memberStats?.activeMemberships
                          ? (100 - (memberStats?.churnedMembers / memberStats.activeMemberships) * 100).toFixed(1)
                          : 100}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
