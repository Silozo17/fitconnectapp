import { useState, useEffect } from "react";
import { useGym } from "@/contexts/GymContext";
import {
  useGymStaffNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  GymStaffNotification,
} from "@/hooks/gym/useGymStaffNotifications";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  User,
  Calendar,
  CreditCard,
  Settings,
  MessageSquare,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const notificationIcons: Record<string, typeof Bell> = {
  check_in_failed: AlertTriangle,
  new_member: User,
  booking: Calendar,
  payment: CreditCard,
  system: Settings,
  message: MessageSquare,
  default: Bell,
};

interface NotificationItemProps {
  notification: GymStaffNotification;
  onMarkRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const Icon = notificationIcons[notification.type] || notificationIcons.default;
  const isUnread = !notification.read;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 border-b last:border-b-0 transition-colors cursor-pointer hover:bg-muted/50",
        isUnread && "bg-primary/5"
      )}
      onClick={() => !notification.read && onMarkRead(notification.id)}
    >
      <div
        className={cn(
          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
          notification.type === "check_in_failed"
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("text-sm font-medium truncate", isUnread && "font-semibold")}>
            {notification.title}
          </p>
          {isUnread && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary" />
          )}
        </div>
        {notification.message && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  );
}

export function GymStaffNotificationCenter() {
  const { gym, staffRecord } = useGym();
  const [open, setOpen] = useState(false);
  
  const { data: notifications = [], refetch: refetchNotifications } =
    useGymStaffNotifications(20);
  const { data: unreadCount = 0, refetch: refetchCount } =
    useUnreadNotificationsCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!gym?.id || !staffRecord?.id) return;

    const channel = supabase
      .channel(`gym-notifications-${staffRecord.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "gym_staff_notifications",
          filter: `staff_id=eq.${staffRecord.id}`,
        },
        (payload) => {
          // Refresh notifications when a new one arrives
          refetchNotifications();
          refetchCount();
          
          // Play notification sound for urgent notifications
          const notification = payload.new as GymStaffNotification;
          if (notification.type === "check_in_failed") {
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gym?.id, staffRecord?.id, refetchNotifications, refetchCount]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Audio play failed, likely due to autoplay restrictions
      });
    } catch {
      // Audio not available
    }
  };

  const handleMarkRead = (notificationId: string) => {
    markRead.mutate(notificationId);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 min-w-5 px-1 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div>
              {unreadNotifications.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                    Unread ({unreadNotifications.length})
                  </div>
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={handleMarkRead}
                    />
                  ))}
                </>
              )}
              
              {readNotifications.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                    Earlier
                  </div>
                  {readNotifications.slice(0, 10).map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={handleMarkRead}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
