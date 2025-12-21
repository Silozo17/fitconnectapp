import { useEffect, useState } from "react";
import { Bell, Mail, Smartphone, Clock, Trophy, Users, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNotifications, NotificationPreferences as NotificationPreferencesType } from "@/hooks/useNotifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const NotificationPreferences = () => {
  const { preferences, updatePreferences } = useNotifications();
  const { isDespia, isRegistered } = usePushNotifications();
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferencesType | null>(preferences);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const handleToggle = async (key: string, value: boolean) => {
    if (!localPrefs) return;

    setLocalPrefs({ ...localPrefs, [key]: value } as NotificationPreferencesType);
    setSaving(true);

    const { error } = await updatePreferences({ [key]: value });

    setSaving(false);
    if (error) {
      toast.error("Failed to update preferences");
      setLocalPrefs(preferences);
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

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Push Notifications
            {isDespia && isRegistered && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Native Push Active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {isDespia 
              ? "Choose which push notifications to receive on your device"
              : "Choose which notifications appear in the notification center"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Booking notifications</Label>
              <p className="text-sm text-muted-foreground">
                Notifications for booking requests and updates
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
                Notifications for new messages
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
                Reminder notifications before sessions
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

      {/* Additional Push Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Additional Notifications
          </CardTitle>
          <CardDescription>
            Configure notifications for challenges, achievements, and more
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <div>
                <Label>Challenge notifications</Label>
                <p className="text-sm text-muted-foreground">
                  New challenges, expiring challenges, and completions
                </p>
              </div>
            </div>
            <Switch
              checked={(localPrefs as any).push_challenges ?? true}
              onCheckedChange={(checked) => handleToggle("push_challenges", checked)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <div>
                <Label>Achievement notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Badge unlocks and milestone achievements
                </p>
              </div>
            </div>
            <Switch
              checked={(localPrefs as any).push_achievements ?? true}
              onCheckedChange={(checked) => handleToggle("push_achievements", checked)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <div>
                <Label>Connection notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Friend requests and connection updates
                </p>
              </div>
            </div>
            <Switch
              checked={(localPrefs as any).push_connections ?? true}
              onCheckedChange={(checked) => handleToggle("push_connections", checked)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-500" />
              <div>
                <Label>Daily motivation</Label>
                <p className="text-sm text-muted-foreground">
                  Receive daily motivational messages
                </p>
              </div>
            </div>
            <Switch
              checked={(localPrefs as any).push_motivation ?? true}
              onCheckedChange={(checked) => handleToggle("push_motivation", checked)}
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
