import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
import ViewSwitcher from "@/components/admin/ViewSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Users, Briefcase, Calendar, MessageSquare, TrendingUp, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { viewMode } = useAdminView();

  const stats = [
    { label: "Total Users", value: "1,234", icon: Users, color: "text-blue-500" },
    { label: "Active Coaches", value: "89", icon: Briefcase, color: "text-orange-500" },
    { label: "Sessions Today", value: "156", icon: Calendar, color: "text-green-500" },
    { label: "Messages", value: "2.4K", icon: MessageSquare, color: "text-purple-500" },
  ];

  const quickActions = [
    { label: "View as Client", description: "Test the client experience", href: "/dashboard/client", icon: Users },
    { label: "View as Coach", description: "Test the coach dashboard", href: "/dashboard/coach", icon: Briefcase },
    { label: "Browse Coaches", description: "See the public coach listing", href: "/coaches", icon: TrendingUp },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | FitConnect</title>
        <meta name="description" content="FitConnect admin dashboard for platform management" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                FitConnect
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <ViewSwitcher />
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.email}. You're viewing in {viewMode} mode.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription>Switch between different views to test the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.href}
                    className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
                  >
                    <action.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-foreground mb-1">{action.label}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Status */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { text: "New coach signed up", time: "2 min ago" },
                    { text: "Session completed", time: "15 min ago" },
                    { text: "New client registration", time: "1 hour ago" },
                    { text: "Plan assigned", time: "2 hours ago" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-foreground">{activity.text}</span>
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Database", status: "Operational", color: "bg-green-500" },
                    { label: "Authentication", status: "Operational", color: "bg-green-500" },
                    { label: "Storage", status: "Operational", color: "bg-green-500" },
                    { label: "Edge Functions", status: "Operational", color: "bg-green-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-foreground">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-sm text-muted-foreground">{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
