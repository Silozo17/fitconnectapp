import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 
  | "plan_assigned"
  | "plan_updated" 
  | "plan_paused"
  | "plan_removed"
  | "plan_reactivated"
  | "session_scheduled"
  | "session_cancelled"
  | "message"
  | "achievement_earned"
  | "badge_earned"
  | "challenge_completed"
  | "level_up"
  | "general";

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: Record<string, unknown>;
}

/**
 * Creates a notification for a user
 */
export async function createNotification({
  userId,
  title,
  message,
  type,
  data = {},
}: CreateNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("notifications").insert([
      {
        user_id: userId,
        title,
        message,
        type,
        data: data as unknown as null,
        read: false,
      },
    ]);

    if (error) {
      console.error("Failed to create notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error creating notification:", err);
    return { success: false, error: "Failed to create notification" };
  }
}

/**
 * Creates a plan-related notification for a client
 */
export async function notifyClientAboutPlanChange({
  clientUserId,
  planName,
  action,
  coachName,
  additionalData = {},
}: {
  clientUserId: string;
  planName: string;
  action: "paused" | "removed" | "reactivated" | "updated";
  coachName: string;
  additionalData?: Record<string, unknown>;
}): Promise<{ success: boolean; error?: string }> {
  const actionMessages = {
    paused: {
      title: "Plan Paused",
      message: `Your plan "${planName}" has been paused by ${coachName}.`,
      type: "plan_paused" as NotificationType,
    },
    removed: {
      title: "Plan Removed",
      message: `Your plan "${planName}" has been removed by ${coachName}.`,
      type: "plan_removed" as NotificationType,
    },
    reactivated: {
      title: "Plan Reactivated",
      message: `Your plan "${planName}" has been reactivated by ${coachName}.`,
      type: "plan_reactivated" as NotificationType,
    },
    updated: {
      title: "Plan Updated",
      message: `Your plan "${planName}" has been updated by ${coachName}.`,
      type: "plan_updated" as NotificationType,
    },
  };

  const { title, message, type } = actionMessages[action];

  return createNotification({
    userId: clientUserId,
    title,
    message,
    type,
    data: {
      planName,
      coachName,
      action,
      ...additionalData,
    },
  });
}
