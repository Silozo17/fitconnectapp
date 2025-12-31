import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachProfileId } from "@/hooks/useCoachProfileId";
import { subDays, format, differenceInDays } from "date-fns";

export type CheckInPriority = "urgent" | "suggested" | "routine";
export type CheckInReason = 
  | "milestone_reached"
  | "streak_broken"
  | "goal_achieved"
  | "inactivity"
  | "session_followup"
  | "weekly_checkin"
  | "progress_stall"
  | "new_client";

export interface CheckInSuggestion {
  clientId: string;
  clientName: string;
  avatarUrl: string | null;
  priority: CheckInPriority;
  reason: CheckInReason;
  reasonLabel: string;
  messageTemplate: string;
  context: string;
  dueDate: Date;
}

const REASON_LABELS: Record<CheckInReason, string> = {
  milestone_reached: "Milestone Reached 🎉",
  streak_broken: "Streak Broken",
  goal_achieved: "Goal Achieved 🏆",
  inactivity: "Needs Re-engagement",
  session_followup: "Session Follow-up",
  weekly_checkin: "Weekly Check-in",
  progress_stall: "Progress Stalled",
  new_client: "New Client Welcome",
};

const MESSAGE_TEMPLATES: Record<CheckInReason, string> = {
  milestone_reached: "Congratulations on hitting your milestone! Let's talk about your next goals.",
  streak_broken: "I noticed your streak ended. No worries - let's get back on track together!",
  goal_achieved: "Amazing work achieving your goal! Ready to set a new challenge?",
  inactivity: "Hey! Just checking in - how are things going? I'm here if you need anything.",
  session_followup: "Great session! How are you feeling after yesterday's workout?",
  weekly_checkin: "Happy {day}! How's your week going so far?",
  progress_stall: "I've been looking at your progress. Let's chat about adjusting your plan.",
  new_client: "Welcome aboard! I'm excited to work with you. Any questions so far?",
};

export function useSmartCheckInSuggestions() {
  const { user } = useAuth();
  // PERFORMANCE FIX: Use cached profile ID hook
  const { data: coachProfileId } = useCoachProfileId();

  return useQuery({
    queryKey: ["smart-checkin-suggestions", coachProfileId],
    queryFn: async (): Promise<CheckInSuggestion[]> => {
      if (!coachProfileId) return [];

      const suggestions: CheckInSuggestion[] = [];
      const now = new Date();
      const yesterday = format(subDays(now, 1), "yyyy-MM-dd");
      const sevenDaysAgo = subDays(now, 7);

      // PERFORMANCE FIX: Get all data in parallel batch queries instead of N+1
      const [clientsResult, sessionsResult, badgesResult, messagesResult] = await Promise.all([
        // Get active clients
        supabase
          .from("coach_clients")
          .select(`
            client_id,
            created_at,
            client_profiles!coach_clients_client_id_fkey (
              id,
              first_name,
              last_name,
              username,
              avatar_url
            )
          `)
          .eq("coach_id", coachProfileId)
          .eq("status", "active"),
        
        // Get all sessions completed yesterday for all clients in one query
        supabase
          .from("coaching_sessions")
          .select("client_id")
          .eq("coach_id", coachProfileId)
          .eq("status", "completed")
          .gte("scheduled_at", `${yesterday}T00:00:00`)
          .lte("scheduled_at", `${yesterday}T23:59:59`),
        
        // Get all recent badges for all clients in one query
        supabase
          .from("client_badges")
          .select("client_id, earned_at, badges(name)")
          .gte("earned_at", sevenDaysAgo.toISOString())
          .order("earned_at", { ascending: false }),
        
        // Get last message timestamps for all clients (use RPC or aggregate if available)
        // For now, we'll fetch this per-client but batch it
        supabase
          .from("messages")
          .select("sender_id, receiver_id, created_at")
          .gte("created_at", subDays(now, 14).toISOString())
          .order("created_at", { ascending: false }),
      ]);

      const clients = clientsResult.data;
      if (!clients) return [];

      // Build lookup maps for O(1) access
      const sessionsYesterday = new Set(
        sessionsResult.data?.map(s => s.client_id) || []
      );
      
      const recentBadges = new Map<string, { name: string }>();
      for (const badge of badgesResult.data || []) {
        if (!recentBadges.has(badge.client_id)) {
          const badgeData = badge.badges as unknown as { name: string } | null;
          if (badgeData) {
            recentBadges.set(badge.client_id, badgeData);
          }
        }
      }
      
      // Build last message map per client
      const lastMessageDates = new Map<string, Date>();
      for (const msg of messagesResult.data || []) {
        const clientId = msg.sender_id || msg.receiver_id;
        if (clientId && !lastMessageDates.has(clientId)) {
          lastMessageDates.set(clientId, new Date(msg.created_at));
        }
      }

      // Process all clients without additional queries
      for (const client of clients) {
        const profile = client.client_profiles;
        if (!profile) continue;

        const clientName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(" ") || profile.username;

        // Check for new clients (joined in last 3 days)
        const daysSinceJoined = differenceInDays(now, new Date(client.created_at));
        if (daysSinceJoined <= 3) {
          suggestions.push({
            clientId: client.client_id,
            clientName,
            avatarUrl: profile.avatar_url,
            priority: "urgent",
            reason: "new_client",
            reasonLabel: REASON_LABELS.new_client,
            messageTemplate: MESSAGE_TEMPLATES.new_client,
            context: `Joined ${daysSinceJoined === 0 ? "today" : `${daysSinceJoined} days ago`}`,
            dueDate: now,
          });
          continue;
        }

        // Check for sessions completed yesterday (from pre-fetched data)
        if (sessionsYesterday.has(client.client_id)) {
          suggestions.push({
            clientId: client.client_id,
            clientName,
            avatarUrl: profile.avatar_url,
            priority: "suggested",
            reason: "session_followup",
            reasonLabel: REASON_LABELS.session_followup,
            messageTemplate: MESSAGE_TEMPLATES.session_followup,
            context: "Had a session yesterday",
            dueDate: now,
          });
          continue;
        }

        // Check for milestone badges (from pre-fetched data)
        const badge = recentBadges.get(client.client_id);
        if (badge) {
          suggestions.push({
            clientId: client.client_id,
            clientName,
            avatarUrl: profile.avatar_url,
            priority: "suggested",
            reason: "milestone_reached",
            reasonLabel: REASON_LABELS.milestone_reached,
            messageTemplate: MESSAGE_TEMPLATES.milestone_reached,
            context: `Earned "${badge.name}" recently`,
            dueDate: now,
          });
          continue;
        }

        // Check for inactivity (from pre-fetched data)
        const lastMessage = lastMessageDates.get(client.client_id);
        if (lastMessage) {
          const daysSinceMessage = differenceInDays(now, lastMessage);
          if (daysSinceMessage >= 5) {
            suggestions.push({
              clientId: client.client_id,
              clientName,
              avatarUrl: profile.avatar_url,
              priority: daysSinceMessage >= 7 ? "urgent" : "suggested",
              reason: "inactivity",
              reasonLabel: REASON_LABELS.inactivity,
              messageTemplate: MESSAGE_TEMPLATES.inactivity,
              context: `No contact in ${daysSinceMessage} days`,
              dueDate: now,
            });
          }
        }
      }

      // Sort by priority
      const priorityOrder: Record<CheckInPriority, number> = {
        urgent: 0,
        suggested: 1,
        routine: 2,
      };

      return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    },
    enabled: !!coachProfileId,
    staleTime: 5 * 60 * 1000,
  });
}
