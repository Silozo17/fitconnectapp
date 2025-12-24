import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCoachLinkPrefix } from "@/hooks/useCoachLinkPrefix";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { supabase } from "@/integrations/supabase/client";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { AvatarStatsHero } from "@/components/dashboard/AvatarStatsHero";
import UserConnectionRequests from "@/components/dashboard/client/UserConnectionRequests";
import HealthDataWidget from "@/components/integrations/HealthDataWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

interface DashboardStats {
  coachCount: number;
  upcomingSessions: number;
  activePlans: number;
  unreadMessages: number;
}

const ClientOverview = () => {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const { profileId, isRoleSwitching, userId } = useActiveProfile();
  const coachLinkPrefix = useCoachLinkPrefix();
  const [stats, setStats] = useState<DashboardStats>({
    coachCount: 0,
    upcomingSessions: 0,
    activePlans: 0,
    unreadMessages: 0,
  });
  const [firstName, setFirstName] = useState<string>("");
  const [clientProfileId, setClientProfileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchStats = async () => {
    setError(null);
    
    try {
      // Determine which profile ID to use
      let profileIdToUse = clientProfileId;

      // If we're role switching as admin, use the active profile ID directly
      if (isRoleSwitching && profileId) {
        profileIdToUse = profileId;
      }

      // If we don't have a profile ID yet, fetch it
      if (!profileIdToUse && userId) {
        const { data: profile, error: profileError } = await supabase
          .from("client_profiles")
          .select("id, first_name")
          .eq("user_id", userId)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profile) return;

        profileIdToUse = profile.id;
        setClientProfileId(profile.id);
        setFirstName(profile.first_name || "");
      }

      if (!profileIdToUse) return;

      // If role switching, fetch first name separately
      if (isRoleSwitching && profileId) {
        const { data: profile } = await supabase
          .from("client_profiles")
          .select("first_name")
          .eq("id", profileId)
          .maybeSingle();
        
        if (profile) {
          setFirstName(profile.first_name || "");
        }
      }

      // Fetch all stats in parallel with error handling
      const [coaches, sessions, plans, messages] = await Promise.all([
        supabase
          .from("coach_clients")
          .select("id", { count: "exact" })
          .eq("client_id", profileIdToUse)
          .eq("status", "active"),
        supabase
          .from("coaching_sessions")
          .select("id", { count: "exact" })
          .eq("client_id", profileIdToUse)
          .eq("status", "scheduled")
          .gte("scheduled_at", new Date().toISOString()),
        supabase
          .from("plan_assignments")
          .select("id", { count: "exact" })
          .eq("client_id", profileIdToUse)
          .eq("status", "active"),
        supabase
          .from("messages")
          .select("id", { count: "exact" })
          .eq("receiver_id", profileIdToUse)
          .is("read_at", null),
      ]);

      // Check for errors in any of the queries
      if (coaches.error) throw coaches.error;
      if (sessions.error) throw sessions.error;
      if (plans.error) throw plans.error;
      if (messages.error) throw messages.error;

      setStats({
        coachCount: coaches.count || 0,
        upcomingSessions: sessions.count || 0,
        activePlans: plans.count || 0,
        unreadMessages: messages.count || 0,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(t('client.overview.errorLoading'));
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId, profileId, isRoleSwitching, clientProfileId]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await fetchStats();
    setIsRetrying(false);
  };

  const quickActions = [
    {
      title: t('client.quickActions.myCoaches'),
      description: t('client.quickActions.activeCoaches', { count: stats.coachCount }),
      icon: Users,
      href: "/dashboard/client/coaches",
      color: "text-blue-500",
    },
    {
      title: t('client.quickActions.sessions'),
      description: t('client.quickActions.upcoming', { count: stats.upcomingSessions }),
      icon: Calendar,
      href: "/dashboard/client/sessions",
      color: "text-green-500",
    },
    {
      title: t('client.quickActions.messages'),
      description: stats.unreadMessages > 0 
        ? t('client.quickActions.unread', { count: stats.unreadMessages })
        : t('client.quickActions.allCaughtUp'),
      icon: MessageSquare,
      href: "/dashboard/client/messages",
      color: "text-purple-500",
    },
    {
      title: t('client.quickActions.myPlans'),
      description: t('client.quickActions.activePlans', { count: stats.activePlans }),
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
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              disabled={isRetrying}
              className="ml-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {t('client.overview.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Today's Health - Primary focus */}
      <HealthDataWidget compact className="mb-6" />

      {/* Avatar Stats Hero */}
      <AvatarStatsHero firstName={firstName} />

      {/* Friend Requests */}
      <UserConnectionRequests />

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action) => (
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
        ))}
      </div>

      {/* CTA Section */}
      {stats.coachCount === 0 && (
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
