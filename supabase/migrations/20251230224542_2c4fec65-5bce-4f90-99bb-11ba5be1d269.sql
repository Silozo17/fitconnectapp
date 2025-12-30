-- Add push_showcase preference for showcase consent notifications
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS push_showcase BOOLEAN DEFAULT true;