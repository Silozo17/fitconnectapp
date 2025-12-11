import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dumbbell, Search, Calendar, MessageSquare, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface ClientProfile {
  first_name: string | null;
  onboarding_completed: boolean;
}

const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("client_profiles")
        .select("first_name, onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data && !data.onboarding_completed) {
        navigate("/onboarding/client");
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

  return (
    <>
      <Helmet>
        <title>Dashboard | FitConnect</title>
        <meta name="description" content="Your personal fitness dashboard. Track progress, connect with coaches, and achieve your goals." />
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
            <Button variant="ghost" onClick={() => signOut()} className="text-muted-foreground">
              Sign Out
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your fitness journey.</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link to="/coaches" className="card-elevated p-6 hover-lift group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">Find a Coach</h3>
              <p className="text-sm text-muted-foreground">Browse our network of certified professionals</p>
            </Link>

            <div className="card-elevated p-6 opacity-60">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">Upcoming Sessions</h3>
              <p className="text-sm text-muted-foreground">No sessions scheduled yet</p>
            </div>

            <div className="card-elevated p-6 opacity-60">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">Messages</h3>
              <p className="text-sm text-muted-foreground">No new messages</p>
            </div>

            <div className="card-elevated p-6 opacity-60">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">Progress</h3>
              <p className="text-sm text-muted-foreground">Start tracking your journey</p>
            </div>
          </div>

          {/* Empty State */}
          <div className="card-elevated p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              Ready to start your journey?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Find a coach who matches your goals and schedule your first session.
            </p>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/coaches">Browse Coaches</Link>
            </Button>
          </div>
        </main>
      </div>
    </>
  );
};

export default ClientDashboard;
