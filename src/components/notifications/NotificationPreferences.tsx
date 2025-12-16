import { useEffect, useState } from "react";
import { Bell, Mail, Smartphone, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotifications } from "@/hooks/useNotifications";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const NotificationPreferences = () => {
  const { preferences, updatePreferences } = useNotifications();
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const handleToggle = async (key: string, value: boolean) => {
    if (!localPrefs) return;

    setLocalPrefs({ ...localPrefs, [key]: value });
    setSaving(true);

    const { error } = await updatePreferences({ [key]: value });

    setSaving(false);
    if (error) {
      toast.error("Failed to update preferences");
      setLocalPrefs(preferences); // Revert on error
    }
  };

  const handleReminderChange = async (value: string) => {
    if (!localPrefs) return;

    const hours = parseInt(value);
    setLocalPrefs({ ...localPrefs, reminder_hours_before: hours });
    setSaving(true);

    const { error } = await updatePreferences({ reminder_hours_before: hours });

    setSaving(false);
    if (error) {
      toast.error("Failed to update preferences");
      setLocalPrefs(preferences);
    }
  };

  if (!localPrefs) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose which notifications you'd like to receive via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Booking notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails for new bookings and confirmations
              </p>
            </div>
            <Switch
              checked={localPrefs.email_bookings}
              onCheckedChange={(checked) => handleToggle("email_bookings", checked)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Message notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails when you get new messages
              </p>
            </div>
            <Switch
              checked={localPrefs.email_messages}
              onCheckedChange={(checked) => handleToggle("email_messages", checked)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Session reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive email reminders before your sessions
              </p>
            </div>
            <Switch
              checked={localPrefs.email_reminders}
              onCheckedChange={(checked) => handleToggle("email_reminders", checked)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Marketing emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive tips, updates, and promotional content
              </p>
            </div>
            <Switch
              checked={localPrefs.email_marketing}
              onCheckedChange={(checked) => handleToggle("email_marketing", checked)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            Choose which notifications appear in the notification center
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Booking notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications for booking requests and updates
              </p>
            </div>
            <Switch
              checked={localPrefs.push_bookings}
              onCheckedChange={(checked) => handleToggle("push_bookings", checked)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Message notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications for new messages
              </p>
            </div>
            <Switch
              checked={localPrefs.push_messages}
              onCheckedChange={(checked) => handleToggle("push_messages", checked)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Session reminders</Label>
              <p className="text-sm text-muted-foreground">
                Show reminder notifications before sessions
              </p>
            </div>
            <Switch
              checked={localPrefs.push_reminders}
              onCheckedChange={(checked) => handleToggle("push_reminders", checked)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reminder Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Reminder Timing
          </CardTitle>
          <CardDescription>
            Choose when to receive session reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Remind me before sessions</Label>
              <p className="text-sm text-muted-foreground">
                How early would you like to be reminded?
              </p>
            </div>
            <Select
              value={String(localPrefs.reminder_hours_before)}
              onValueChange={handleReminderChange}
              disabled={saving}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="12">12 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="48">2 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
