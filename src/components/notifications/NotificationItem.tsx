import { formatDistanceToNow } from "date-fns";
import { 
  Calendar, 
  MessageSquare, 
  UserPlus, 
  Star, 
  FileText, 
  CreditCard,
  Bell,
  X,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/hooks/useNotifications";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "booking_request":
    case "booking_confirmed":
    case "booking_cancelled":
    case "session_reminder":
      return Calendar;
    case "message":
    case "new_message": // backward compatibility
      return MessageSquare;
    case "connection_request":
    case "connection_accepted":
      return UserPlus;
    case "review_received":
      return Star;
    case "plan_assigned":
      return FileText;
    case "payment_received":
      return CreditCard;
    case "badge_earned":
    case "achievement_earned":
    case "challenge_completed":
    case "level_up":
      return Trophy;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "booking_request":
    case "booking_confirmed":
    case "session_reminder":
      return "text-primary bg-primary/10";
    case "booking_cancelled":
      return "text-destructive bg-destructive/10";
    case "message":
    case "new_message": // backward compatibility
      return "text-blue-500 bg-blue-500/10";
    case "connection_request":
    case "connection_accepted":
      return "text-green-500 bg-green-500/10";
    case "review_received":
      return "text-amber-500 bg-amber-500/10";
    case "plan_assigned":
      return "text-purple-500 bg-purple-500/10";
    case "payment_received":
      return "text-emerald-500 bg-emerald-500/10";
    case "badge_earned":
    case "achievement_earned":
    case "challenge_completed":
    case "level_up":
      return "text-amber-500 bg-amber-500/10";
    default:
      return "text-muted-foreground bg-muted";
  }
};

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) => {
  const Icon = getNotificationIcon(notification.type);
  const colorClasses = getNotificationColor(notification.type);

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    onClick?.();
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors group",
        notification.read 
          ? "bg-transparent hover:bg-muted/50" 
          : "bg-primary/5 hover:bg-primary/10"
      )}
      onClick={handleClick}
    >
      <div className={cn("p-2 rounded-full shrink-0", colorClasses)}>
        <Icon className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm line-clamp-1",
            !notification.read && "font-semibold"
          )}>
            {notification.title}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>

      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </div>
  );
};
