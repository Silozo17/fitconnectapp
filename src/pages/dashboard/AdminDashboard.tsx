import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Dumbbell, DollarSign, Calendar, UserPlus, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCoaches: 0,
    activeSessions: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [clientsRes, coachesRes, sessionsRes] = await Promise.all([
      supabase.from("client_profiles").select("id", { count: "exact", head: true }),
      supabase.from("coach_profiles").select("id", { count: "exact", head: true }),
      supabase.from("coaching_sessions").select("id", { count: "exact", head: true }).eq("status", "scheduled"),
    ]);

    setStats({
      totalUsers: clientsRes.count || 0,
      totalCoaches: coachesRes.count || 0,
      activeSessions: sessionsRes.count || 0,
    });
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      description: "Registered clients",
      icon: Users,
      color: "text-blue-500",
      link: "/dashboard/admin/users",
    },
    {
      title: "Active Coaches",
      value: stats.totalCoaches.toString(),
      description: "Verified coaches",
      icon: Dumbbell,
      color: "text-orange-500",
      link: "/dashboard/admin/coaches",
    },
    {
      title: "Scheduled Sessions",
      value: stats.activeSessions.toString(),
      description: "Upcoming sessions",
      icon: Calendar,
      color: "text-green-500",
      link: "#",
    },
    {
      title: "Revenue",
      value: "$0",
      description: "This month",
      icon: DollarSign,
      color: "text-primary",
      link: "#",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | FitConnect</title>
        <meta name="description" content="FitConnect admin dashboard for platform management" />
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Platform overview and management</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Link key={stat.title} to={stat.link}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  to="/dashboard/admin/users"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <UserPlus className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Manage Users</p>
                    <p className="text-sm text-muted-foreground">View and edit client accounts</p>
                  </div>
                </Link>
                <Link
                  to="/dashboard/admin/coaches"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Dumbbell className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Manage Coaches</p>
                    <p className="text-sm text-muted-foreground">Review and approve coaches</p>
                  </div>
                </Link>
                <Link
                  to="/dashboard/admin/settings"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Platform Settings</p>
                    <p className="text-sm text-muted-foreground">Configure platform options</p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <p className="text-sm">Platform is running smoothly</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <p className="text-sm">
                      {stats.totalUsers} user{stats.totalUsers !== 1 ? "s" : ""} registered
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <p className="text-sm">
                      {stats.totalCoaches} coach{stats.totalCoaches !== 1 ? "es" : ""} active
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;
