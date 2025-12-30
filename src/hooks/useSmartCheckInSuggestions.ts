import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, format, isToday, isTomorrow, differenceInDays } from "date-fns";

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

  return useQuery({
    queryKey: ["smart-checkin-suggestions", user?.id],
    queryFn: async (): Promise<CheckInSuggestion[]> => {
      if (!user?.id) return [];

      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!coachProfile) return [];

      const suggestions: CheckInSuggestion[] = [];
      const now = new Date();
      const today = format(now, "yyyy-MM-dd");
      const yesterday = format(subDays(now, 1), "yyyy-MM-dd");
      const sevenDaysAgo = subDays(now, 7);

      // Get active clients
      const { data: clients } = await supabase
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
        .eq("coach_id", coachProfile.id)
        .eq("status", "active");

      if (!clients) return [];

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
          continue; // Skip other checks for new clients
        }

        // Check for sessions completed yesterday (follow-up)
        const { data: recentSession } = await supabase
          .from("coaching_sessions")
          .select("id, scheduled_at")
          .eq("client_id", client.client_id)
          .eq("coach_id", coachProfile.id)
          .eq("status", "completed")
          .gte("scheduled_at", `${yesterday}T00:00:00`)
          .lte("scheduled_at", `${yesterday}T23:59:59`)
          .limit(1)
          .maybeSingle();

        if (recentSession) {
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

        // Skip habit checking for now - simplify to avoid type issues
        // Check for milestone badges earned recently
        const { data: recentBadge } = await supabase
          .from("client_badges")
          .select("earned_at, badges(name)")
          .eq("client_id", client.client_id)
          .gte("earned_at", sevenDaysAgo.toISOString())
          .order("earned_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (recentBadge) {
          const badgeData = recentBadge.badges as unknown as { name: string } | null;
          suggestions.push({
            clientId: client.client_id,
            clientName,
            avatarUrl: profile.avatar_url,
            priority: "suggested",
            reason: "milestone_reached",
            reasonLabel: REASON_LABELS.milestone_reached,
            messageTemplate: MESSAGE_TEMPLATES.milestone_reached,
            context: `Earned "${badgeData?.name || "badge"}" recently`,
            dueDate: now,
          });
          continue;
        }

        // Check for inactivity (no messages in 5+ days)
        const { data: lastMessage } = await supabase
          .from("messages")
          .select("created_at")
          .or(`sender_id.eq.${client.client_id},receiver_id.eq.${client.client_id}`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lastMessage) {
          const daysSinceMessage = differenceInDays(now, new Date(lastMessage.created_at));
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
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}
