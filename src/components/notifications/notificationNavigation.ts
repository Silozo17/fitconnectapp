import type { Notification } from "@/hooks/useNotifications";

export const getNotificationRoute = (
  notification: Notification,
  role: string
): string | null => {
  const baseRoute = role === "client" 
    ? "/dashboard/client" 
    : role === "coach" 
    ? "/dashboard/coach" 
    : "/dashboard/admin";
  
  const data = notification.data || {};
  
  switch (notification.type) {
    case "booking_request":
    case "booking_confirmed":
    case "booking_cancelled":
    case "session_reminder":
      return `${baseRoute}/schedule`;
    
    case "message": {
      const conversationId = data.conversation_id || data.sender_id;
      return conversationId 
        ? `${baseRoute}/messages/${conversationId}`
        : `${baseRoute}/messages`;
    }
    
    case "connection_request":
    case "connection_accepted":
      // Admins don't have a connections page - route to client connections
      if (role === "admin" || role === "manager" || role === "staff") {
        return "/dashboard/client/connections";
      }
      return `${baseRoute}/connections`;
    
    case "review_received":
      return role === "coach" 
        ? `${baseRoute}/reviews` 
        : null;
    
    case "plan_assigned":
      return role === "client" 
        ? `${baseRoute}/plans` 
        : null;
    
    case "payment_received":
      return role === "coach" 
        ? `${baseRoute}/earnings` 
        : null;
    
    case "badge_earned":
    case "achievement_earned":
    case "challenge_completed":
    case "level_up":
      return `${baseRoute}/achievements`;
    
    case "new_challenge":
      return role === "client" 
        ? `${baseRoute}/challenges` 
        : role === "coach"
        ? `${baseRoute}/challenges`
        : null;
    
    case "feedback_update":
      // Users see feedback update notifications - no specific page to navigate to
      return null;
    
    case "showcase_consent_request": {
      // Route client to My Coaches page with coachId to auto-expand consent section
      const coachId = data.coach_id;
      return role === "client" 
        ? `/dashboard/client/coaches${coachId ? `?coachId=${coachId}` : ''}`
        : null;
    }
    
    case "showcase_consent_granted":
    case "showcase_consent_revoked":
      // Route coach to their showcases page
      return role === "coach" 
        ? `${baseRoute}/showcases`
        : null;
    
    default:
      return null;
  }
};
