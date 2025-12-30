import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Mail, Smartphone, Clock, Trophy, Users, Sparkles, TrendingUp, UserPlus, RotateCcw } from "lucide-react";
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
  const { t } = useTranslation('settings');
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
      toast.error(t('notifications.failedUpdate'));
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
      toast.error(t('notifications.failedUpdate'));
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
            {t('notifications.email.title')}
          </CardTitle>
          <CardDescription>
            {t('notifications.email.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('notifications.email.bookings')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.email.bookingsDesc')}
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
              <Label>{t('notifications.email.messages')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.email.messagesDesc')}
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
              <Label>{t('notifications.email.reminders')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.email.remindersDesc')}
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
              <Label>{t('notifications.email.marketing')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.email.marketingDesc')}
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
            {t('notifications.push.title')}
            {isDespia && isRegistered && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {t('notifications.push.nativePushActive')}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {isDespia 
              ? t('notifications.push.descriptionNative')
              : t('notifications.push.descriptionWeb')
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('notifications.push.bookings')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.push.bookingsDesc')}
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
              <Label>{t('notifications.push.messages')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.push.messagesDesc')}
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
              <Label>{t('notifications.push.reminders')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.push.remindersDesc')}
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
            {t('notifications.additional.title')}
          </CardTitle>
          <CardDescription>
            {t('notifications.additional.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <div>
                <Label>{t('notifications.additional.challenges')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.additional.challengesDesc')}
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
                <Label>{t('notifications.additional.achievements')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.additional.achievementsDesc')}
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
                <Label>{t('notifications.additional.connections')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.additional.connectionsDesc')}
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
                <Label>{t('notifications.additional.motivation')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.additional.motivationDesc')}
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

      {/* Engagement & Progress Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('notifications.engagement.title', 'Engagement & Progress')}
          </CardTitle>
          <CardDescription>
            {t('notifications.engagement.description', 'Notifications to help you stay on track')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-500" />
              <div>
                <Label>{t('notifications.engagement.onboarding', 'Onboarding Reminders')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.engagement.onboardingDesc', 'Profile completion and setup reminders')}
                </p>
              </div>
            </div>
            <Switch
              checked={(localPrefs as any).push_onboarding ?? true}
              onCheckedChange={(checked) => handleToggle("push_onboarding", checked)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <div>
                <Label>{t('notifications.engagement.progress', 'Progress Updates')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.engagement.progressDesc', 'Streaks, milestones, and weekly summaries')}
                </p>
              </div>
            </div>
            <Switch
              checked={(localPrefs as any).push_progress ?? true}
              onCheckedChange={(checked) => handleToggle("push_progress", checked)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-orange-500" />
              <div>
                <Label>{t('notifications.engagement.reengagement', 'Re-engagement')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.engagement.reengagementDesc', 'Reminders when you haven\'t been active')}
                </p>
              </div>
            </div>
            <Switch
              checked={(localPrefs as any).push_reengagement ?? true}
              onCheckedChange={(checked) => handleToggle("push_reengagement", checked)}
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
            {t('notifications.timing.title')}
          </CardTitle>
          <CardDescription>
            {t('notifications.timing.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('notifications.timing.remindMe')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.timing.howEarly')}
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
                <SelectItem value="1">{t('notifications.timing.1hour')}</SelectItem>
                <SelectItem value="2">{t('notifications.timing.2hours')}</SelectItem>
                <SelectItem value="4">{t('notifications.timing.4hours')}</SelectItem>
                <SelectItem value="12">{t('notifications.timing.12hours')}</SelectItem>
                <SelectItem value="24">{t('notifications.timing.24hours')}</SelectItem>
                <SelectItem value="48">{t('notifications.timing.2days')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};