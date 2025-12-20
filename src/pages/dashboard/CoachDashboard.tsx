import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dumbbell, Users, Calendar, MessageSquare, BarChart3, Loader2, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface CoachProfile {
  display_name: string | null;
  subscription_tier: string | null;
  onboarding_completed: boolean;
}

const CoachDashboard = () => {
  const { t } = useTranslation('dashboard');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("coach_profiles")
        .select("display_name, subscription_tier, onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data && !data.onboarding_completed) {
        navigate("/onboarding/coach");
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const tierKey = profile?.subscription_tier || 'free';
  const tierLabel = t(`coach.tiers.${tierKey}`, { defaultValue: t('coach.tiers.free') });

  return (
    <>
      <Helmet>
        <title>{t('coach.overview.title')} | FitConnect</title>
        <meta name="description" content={t('coach.overview.description')} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">FitConnect</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary">
                {tierLabel}
              </span>
              <Button variant="ghost" onClick={() => signOut()} className="text-muted-foreground">
                {t('header.signOut')}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {profile?.display_name 
                ? t('coach.overview.welcomeWithName', { name: profile.display_name })
                : t('coach.overview.welcome')} 💪
            </h1>
            <p className="text-muted-foreground mt-1">{t('coach.overview.description')}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm">{t('coach.stats.activeClients')}</span>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="font-display text-3xl font-bold text-foreground">0</p>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm">{t('coach.stats.thisWeek')}</span>
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <p className="font-display text-3xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">{t('coach.stats.sessions')}</p>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm">{t('coach.stats.messages')}</span>
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <p className="font-display text-3xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">{t('coach.stats.unread')}</p>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm">{t('coach.stats.revenue')}</span>
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <p className="font-display text-3xl font-bold text-foreground">£0</p>
              <p className="text-sm text-muted-foreground">{t('coach.stats.thisMonth')}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card-elevated p-6 opacity-60">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">{t('coach.quickActions.myClients')}</h3>
              <p className="text-sm text-muted-foreground">{t('coach.quickActions.noClientsYet')}</p>
            </div>

            <div className="card-elevated p-6 opacity-60">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">{t('coach.quickActions.schedule')}</h3>
              <p className="text-sm text-muted-foreground">{t('coach.quickActions.setupAvailability')}</p>
            </div>

            <div className="card-elevated p-6 opacity-60">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">{t('coach.quickActions.settings')}</h3>
              <p className="text-sm text-muted-foreground">{t('coach.quickActions.editProfile')}</p>
            </div>
          </div>

          {/* Empty State */}
          <div className="card-elevated p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              {t('coach.emptyState.title')}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('coach.emptyState.description')}
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              {t('coach.emptyState.setupAvailability')}
            </Button>
          </div>
        </main>
      </div>
    </>
  );
};

export default CoachDashboard;
