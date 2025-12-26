import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCoachLinkPrefix } from "@/hooks/useCoachLinkPrefix";
import { useClientDashboardStats } from "@/hooks/useClientDashboardStats";
import { useUserProfile } from "@/hooks/useUserProfile";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";

import UserConnectionRequests from "@/components/dashboard/client/UserConnectionRequests";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Carousel3D, Carousel3DItem } from "@/components/ui/carousel-3d";
import { IconSquare } from "@/components/ui/icon-square";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
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
  <Card variant="elevated" className="mb-6 rounded-3xl overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center gap-4 mb-5">
        <ShimmerSkeleton className="h-12 w-12 rounded-2xl" />
        <ShimmerSkeleton className="h-5 w-36" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <ShimmerSkeleton className="h-4 w-16" />
            <ShimmerSkeleton className="h-7 w-24" />
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
        <Alert variant="glass" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="flex items-center justify-between">
            <span>{t('client.overview.errorLoading')}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isRefetching}
              className="ml-4 rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              {t('client.overview.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display tracking-tight">
          {getGreeting()}, <span className="gradient-text">{displayName || 'there'}</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {t('client.overview.welcomeBack', "Let's crush your goals today")}
        </p>
      </div>

      {/* Today's Health - Lazy loaded */}
      <Suspense fallback={<HealthWidgetSkeleton />}>
        <HealthDataWidget compact className="mb-6" />
      </Suspense>

      {/* Friend Requests */}
      <UserConnectionRequests />

      {/* Quick Actions - Horizontal scroll on mobile, grid on desktop */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-foreground font-display">Quick Actions</h2>
        </div>
        
        {/* Mobile: 3D Carousel */}
        <div className="md:hidden -mx-5">
          <Carousel3D gap={12}>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Carousel3DItem key={i} className="w-[170px]">
                  <Card variant="elevated" className="h-full rounded-3xl">
                    <CardContent className="p-5">
                      <ShimmerSkeleton className="h-14 w-14 rounded-2xl mb-4" />
                      <ShimmerSkeleton className="h-5 w-24 mb-2" />
                      <ShimmerSkeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                </Carousel3DItem>
              ))
            ) : (
              quickActions.map((action) => (
                <Carousel3DItem key={action.href} className="w-[170px]">
                  <Link to={action.href}>
                    <Card variant="elevated" className="h-full rounded-3xl transition-all duration-200 carousel-dim-overlay">
                      <CardContent className="p-5">
                        <IconSquare icon={action.icon} color={action.color} size="md" className="mb-4" />
                        <h3 className="font-semibold text-foreground">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {action.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </Carousel3DItem>
              ))
            )}
          </Carousel3D>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} variant="elevated" className="rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-5">
                    <ShimmerSkeleton className="h-16 w-16 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <ShimmerSkeleton className="h-5 w-28" />
                      <ShimmerSkeleton className="h-4 w-36" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            quickActions.map((action) => (
              <Link key={action.href} to={action.href}>
                <Card variant="elevated" className="h-full rounded-3xl group hover:shadow-float-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-5">
                      <IconSquare icon={action.icon} color={action.color} size="lg" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg">
                          {action.title}
                        </h3>
                        <p className="text-muted-foreground mt-1">
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
      {!isLoading && (
        <Card variant="floating" className="relative overflow-hidden rounded-3xl">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15 pointer-events-none" />
          
          <CardContent className="relative p-6 md:p-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-2xl bg-primary/15 shadow-glow-sm">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground font-display">
                {t('client.cta.startJourney')}
              </h3>
            </div>
            <p className="text-muted-foreground mb-5 text-base">
              {t('client.cta.startJourneyDesc')}
            </p>
            <Button variant="lime" size="lg" className="w-full rounded-2xl h-12 text-base" asChild>
              <Link to={coachLinkPrefix}>
                {t('client.cta.findCoach')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </ClientDashboardLayout>
  );
};

export default ClientOverview;
