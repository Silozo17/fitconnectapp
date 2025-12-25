import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCoachLinkPrefix } from "@/hooks/useCoachLinkPrefix";
import { useClientDashboardStats } from "@/hooks/useClientDashboardStats";
import { useUserProfile } from "@/hooks/useUserProfile";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { ProfileBar } from "@/components/dashboard/client/ProfileBar";
import { BMIWidget } from "@/components/dashboard/client/BMIWidget";
import UserConnectionRequests from "@/components/dashboard/client/UserConnectionRequests";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { HorizontalScroll, ScrollItem } from "@/components/ui/horizontal-scroll";
import { IconSquare } from "@/components/ui/icon-square";
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
  Sparkles,
} from "lucide-react";

// Lazy load HealthDataWidget - it has realtime subscriptions that slow initial render
const HealthDataWidget = lazy(() => import("@/components/integrations/HealthDataWidget"));

const HealthWidgetSkeleton = () => (
  <Card variant="elevated" className="mb-6">
    <CardContent className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
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
    </CardContent>
  </Card>
);

const ClientOverview = () => {
  const { t } = useTranslation('dashboard');
  const coachLinkPrefix = useCoachLinkPrefix();
  const { displayName } = useUserProfile();
  
  const { 
    data: stats, 
    isLoading, 
    error, 
    refetch, 
    isRefetching 
  } = useClientDashboardStats();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('client.greeting.morning', 'Good morning');
    if (hour < 18) return t('client.greeting.afternoon', 'Good afternoon');
    return t('client.greeting.evening', 'Good evening');
  };

  const quickActions = [
    {
      title: t('client.quickActions.myCoaches'),
      description: t('client.quickActions.activeCoaches', { count: stats?.coachCount || 0 }),
      icon: Users,
      href: "/dashboard/client/coaches",
      color: "blue" as const,
    },
    {
      title: t('client.quickActions.sessions'),
      description: t('client.quickActions.upcoming', { count: stats?.upcomingSessions || 0 }),
      icon: Calendar,
      href: "/dashboard/client/sessions",
      color: "green" as const,
    },
    {
      title: t('client.quickActions.messages'),
      description: (stats?.unreadMessages || 0) > 0 
        ? t('client.quickActions.unread', { count: stats?.unreadMessages || 0 })
        : t('client.quickActions.allCaughtUp'),
      icon: MessageSquare,
      href: "/dashboard/client/messages",
      color: "purple" as const,
    },
    {
      title: t('client.quickActions.myPlans'),
      description: t('client.quickActions.activePlans', { count: stats?.activePlans || 0 }),
      icon: ClipboardList,
      href: "/dashboard/client/plans",
      color: "orange" as const,
    },
    {
      title: t('client.quickActions.habits'),
      description: t('client.quickActions.trackHabits'),
      icon: Target,
      href: "/dashboard/client/habits",
      color: "cyan" as const,
    },
    {
      title: t('client.quickActions.progress'),
      description: t('client.quickActions.trackJourney'),
      icon: TrendingUp,
      href: "/dashboard/client/progress",
      color: "pink" as const,
    },
  ];

  return (
    <ClientDashboardLayout
      title={t('client.overview.title')}
      description={t('client.overview.description')}
    >
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6 rounded-2xl">
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

      {/* Hero Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
          {getGreeting()}, <span className="gradient-text">{displayName || 'there'}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('client.overview.welcomeBack', "Let's crush your goals today")}
        </p>
      </div>

      {/* Profile Bar with Level/XP */}
      <ProfileBar />

      {/* Today's Health - Lazy loaded */}
      <Suspense fallback={<HealthWidgetSkeleton />}>
        <HealthDataWidget compact className="mb-6" />
      </Suspense>

      {/* BMI Widget */}
      <BMIWidget />

      {/* Friend Requests */}
      <UserConnectionRequests />

      {/* Quick Actions - Horizontal scroll on mobile, grid on desktop */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground font-display">Quick Actions</h2>
        </div>
        
        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden">
          <HorizontalScroll showArrows={false} gap="md">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <ScrollItem key={i} className="w-[200px]">
                  <Card variant="elevated" className="h-full">
                    <CardContent className="p-4">
                      <Skeleton className="h-12 w-12 rounded-xl mb-3" />
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                </ScrollItem>
              ))
            ) : (
              quickActions.map((action) => (
                <ScrollItem key={action.href} className="w-[180px]">
                  <Link to={action.href}>
                    <Card variant="elevated" className="h-full hover:scale-[1.02] transition-transform">
                      <CardContent className="p-4">
                        <IconSquare icon={action.icon} color={action.color} size="md" className="mb-3" />
                        <h3 className="font-semibold text-foreground text-sm">
                          {action.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {action.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </ScrollItem>
              ))
            )}
          </HorizontalScroll>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} variant="elevated">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-14 w-14 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            quickActions.map((action) => (
              <Link key={action.href} to={action.href}>
                <Card variant="elevated" className="h-full group">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <IconSquare icon={action.icon} color={action.color} size="lg" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* CTA Section - Find a Coach */}
      {!isLoading && (stats?.coachCount || 0) === 0 && (
        <Card variant="floating" className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
          
          <CardContent className="relative p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-primary/15">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground font-display mb-2">
                  {t('client.cta.startJourney')}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  {t('client.cta.startJourneyDesc')}
                </p>
                <Button variant="lime" size="lg" asChild>
                  <Link to={coachLinkPrefix}>
                    {t('client.cta.findCoach')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </ClientDashboardLayout>
  );
};

export default ClientOverview;
