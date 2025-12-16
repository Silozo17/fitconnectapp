import { useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Settings2, Loader2 } from "lucide-react";
import { useAdminWidgets, useDashboardStats, WIDGET_TYPES } from "@/hooks/useAdminWidgets";
import { StatWidget } from "@/components/admin/widgets/StatWidget";
import { ActivityWidget } from "@/components/admin/widgets/ActivityWidget";
import { QuickActionsWidget } from "@/components/admin/widgets/QuickActionsWidget";
import { ListWidget } from "@/components/admin/widgets/ListWidget";
import { ChartWidget } from "@/components/admin/widgets/ChartWidget";
import { RevenueWidget } from "@/components/admin/widgets/RevenueWidget";
import { AnalyticsWidget } from "@/components/admin/widgets/AnalyticsWidget";
import { IntegrationHealthWidget } from "@/components/admin/widgets/IntegrationHealthWidget";
import { IntegrationStatWidget } from "@/components/admin/widgets/IntegrationStatWidget";
import { DashboardCustomizer } from "@/components/admin/DashboardCustomizer";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const { data: widgets, isLoading: widgetsLoading } = useAdminWidgets();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  const isLoading = widgetsLoading || statsLoading;

  const visibleWidgets = widgets?.filter(w => w.is_visible) || [];

  const renderWidget = (widget: any) => {
    const widgetType = widget.widget_type as keyof typeof WIDGET_TYPES;
    
    switch (widgetType) {
      // Stats widgets
      case "stats_users":
        return <StatWidget key={widget.id} type="stats_users" title="Total Users" value={stats?.totalUsers || 0} />;
      case "stats_coaches":
        return <StatWidget key={widget.id} type="stats_coaches" title="Active Coaches" value={stats?.totalCoaches || 0} />;
      case "stats_sessions":
        return <StatWidget key={widget.id} type="stats_sessions" title="Scheduled Sessions" value={stats?.activeSessions || 0} />;
      case "stats_revenue":
        return <StatWidget key={widget.id} type="stats_revenue" title="Monthly Revenue" value={stats?.monthlyRevenue || 0} />;
      case "stats_messages":
        return <StatWidget key={widget.id} type="stats_messages" title="Total Messages" value={stats?.totalMessages || 0} />;
      case "stats_reviews":
        return <StatWidget key={widget.id} type="stats_reviews" title="Total Reviews" value={stats?.totalReviews || 0} />;

      // Revenue widgets
      case "revenue_mrr":
        return <RevenueWidget key={widget.id} type="revenue_mrr" stats={stats || {}} />;
      case "revenue_commissions":
        return <RevenueWidget key={widget.id} type="revenue_commissions" stats={stats || {}} />;
      case "revenue_active_subs":
        return <RevenueWidget key={widget.id} type="revenue_active_subs" stats={stats || {}} />;
      case "revenue_tier_distribution":
        return <RevenueWidget key={widget.id} type="revenue_tier_distribution" stats={stats || {}} />;

      // Analytics widgets
      case "analytics_growth_rate":
        return <AnalyticsWidget key={widget.id} type="analytics_growth_rate" stats={stats || {}} />;
      case "analytics_session_rate":
        return <AnalyticsWidget key={widget.id} type="analytics_session_rate" stats={stats || {}} />;
      case "analytics_engagement":
        return <AnalyticsWidget key={widget.id} type="analytics_engagement" stats={stats || {}} />;
      case "analytics_coach_ratio":
        return <AnalyticsWidget key={widget.id} type="analytics_coach_ratio" stats={stats || {}} />;

      // Chart widgets
      case "chart_signups":
        return <ChartWidget key={widget.id} type="area" title="User Signups (7 days)" data={stats?.signupChartData || []} />;
      case "chart_revenue":
        return <ChartWidget key={widget.id} type="line" title="Revenue (7 days)" data={stats?.revenueChartData || []} color="hsl(var(--chart-2))" />;
      case "chart_sessions":
        return <ChartWidget key={widget.id} type="bar" title="Sessions (7 days)" data={stats?.sessionChartData || []} color="hsl(var(--chart-3))" />;

      // Integration widgets
      case "integration_health":
        return <IntegrationHealthWidget key={widget.id} health={(stats?.integrationHealth || []) as any} />;
      case "integration_video":
        return <IntegrationStatWidget key={widget.id} type="integration_video" stats={stats?.integrationStats || {}} />;
      case "integration_calendar":
        return <IntegrationStatWidget key={widget.id} type="integration_calendar" stats={stats?.integrationStats || {}} />;
      case "integration_wearables":
        return <IntegrationStatWidget key={widget.id} type="integration_wearables" stats={stats?.integrationStats || {}} />;
      case "integration_grocery":
        return <IntegrationStatWidget key={widget.id} type="integration_grocery" stats={stats?.integrationStats || {}} />;

      // List widgets
      case "recent_activity":
        return <ActivityWidget key={widget.id} activities={stats?.recentActivity || []} />;
      case "quick_actions":
        return <QuickActionsWidget key={widget.id} />;
      case "pending_verifications":
        return <ListWidget key={widget.id} type="pending_verifications" items={stats?.pendingVerifications || []} />;
      case "recent_signups":
        return <ListWidget key={widget.id} type="recent_signups" items={stats?.recentSignups || []} />;
      case "recent_transactions":
        return <ListWidget key={widget.id} type="recent_transactions" items={stats?.recentTransactions || []} />;
      case "recent_reviews":
        return <ListWidget key={widget.id} type="recent_reviews" items={stats?.recentReviews || []} />;
      case "top_coaches":
        return <ListWidget key={widget.id} type="top_coaches" items={stats?.topCoaches || []} />;
      case "flagged_documents":
        return <ListWidget key={widget.id} type="flagged_documents" items={stats?.flaggedDocuments || []} />;

      default:
        return null;
    }
  };

  // Group widgets by category
  const statWidgets = visibleWidgets.filter(w => w.widget_type.startsWith("stats_"));
  const revenueWidgets = visibleWidgets.filter(w => w.widget_type.startsWith("revenue_"));
  const analyticsWidgets = visibleWidgets.filter(w => w.widget_type.startsWith("analytics_"));
  const chartWidgets = visibleWidgets.filter(w => w.widget_type.startsWith("chart_"));
  const integrationWidgets = visibleWidgets.filter(w => w.widget_type.startsWith("integration_"));
  const listWidgets = visibleWidgets.filter(w => 
    ["recent_activity", "quick_actions", "pending_verifications", "recent_signups", 
     "recent_transactions", "recent_reviews", "top_coaches", "flagged_documents"].includes(w.widget_type)
  );

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
            <div className="space-y-6">
              {/* Stats Grid */}
              {statWidgets.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {statWidgets.map(renderWidget)}
                </div>
              )}

              {/* Revenue Grid */}
              {revenueWidgets.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {revenueWidgets.map(renderWidget)}
                </div>
              )}

              {/* Analytics Grid */}
              {analyticsWidgets.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {analyticsWidgets.map(renderWidget)}
                </div>
              )}

              {/* Charts Grid */}
              {chartWidgets.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {chartWidgets.map(renderWidget)}
                </div>
              )}

              {/* Integrations Grid */}
              {integrationWidgets.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {integrationWidgets.map(renderWidget)}
                </div>
              )}

              {/* Lists Grid */}
              {listWidgets.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {listWidgets.map(renderWidget)}
                </div>
              )}
            </div>
          )}
        </div>

        <DashboardCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;
