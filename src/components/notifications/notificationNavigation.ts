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
      return role === "coach" 
        ? `${baseRoute}/clients` 
        : `${baseRoute}/coaches`;
    
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
    case "challenge_completed":
    case "level_up":
      return `${baseRoute}/achievements`;
    
    default:
      return null;
  }
};
