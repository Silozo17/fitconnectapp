import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { supabase } from "@/integrations/supabase/client";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { AvatarStatsHero } from "@/components/dashboard/AvatarStatsHero";
import UserConnectionRequests from "@/components/dashboard/client/UserConnectionRequests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  MessageSquare,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  Target,
} from "lucide-react";

interface DashboardStats {
  coachCount: number;
  upcomingSessions: number;
  activePlans: number;
  unreadMessages: number;
}

const ClientOverview = () => {
  const { user } = useAuth();
  const { profileId, isRoleSwitching, userId } = useActiveProfile();
  const [stats, setStats] = useState<DashboardStats>({
    coachCount: 0,
    upcomingSessions: 0,
    activePlans: 0,
    unreadMessages: 0,
  });
  const [firstName, setFirstName] = useState<string>("");
  const [clientProfileId, setClientProfileId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      // Determine which profile ID to use
      let profileIdToUse = clientProfileId;

      // If we're role switching as admin, use the active profile ID directly
      if (isRoleSwitching && profileId) {
        profileIdToUse = profileId;
      }

      // If we don't have a profile ID yet, fetch it
      if (!profileIdToUse && userId) {
        const { data: profile } = await supabase
          .from("client_profiles")
          .select("id, first_name")
          .eq("user_id", userId)
          .maybeSingle();

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

      // Fetch all stats in parallel
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

      setStats({
        coachCount: coaches.count || 0,
        upcomingSessions: sessions.count || 0,
        activePlans: plans.count || 0,
        unreadMessages: messages.count || 0,
      });
    };

    fetchStats();
  }, [userId, profileId, isRoleSwitching, clientProfileId]);

  const quickActions = [
    {
      title: "My Coaches",
      description: `${stats.coachCount} active coach${stats.coachCount !== 1 ? "es" : ""}`,
      icon: Users,
      href: "/dashboard/client/coaches",
      color: "text-blue-500",
    },
    {
      title: "Sessions",
      description: `${stats.upcomingSessions} upcoming`,
      icon: Calendar,
      href: "/dashboard/client/sessions",
      color: "text-green-500",
    },
    {
      title: "Messages",
      description: stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : "All caught up",
      icon: MessageSquare,
      href: "/dashboard/client/messages",
      color: "text-purple-500",
    },
    {
      title: "My Plans",
      description: `${stats.activePlans} active plan${stats.activePlans !== 1 ? "s" : ""}`,
      icon: ClipboardList,
      href: "/dashboard/client/plans",
      color: "text-orange-500",
    },
    {
      title: "Habits",
      description: "Track daily habits",
      icon: Target,
      href: "/dashboard/client/habits",
      color: "text-cyan-500",
    },
    {
      title: "Progress",
      description: "Track your journey",
      icon: TrendingUp,
      href: "/dashboard/client/progress",
      color: "text-pink-500",
    },
  ];

  return (
    <ClientDashboardLayout
      title="Dashboard"
      description="Your fitness journey overview"
    >
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
            <CardTitle>Start Your Fitness Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Connect with a certified fitness coach to create a personalized
              training plan and achieve your goals.
            </p>
            <Button asChild>
              <Link to="/coaches">Find a Coach</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </ClientDashboardLayout>
  );
};

export default ClientOverview;
