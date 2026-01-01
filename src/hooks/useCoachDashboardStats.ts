import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfileId } from "./useCoachProfileId";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { useAuth } from "@/contexts/AuthContext";
import { getNativeCache, setNativeCache, CACHE_KEYS, CACHE_TTL } from "@/lib/native-cache";

export interface CoachDashboardStats {
  displayName: string;
  activeClients: number;
  sessionsThisWeek: number;
  averageRating: number;
  totalReviews: number;
}

export interface UpcomingSession {
  id: string;
  client: string;
  type: string;
  time: string;
  avatar: string;
}

interface CachedCoachDashboardData {
  stats: CoachDashboardStats;
  upcomingSessions: UpcomingSession[];
}

export const useCoachDashboardStats = () => {
  const { user } = useAuth();
  const { data: coachProfileId } = useCoachProfileId();
  const { profileId, isRoleSwitching } = useActiveProfile();

  // Use profileId when role switching, otherwise coachProfileId
  const effectiveProfileId = isRoleSwitching && profileId ? profileId : coachProfileId;

  return useQuery({
    queryKey: ["coach-dashboard-stats", effectiveProfileId],
    queryFn: async (): Promise<{ stats: CoachDashboardStats; upcomingSessions: UpcomingSession[] }> => {
      if (!effectiveProfileId) throw new Error("No coach profile ID");

      // Calculate week boundaries
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      // Fetch all stats in parallel
      const [profileData, clients, sessions, reviews, upcoming] = await Promise.all([
        supabase
          .from("coach_profiles")
          .select("display_name")
          .eq("id", effectiveProfileId)
          .maybeSingle(),
        supabase
          .from("coach_clients")
          .select("id", { count: "exact" })
          .eq("coach_id", effectiveProfileId)
          .eq("status", "active"),
        supabase
          .from("coaching_sessions")
          .select("id", { count: "exact" })
          .eq("coach_id", effectiveProfileId)
          .gte("scheduled_at", startOfWeek.toISOString())
          .lt("scheduled_at", endOfWeek.toISOString()),
        supabase
          .from("reviews")
          .select("rating")
          .eq("coach_id", effectiveProfileId),
        supabase
          .from("coaching_sessions")
          .select(`
            id,
            scheduled_at,
            session_type,
            client:client_profiles(first_name, last_name)
          `)
          .eq("coach_id", effectiveProfileId)
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

      // Format upcoming sessions
      const formattedSessions: UpcomingSession[] = [];
      if (upcoming.data) {
        for (const session of upcoming.data) {
          const client = session.client as { first_name?: string; last_name?: string } | null;
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

          formattedSessions.push({
            id: session.id,
            client: fullName,
            type: session.session_type || "Session",
            time: timeString,
            avatar: initials,
          });
        }
      }

      const result: CachedCoachDashboardData = {
        stats: {
          displayName: profileData.data?.display_name || "",
          activeClients: clients.count || 0,
          sessionsThisWeek: sessions.count || 0,
          averageRating: avgRating,
          totalReviews: reviews.data?.length || 0,
        },
        upcomingSessions: formattedSessions,
      };

      // Cache for native app cold start optimization
      if (user?.id) {
        setNativeCache(CACHE_KEYS.COACH_DASHBOARD_STATS, result, CACHE_TTL.DASHBOARD_STATS, user.id);
      }

      return result;
    },
    enabled: !!effectiveProfileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Native: Use cached value as placeholder for instant render
    placeholderData: () => {
      if (!user?.id) return undefined;
      return getNativeCache<CachedCoachDashboardData>(CACHE_KEYS.COACH_DASHBOARD_STATS, user.id) ?? undefined;
    },
  });
};
