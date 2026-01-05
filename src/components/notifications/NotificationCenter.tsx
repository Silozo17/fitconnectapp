import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Settings } from "lucide-react";
import { getNotificationRoute } from "./notificationNavigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { AllNotificationsModal } from "./AllNotificationsModal";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";

export const NotificationCenter = () => {
  const { role } = useAuth();
  const { activeProfileType } = useAdminView();
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const [showAllModal, setShowAllModal] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const navigate = useNavigate();

  // Use activeProfileType if available (for view switching), fallback to role
  const effectiveRole = activeProfileType || role || "client";

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    const route = getNotificationRoute(notification, effectiveRole);
    if (route) {
      setPopoverOpen(false);
      navigate(route);
    }
  };

  const settingsPath = effectiveRole === "client"
    ? "/dashboard/client/settings" 
    : effectiveRole === "coach" 
    ? "/dashboard/coach/settings" 
    : "/dashboard/admin/settings";

  const handleViewAll = () => {
    setPopoverOpen(false);
    setShowAllModal(true);
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end" collisionPadding={16}>
          <div className="flex items-center justify-between p-4 pb-2">
            <h4 className="font-semibold">Notifications</h4>
            <div className="flex items-center gap-1">
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
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link to={settingsPath}>
                  <Settings className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
          <Separator />
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-20">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                <Bell className="w-10 h-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  We'll notify you when something happens
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {notifications.slice(0, 20).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
          <Separator />
          <div className="p-2">
            <Button 
              variant="ghost" 
              className="w-full text-sm" 
              onClick={handleViewAll}
            >
              View all notifications
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <AllNotificationsModal 
        open={showAllModal} 
        onOpenChange={setShowAllModal}
      />
    </>
  );
};
