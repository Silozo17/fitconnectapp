import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCoachLinkPrefix } from "@/hooks/useCoachLinkPrefix";
import { useClientDashboardStats } from "@/hooks/useClientDashboardStats";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { AvatarStatsHero } from "@/components/dashboard/AvatarStatsHero";
import UserConnectionRequests from "@/components/dashboard/client/UserConnectionRequests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Calendar,
  MessageSquare,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  Target,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

// Lazy load HealthDataWidget - it has realtime subscriptions that slow initial render
const HealthDataWidget = lazy(() => import("@/components/integrations/HealthDataWidget"));

const HealthWidgetSkeleton = () => (
  <div className="mb-6 rounded-lg border bg-card p-4">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-5 w-32" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  </div>
);

const ClientOverview = () => {
  const { t } = useTranslation('dashboard');
  const coachLinkPrefix = useCoachLinkPrefix();
  
  const { 
    data: stats, 
    isLoading, 
    error, 
    refetch, 
    isRefetching 
  } = useClientDashboardStats();

  const quickActions = [
    {
      title: t('client.quickActions.myCoaches'),
      description: t('client.quickActions.activeCoaches', { count: stats?.coachCount || 0 }),
      icon: Users,
      href: "/dashboard/client/coaches",
      color: "text-blue-500",
    },
    {
      title: t('client.quickActions.sessions'),
      description: t('client.quickActions.upcoming', { count: stats?.upcomingSessions || 0 }),
      icon: Calendar,
      href: "/dashboard/client/sessions",
      color: "text-green-500",
    },
    {
      title: t('client.quickActions.messages'),
      description: (stats?.unreadMessages || 0) > 0 
        ? t('client.quickActions.unread', { count: stats?.unreadMessages || 0 })
        : t('client.quickActions.allCaughtUp'),
      icon: MessageSquare,
      href: "/dashboard/client/messages",
      color: "text-purple-500",
    },
    {
      title: t('client.quickActions.myPlans'),
      description: t('client.quickActions.activePlans', { count: stats?.activePlans || 0 }),
      icon: ClipboardList,
      href: "/dashboard/client/plans",
      color: "text-orange-500",
    },
    {
      title: t('client.quickActions.habits'),
      description: t('client.quickActions.trackHabits'),
      icon: Target,
      href: "/dashboard/client/habits",
      color: "text-cyan-500",
    },
    {
      title: t('client.quickActions.progress'),
      description: t('client.quickActions.trackJourney'),
      icon: TrendingUp,
      href: "/dashboard/client/progress",
      color: "text-pink-500",
    },
  ];

  return (
    <ClientDashboardLayout
      title={t('client.overview.title')}
      description={t('client.overview.description')}
    >
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{t('client.overview.errorLoading')}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isRefetching}
              className="ml-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              {t('client.overview.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Today's Health - Lazy loaded */}
      <Suspense fallback={<HealthWidgetSkeleton />}>
        <HealthDataWidget compact className="mb-6" />
      </Suspense>

      {/* Avatar Stats Hero */}
      <AvatarStatsHero firstName={stats?.firstName || ''} />

      {/* Friend Requests - Deferred rendering */}
      <UserConnectionRequests />

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {isLoading ? (
          // Skeleton loading state for quick actions
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          quickActions.map((action) => (
            <Link key={action.href} to={action.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-muted ${action.color}`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* CTA Section */}
      {!isLoading && (stats?.coachCount || 0) === 0 && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>{t('client.cta.startJourney')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('client.cta.startJourneyDesc')}
            </p>
            <Button asChild>
              <Link to={coachLinkPrefix}>{t('client.cta.findCoach')}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </ClientDashboardLayout>
  );
};

export default ClientOverview;
