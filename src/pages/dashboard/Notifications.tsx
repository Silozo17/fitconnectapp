import { useState } from "react";
import { Bell, CheckCheck, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import AdminLayout from "@/components/admin/AdminLayout";

const NOTIFICATION_TYPES = [
  { value: "all", label: "All Notifications" },
  { value: "booking_request", label: "Booking Requests" },
  { value: "booking_confirmed", label: "Bookings Confirmed" },
  { value: "session_reminder", label: "Session Reminders" },
  { value: "new_message", label: "Messages" },
  { value: "connection_request", label: "Connection Requests" },
  { value: "review_received", label: "Reviews" },
  { value: "plan_assigned", label: "Plans Assigned" },
  { value: "payment_received", label: "Payments" },
];

const NotificationsContent = () => {
  const [filter, setFilter] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const filteredNotifications = notifications.filter((n) => {
    if (filter !== "all" && n.type !== filter) return false;
    if (showUnreadOnly && n.read) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` 
              : "You're all caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Notifications
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
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
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              >
                Unread only
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No notifications found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter !== "all" || showUnreadOnly
                  ? "Try adjusting your filters"
                  : "We'll notify you when something happens"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Notifications = () => {
  const { role } = useAuth();

  if (role === "client") {
    return (
      <ClientDashboardLayout title="Notifications" description="View and manage your notifications">
        <NotificationsContent />
      </ClientDashboardLayout>
    );
  }

  if (role === "admin" || role === "manager" || role === "staff") {
    return (
      <AdminLayout>
        <NotificationsContent />
      </AdminLayout>
    );
  }

  return (
    <DashboardLayout>
      <NotificationsContent />
    </DashboardLayout>
  );
};

export default Notifications;
