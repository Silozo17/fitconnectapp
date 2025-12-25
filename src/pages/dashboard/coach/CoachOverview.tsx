import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  Calendar,
  MessageSquare,
  Clock,
  Plus,
  ArrowRight,
  Star,
  TrendingUp,
  Settings2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientRequests from "@/components/dashboard/coach/ClientRequests";
import { ProfileCompletionCard } from "@/components/dashboard/coach/ProfileCompletionCard";
import { PipelineOverviewCard } from "@/components/dashboard/coach/PipelineOverviewCard";
import { CoachDashboardCustomizer } from "@/components/dashboard/coach/CoachDashboardCustomizer";
import { AddClientModal } from "@/components/dashboard/clients/AddClientModal";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useCoachDashboardStats } from "@/hooks/useCoachDashboardStats";
import { useCoachProfileRealtime } from "@/hooks/useCoachProfileRealtime";

const CoachOverview = () => {
  const { t } = useTranslation("coach");
  // Subscribe to real-time coach profile updates (e.g., tier changes by admin)
  useCoachProfileRealtime();
  const { unreadCount: unreadMessages } = useUnreadMessages();
  const { data, isLoading, error, refetch } = useCoachDashboardStats();
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);

  const stats = data?.stats;
  const upcomingSessions = data?.upcomingSessions || [];

  return (
    <DashboardLayout title={t("dashboard.overview")} description={t("dashboard.description")}>
      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{t("dashboard.failedToLoad")}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("dashboard.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome & Quick Stats */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {t("dashboard.welcomeBack")}{stats?.displayName ? `, ${stats.displayName}` : ""}!
          </h1>
          <p className="text-muted-foreground">{t("dashboard.whatsHappening")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCustomizerOpen(true)}>
          <Settings2 className="w-4 h-4 mr-2" />
          {t("dashboard.customize")}
        </Button>
      </div>

      {/* Profile Completion */}
      <ProfileCompletionCard />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6 hover:shadow-float transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users className="w-7 h-7 text-primary" />
            </div>
            {!isLoading && (stats?.activeClients || 0) > 0 && (
              <span className="text-xs text-success flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {t("stats.active")}
              </span>
            )}
          </div>
          {isLoading ? (
            <Skeleton className="h-9 w-16 mb-1 rounded-xl" />
          ) : (
            <p className="text-3xl font-display font-bold text-foreground">{stats?.activeClients || 0}</p>
          )}
          <p className="text-sm text-muted-foreground">{t("stats.activeClients")}</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6 hover:shadow-float transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {t("stats.thisWeek")}
            </span>
          </div>
          {isLoading ? (
            <Skeleton className="h-9 w-16 mb-1 rounded-xl" />
          ) : (
            <p className="text-3xl font-display font-bold text-foreground">{stats?.sessionsThisWeek || 0}</p>
          )}
          <p className="text-sm text-muted-foreground">{t("stats.sessionsScheduled")}</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6 hover:shadow-float transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-warning" />
            </div>
            {unreadMessages > 0 && (
              <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
                {unreadMessages}
              </span>
            )}
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{unreadMessages}</p>
          <p className="text-sm text-muted-foreground">{t("stats.unreadMessages")}</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6 hover:shadow-float transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
              <Star className="w-7 h-7 text-success" />
            </div>
            {!isLoading && (stats?.totalReviews || 0) > 0 && (
              <span className="text-xs text-muted-foreground">
                {stats?.totalReviews} {t("stats.reviews")}
              </span>
            )}
          </div>
          {isLoading ? (
            <Skeleton className="h-9 w-16 mb-1 rounded-xl" />
          ) : (
            <p className="text-3xl font-display font-bold text-foreground">
              {(stats?.averageRating || 0) > 0 ? stats?.averageRating.toFixed(1) : "—"}
            </p>
          )}
          <p className="text-sm text-muted-foreground">{t("stats.averageRating")}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Button 
          variant="outline" 
          className="h-auto py-5 flex flex-col gap-2 border-dashed rounded-2xl hover:bg-card hover:border-primary/50 transition-all"
          onClick={() => setAddClientOpen(true)}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm">{t("quickActions.addClient")}</span>
        </Button>
        <Link to="/dashboard/coach/schedule">
          <Button variant="outline" className="w-full h-auto py-5 flex flex-col gap-2 border-dashed rounded-2xl hover:bg-card hover:border-primary/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm">{t("quickActions.setAvailability")}</span>
          </Button>
        </Link>
        <Link to="/dashboard/coach/plans">
          <Button variant="outline" className="w-full h-auto py-5 flex flex-col gap-2 border-dashed rounded-2xl hover:bg-card hover:border-primary/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm">{t("quickActions.createPlan")}</span>
          </Button>
        </Link>
        <Link to="/dashboard/coach/messages">
          <Button variant="outline" className="w-full h-auto py-5 flex flex-col gap-2 border-dashed rounded-2xl hover:bg-card hover:border-primary/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm">{t("quickActions.sendMessage")}</span>
          </Button>
        </Link>
      </div>

      {/* Client Requests */}
      <div className="mb-6">
        <ClientRequests />
      </div>

      {/* Pipeline Overview */}
      <PipelineOverviewCard />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <h2 className="font-display font-bold text-foreground">{t("clients.upcomingSessions")}</h2>
            <Link to="/dashboard/coach/schedule">
              <Button variant="ghost" size="sm" className="text-primary rounded-xl">
                {t("common:viewAll")} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2 rounded-lg" />
                    <Skeleton className="h-3 w-24 rounded-lg" />
                  </div>
                </div>
              ))
            ) : (
              upcomingSessions.map((session) => (
                <div key={session.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {session.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{session.client}</p>
                    <p className="text-sm text-muted-foreground">{session.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">{session.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          {!isLoading && upcomingSessions.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{t("dashboard.noUpcomingSessions")}</p>
            </div>
          )}
        </div>

        {/* Reviews Summary */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <h2 className="font-display font-bold text-foreground">{t("dashboard.yourReviews")}</h2>
            <Link to="/dashboard/coach/reviews">
              <Button variant="ghost" size="sm" className="text-primary rounded-xl">
                {t("common:viewAll")} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-8 h-8 text-warning fill-warning" />
                {isLoading ? (
                  <Skeleton className="h-10 w-12 rounded-xl" />
                ) : (
                  <span className="text-4xl font-bold text-foreground">
                    {(stats?.averageRating || 0) > 0 ? stats?.averageRating.toFixed(1) : "—"}
                  </span>
                )}
              </div>
              <div className="text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-4 w-24 rounded-lg" />
                ) : (
                  <p className="text-sm">{stats?.totalReviews || 0} {t("dashboard.totalReviews")}</p>
                )}
              </div>
            </div>
            {!isLoading && (stats?.totalReviews || 0) === 0 && (
              <p className="text-muted-foreground text-center py-4">
                {t("dashboard.noReviewsYet")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CoachDashboardCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
      <AddClientModal open={addClientOpen} onOpenChange={setAddClientOpen} />
    </DashboardLayout>
  );
};

export default CoachOverview;