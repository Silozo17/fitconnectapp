-- Add new notification preference columns for engagement notifications
ALTER TABLE public.notification_preferences 
ADD COLUMN IF NOT EXISTS push_onboarding boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS push_progress boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS push_reengagement boolean DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN public.notification_preferences.push_onboarding IS 'Push notifications for onboarding reminders and welcome messages';
COMMENT ON COLUMN public.notification_preferences.push_progress IS 'Push notifications for streaks, milestones, and weekly progress summaries';
COMMENT ON COLUMN public.notification_preferences.push_reengagement IS 'Push notifications for inactivity nudges and re-engagement';