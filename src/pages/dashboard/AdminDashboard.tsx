import { useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Settings2, Loader2 } from "lucide-react";
import { useAdminWidgets, useDashboardStats } from "@/hooks/useAdminWidgets";
import { StatWidget } from "@/components/admin/widgets/StatWidget";
import { ActivityWidget } from "@/components/admin/widgets/ActivityWidget";
import { QuickActionsWidget } from "@/components/admin/widgets/QuickActionsWidget";
import { ListWidget } from "@/components/admin/widgets/ListWidget";
import { DashboardCustomizer } from "@/components/admin/DashboardCustomizer";

const AdminDashboard = () => {
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const { data: widgets, isLoading: widgetsLoading } = useAdminWidgets();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  const isLoading = widgetsLoading || statsLoading;

  const visibleWidgets = widgets?.filter(w => w.is_visible) || [];

  const renderWidget = (widget: any) => {
    switch (widget.widget_type) {
      case "stats_users":
        return <StatWidget key={widget.id} type="stats_users" title="Total Users" value={stats?.totalUsers || 0} />;
      case "stats_coaches":
        return <StatWidget key={widget.id} type="stats_coaches" title="Active Coaches" value={stats?.totalCoaches || 0} />;
      case "stats_sessions":
        return <StatWidget key={widget.id} type="stats_sessions" title="Scheduled Sessions" value={stats?.activeSessions || 0} />;
      case "stats_revenue":
        return <StatWidget key={widget.id} type="stats_revenue" title="Monthly Revenue" value={stats?.monthlyRevenue || 0} />;
      case "recent_activity":
        return <ActivityWidget key={widget.id} activities={stats?.recentActivity || []} />;
      case "quick_actions":
        return <QuickActionsWidget key={widget.id} />;
      case "pending_verifications":
        return <ListWidget key={widget.id} type="pending_verifications" items={stats?.pendingVerifications || []} />;
      case "recent_signups":
        return <ListWidget key={widget.id} type="recent_signups" items={stats?.recentSignups || []} />;
      default:
        return null;
    }
  };

  const statWidgets = visibleWidgets.filter(w => w.widget_type.startsWith("stats_"));
  const otherWidgets = visibleWidgets.filter(w => !w.widget_type.startsWith("stats_"));

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | FitConnect</title>
        <meta name="description" content="FitConnect admin dashboard for platform management" />
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Platform overview and management</p>
            </div>
            <Button variant="outline" onClick={() => setCustomizerOpen(true)}>
              <Settings2 className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statWidgets.map(renderWidget)}
              </div>

              {/* Other Widgets Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {otherWidgets.map(renderWidget)}
              </div>
            </>
          )}
        </div>

        <DashboardCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;
