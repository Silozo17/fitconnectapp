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

const getSizeClasses = (size: string | null | undefined) => {
  switch (size) {
    case "small":
      return "col-span-1";
    case "medium":
      return "col-span-1 md:col-span-2";
    case "large":
      return "col-span-1 md:col-span-2 lg:col-span-3";
    case "full":
      return "col-span-full";
    default:
      return "col-span-1 md:col-span-2";
  }
};

const AdminDashboard = () => {
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const { data: widgets, isLoading: widgetsLoading } = useAdminWidgets();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  const isLoading = widgetsLoading || statsLoading;

  const visibleWidgets = widgets?.filter(w => w.is_visible) || [];

  const renderWidgetContent = (widget: any) => {
    const widgetType = widget.widget_type as keyof typeof WIDGET_TYPES;
    
    switch (widgetType) {
      // Stats widgets
      case "stats_users":
        return <StatWidget type="stats_users" title="Total Users" value={stats?.totalUsers || 0} size={widget.size} />;
      case "stats_coaches":
        return <StatWidget type="stats_coaches" title="Active Coaches" value={stats?.totalCoaches || 0} size={widget.size} />;
      case "stats_sessions":
        return <StatWidget type="stats_sessions" title="Scheduled Sessions" value={stats?.activeSessions || 0} size={widget.size} />;
      case "stats_revenue":
        return <StatWidget type="stats_revenue" title="Monthly Revenue" value={stats?.monthlyRevenue || 0} size={widget.size} />;
      case "stats_messages":
        return <StatWidget type="stats_messages" title="Total Messages" value={stats?.totalMessages || 0} size={widget.size} />;
      case "stats_reviews":
        return <StatWidget type="stats_reviews" title="Total Reviews" value={stats?.totalReviews || 0} size={widget.size} />;

      // Revenue widgets
      case "revenue_mrr":
        return <RevenueWidget type="revenue_mrr" stats={stats || {}} />;
      case "revenue_commissions":
        return <RevenueWidget type="revenue_commissions" stats={stats || {}} />;
      case "revenue_active_subs":
        return <RevenueWidget type="revenue_active_subs" stats={stats || {}} />;
      case "revenue_tier_distribution":
        return <RevenueWidget type="revenue_tier_distribution" stats={stats || {}} />;

      // Analytics widgets
      case "analytics_growth_rate":
        return <AnalyticsWidget type="analytics_growth_rate" stats={stats || {}} />;
      case "analytics_session_rate":
        return <AnalyticsWidget type="analytics_session_rate" stats={stats || {}} />;
      case "analytics_engagement":
        return <AnalyticsWidget type="analytics_engagement" stats={stats || {}} />;
      case "analytics_coach_ratio":
        return <AnalyticsWidget type="analytics_coach_ratio" stats={stats || {}} />;

      // Chart widgets
      case "chart_signups":
        return <ChartWidget type="area" title="User Signups (7 days)" data={stats?.signupChartData || []} />;
      case "chart_revenue":
        return <ChartWidget type="line" title="Revenue (7 days)" data={stats?.revenueChartData || []} color="hsl(var(--chart-2))" />;
      case "chart_sessions":
        return <ChartWidget type="bar" title="Sessions (7 days)" data={stats?.sessionChartData || []} color="hsl(var(--chart-3))" />;

      // Integration widgets
      case "integration_health":
        return <IntegrationHealthWidget health={(stats?.integrationHealth || []) as any} />;
      case "integration_video":
        return <IntegrationStatWidget type="integration_video" stats={stats?.integrationStats || {}} />;
      case "integration_calendar":
        return <IntegrationStatWidget type="integration_calendar" stats={stats?.integrationStats || {}} />;
      case "integration_wearables":
        return <IntegrationStatWidget type="integration_wearables" stats={stats?.integrationStats || {}} />;
      case "integration_grocery":
        return <IntegrationStatWidget type="integration_grocery" stats={stats?.integrationStats || {}} />;

      // List widgets
      case "recent_activity":
        return <ActivityWidget activities={stats?.recentActivity || []} />;
      case "quick_actions":
        return <QuickActionsWidget />;
      case "pending_verifications":
        return <ListWidget type="pending_verifications" items={stats?.pendingVerifications || []} />;
      case "recent_signups":
        return <ListWidget type="recent_signups" items={stats?.recentSignups || []} />;
      case "recent_transactions":
        return <ListWidget type="recent_transactions" items={stats?.recentTransactions || []} />;
      case "recent_reviews":
        return <ListWidget type="recent_reviews" items={stats?.recentReviews || []} />;
      case "top_coaches":
        return <ListWidget type="top_coaches" items={stats?.topCoaches || []} />;
      case "flagged_documents":
        return <ListWidget type="flagged_documents" items={stats?.flaggedDocuments || []} />;

      default:
        return null;
    }
  };

  const renderWidget = (widget: any) => {
    const content = renderWidgetContent(widget);
    if (!content) return null;

    const sizeClasses = getSizeClasses(widget.size);

    return (
      <div key={widget.id} className={cn(sizeClasses)}>
        {content}
      </div>
    );
  };

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
          ) : visibleWidgets.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {visibleWidgets
                .sort((a, b) => a.position - b.position)
                .map(renderWidget)}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No widgets enabled. Click "Customize" to add widgets.</p>
            </div>
          )}
        </div>

        <DashboardCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;
