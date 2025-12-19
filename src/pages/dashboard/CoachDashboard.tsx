import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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

  const tierLabel = profile?.subscription_tier === "founder" 
    ? "Founder" 
    : profile?.subscription_tier === "enterprise" 
    ? "Enterprise" 
    : profile?.subscription_tier === "pro" 
    ? "Pro" 
    : profile?.subscription_tier === "starter" 
    ? "Starter" 
    : "Free";

  return (
    <>
      <Helmet>
        <title>Coach Dashboard | FitConnect</title>
        <meta name="description" content="Manage your coaching business, clients, and schedule." />
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
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome back{profile?.display_name ? `, ${profile.display_name}` : ""}! 💪
            </h1>
            <p className="text-muted-foreground mt-1">Manage your coaching business from here.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm">Active Clients</span>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="font-display text-3xl font-bold text-foreground">0</p>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm">This Week</span>
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <p className="font-display text-3xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">sessions</p>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm">Messages</span>
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <p className="font-display text-3xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">unread</p>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm">Revenue</span>
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <p className="font-display text-3xl font-bold text-foreground">£0</p>
              <p className="text-sm text-muted-foreground">this month</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card-elevated p-6 opacity-60">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">My Clients</h3>
              <p className="text-sm text-muted-foreground">No clients yet</p>
            </div>

            <div className="card-elevated p-6 opacity-60">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">Schedule</h3>
              <p className="text-sm text-muted-foreground">Set up your availability</p>
            </div>

            <div className="card-elevated p-6 opacity-60">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">Settings</h3>
              <p className="text-sm text-muted-foreground">Edit your profile</p>
            </div>
          </div>

          {/* Empty State */}
          <div className="card-elevated p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              Your profile is live!
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Clients can now find you in the marketplace. Set up your availability to start receiving bookings.
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Set Up Availability
            </Button>
          </div>
        </main>
      </div>
    </>
  );
};

export default CoachDashboard;
