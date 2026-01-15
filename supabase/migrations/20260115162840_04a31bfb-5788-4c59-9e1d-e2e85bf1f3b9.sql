-- Add excluded dates and cancellation tracking for gym classes
ALTER TABLE gym_classes ADD COLUMN IF NOT EXISTS excluded_dates JSONB DEFAULT '[]';
ALTER TABLE gym_classes ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE gym_classes ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE gym_classes ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id);

-- Create table for class cancellation notifications sent
CREATE TABLE IF NOT EXISTS gym_class_cancellation_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES gym_classes(id) ON DELETE CASCADE,
  member_id UUID REFERENCES gym_members(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT now(),
  notification_type TEXT NOT NULL, -- 'single_cancel', 'series_cancel', 'break_added'
  reason TEXT,
  read_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE gym_class_cancellation_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for cancellation notifications
CREATE POLICY "Gym staff can manage cancellation notifications"
ON gym_class_cancellation_notifications
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM gym_classes gc
    JOIN gym_staff gs ON gs.gym_id = gc.gym_id
    WHERE gc.id = class_id AND gs.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM gym_classes gc
    JOIN gym_profiles gp ON gp.id = gc.gym_id
    WHERE gc.id = class_id AND gp.user_id = auth.uid()
  )
);

CREATE POLICY "Members can view their own notifications"
ON gym_class_cancellation_notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM gym_members gm
    WHERE gm.id = member_id AND gm.user_id = auth.uid()
  )
);