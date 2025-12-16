import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ConnectionRequests from "@/components/dashboard/coach/ConnectionRequests";
import { ProfileCompletionCard } from "@/components/dashboard/coach/ProfileCompletionCard";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { supabase } from "@/integrations/supabase/client";

interface CoachStats {
  activeClients: number;
  sessionsThisWeek: number;
  unreadMessages: number;
  averageRating: number;
  totalReviews: number;
}

interface UpcomingSession {
  id: string;
  client: string;
  type: string;
  time: string;
  avatar: string;
}

const CoachOverview = () => {
  const { user } = useAuth();
  const { profileId, isRoleSwitching, userId } = useActiveProfile();
  const [coachProfileId, setCoachProfileId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [stats, setStats] = useState<CoachStats>({
    activeClients: 0,
    sessionsThisWeek: 0,
    unreadMessages: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Determine which profile ID to use
      let profileIdToUse = coachProfileId;

      // If we're role switching as admin, use the active profile ID directly
      if (isRoleSwitching && profileId) {
        profileIdToUse = profileId;
      }

      // If we don't have a profile ID yet, fetch it
      if (!profileIdToUse && userId) {
        const { data: profile } = await supabase
          .from("coach_profiles")
          .select("id, display_name")
          .eq("user_id", userId)
          .maybeSingle();

        if (!profile) return;

        profileIdToUse = profile.id;
        setCoachProfileId(profile.id);
        setDisplayName(profile.display_name || "");
      }

      if (!profileIdToUse) return;

      // If role switching, fetch display name separately
      if (isRoleSwitching && profileId) {
        const { data: profile } = await supabase
          .from("coach_profiles")
          .select("display_name")
          .eq("id", profileId)
          .maybeSingle();
        
        if (profile) {
          setDisplayName(profile.display_name || "");
        }
      }

      // Calculate week boundaries
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      // Fetch all stats in parallel
      const [clients, sessions, messages, reviews, upcoming] = await Promise.all([
        supabase
          .from("coach_clients")
          .select("id", { count: "exact" })
          .eq("coach_id", profileIdToUse)
          .eq("status", "active"),
        supabase
          .from("coaching_sessions")
          .select("id", { count: "exact" })
          .eq("coach_id", profileIdToUse)
          .gte("scheduled_at", startOfWeek.toISOString())
          .lt("scheduled_at", endOfWeek.toISOString()),
        supabase
          .from("messages")
          .select("id", { count: "exact" })
          .eq("receiver_id", profileIdToUse)
          .is("read_at", null),
        supabase
          .from("reviews")
          .select("rating")
          .eq("coach_id", profileIdToUse),
        supabase
          .from("coaching_sessions")
          .select(`
            id,
            scheduled_at,
            session_type,
            client:client_profiles(first_name, last_name)
          `)
          .eq("coach_id", profileIdToUse)
          .eq("status", "scheduled")
          .gte("scheduled_at", new Date().toISOString())
          .order("scheduled_at", { ascending: true })
          .limit(3),
      ]);

      // Calculate average rating
      let avgRating = 0;
      if (reviews.data && reviews.data.length > 0) {
        const total = reviews.data.reduce((sum, r) => sum + r.rating, 0);
        avgRating = total / reviews.data.length;
      }

      setStats({
        activeClients: clients.count || 0,
        sessionsThisWeek: sessions.count || 0,
        unreadMessages: messages.count || 0,
        averageRating: avgRating,
        totalReviews: reviews.data?.length || 0,
      });

      // Format upcoming sessions
      if (upcoming.data) {
        const formattedSessions = upcoming.data.map((session: any) => {
          const client = session.client;
          const firstName = client?.first_name || "";
          const lastName = client?.last_name || "";
          const fullName = `${firstName} ${lastName}`.trim() || "Unknown Client";
          const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "??";
          
          const sessionDate = new Date(session.scheduled_at);
          const isToday = sessionDate.toDateString() === now.toDateString();
          const isTomorrow = sessionDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
          
          let timeString = "";
          if (isToday) {
            timeString = `Today, ${sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          } else if (isTomorrow) {
            timeString = `Tomorrow, ${sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          } else {
            timeString = sessionDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          }

          return {
            id: session.id,
            client: fullName,
            type: session.session_type || "Session",
            time: timeString,
            avatar: initials,
          };
        });
        setUpcomingSessions(formattedSessions);
      }
    };

    fetchData();
  }, [userId, profileId, isRoleSwitching, coachProfileId]);

  return (
    <DashboardLayout title="Overview" description="Manage your coaching business from your dashboard.">
      {/* Welcome & Quick Stats */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Welcome back{displayName ? `, ${displayName}` : ""}!
        </h1>
        <p className="text-muted-foreground">Here's what's happening with your coaching business today.</p>
      </div>

      {/* Profile Completion */}
      <ProfileCompletionCard />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-elevated p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            {stats.activeClients > 0 && (
              <span className="text-xs text-success flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Active
              </span>
            )}
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{stats.activeClients}</p>
          <p className="text-sm text-muted-foreground">Active Clients</p>
        </div>

        <div className="card-elevated p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> This week
            </span>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{stats.sessionsThisWeek}</p>
          <p className="text-sm text-muted-foreground">Sessions Scheduled</p>
        </div>

        <div className="card-elevated p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-warning" />
            </div>
            {stats.unreadMessages > 0 && (
              <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
                {stats.unreadMessages}
              </span>
            )}
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{stats.unreadMessages}</p>
          <p className="text-sm text-muted-foreground">Unread Messages</p>
        </div>

        <div className="card-elevated p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-success" />
            </div>
            {stats.totalReviews > 0 && (
              <span className="text-xs text-muted-foreground">
                {stats.totalReviews} reviews
              </span>
            )}
          </div>
          <p className="text-3xl font-display font-bold text-foreground">
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
          </p>
          <p className="text-sm text-muted-foreground">Average Rating</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-dashed">
          <Plus className="w-5 h-5" />
          <span className="text-sm">Add Client</span>
        </Button>
        <Link to="/dashboard/coach/schedule">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-dashed">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">Set Availability</span>
          </Button>
        </Link>
        <Link to="/dashboard/coach/plans">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-dashed">
            <Plus className="w-5 h-5" />
            <span className="text-sm">Create Plan</span>
          </Button>
        </Link>
        <Link to="/dashboard/coach/messages">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-dashed">
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm">Send Message</span>
          </Button>
        </Link>
      </div>

      {/* Connection Requests */}
      <div className="mb-6">
        <ConnectionRequests />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="card-elevated">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-bold text-foreground">Upcoming Sessions</h2>
            <Link to="/dashboard/coach/schedule">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
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
            ))}
          </div>
          {upcomingSessions.length === 0 && (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No upcoming sessions</p>
            </div>
          )}
        </div>

        {/* Reviews Summary */}
        <div className="card-elevated">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-bold text-foreground">Your Reviews</h2>
            <Link to="/dashboard/coach/reviews">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-8 h-8 text-warning fill-warning" />
                <span className="text-4xl font-bold text-foreground">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
                </span>
              </div>
              <div className="text-muted-foreground">
                <p className="text-sm">{stats.totalReviews} total reviews</p>
              </div>
            </div>
            {stats.totalReviews === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No reviews yet. Complete sessions to start receiving feedback!
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoachOverview;
