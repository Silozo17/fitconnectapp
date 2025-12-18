import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
import { NotificationItem } from "./NotificationItem";
import { getNotificationRoute } from "./notificationNavigation";
import { cn } from "@/lib/utils";

interface AllNotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NOTIFICATION_TYPES = [
  { value: "all", label: "All Types" },
  { value: "booking_request", label: "Booking Requests" },
  { value: "booking_confirmed", label: "Bookings Confirmed" },
  { value: "booking_cancelled", label: "Bookings Cancelled" },
  { value: "session_reminder", label: "Session Reminders" },
  { value: "message", label: "Messages" },
  { value: "connection_request", label: "Connection Requests" },
  { value: "connection_accepted", label: "Connections Accepted" },
  { value: "review_received", label: "Reviews" },
  { value: "plan_assigned", label: "Plans Assigned" },
  { value: "payment_received", label: "Payments" },
];

export const AllNotificationsModal = ({
  open,
  onOpenChange,
}: AllNotificationsModalProps) => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { activeProfileType } = useAdminView();
  
  // For clients, ALWAYS use "client" - they can't switch views anyway
  // For coaches/admins who can switch, use activeProfileType
  const effectiveRole = role === "client" 
    ? "client" 
    : (activeProfileType || role || "client");
  
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filter, setFilter] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredNotifications = notifications.filter((n) => {
    if (filter !== "all" && n.type !== filter) return false;
    if (showUnreadOnly && n.read) return false;
    return true;
  });

  const handleNotificationClick = (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification) return;

    // Mark as read
    if (!notification.read) {
      markAsRead(notificationId);
    }

    // Get navigation route
    const route = getNotificationRoute(notification, effectiveRole);
    if (route) {
      onOpenChange(false);
      navigate(route);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 gap-0 flex flex-col",
          "h-[100dvh] w-full max-w-full rounded-none border-0",
          "sm:h-auto sm:max-h-[85vh] sm:max-w-lg sm:rounded-lg sm:border"
        )}
      >
        {/* Header */}
        <DialogHeader className="p-4 pb-3 border-b border-border space-y-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                  {unreadCount} unread
                </span>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={markAllAsRead}
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Filters */}
        <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-8 flex-1 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTIFICATION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showUnreadOnly ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs shrink-0"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            Unread only
          </Button>
        </div>

        {/* Notification List */}
        <ScrollArea className="flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <Bell className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                {showUnreadOnly
                  ? "No unread notifications"
                  : filter !== "all"
                  ? "No notifications of this type"
                  : "No notifications yet"}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  onClick={() => handleNotificationClick(notification.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
