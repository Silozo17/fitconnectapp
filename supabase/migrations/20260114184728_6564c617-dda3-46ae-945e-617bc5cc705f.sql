-- 1. Add columns for unified inbox and message assignment
ALTER TABLE gym_member_messages 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES gym_locations(id),
ADD COLUMN IF NOT EXISTS assigned_to_staff_id UUID REFERENCES gym_staff(id),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- 2. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_gym_messages_location ON gym_member_messages(location_id);
CREATE INDEX IF NOT EXISTS idx_gym_messages_unread ON gym_member_messages(gym_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_gym_messages_assigned ON gym_member_messages(assigned_to_staff_id) WHERE assigned_to_staff_id IS NOT NULL;

-- 3. Update RLS policies for unified inbox access
DROP POLICY IF EXISTS "Gym staff can view gym messages" ON gym_member_messages;
CREATE POLICY "Gym staff can view gym messages" ON gym_member_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM gym_staff gs 
    WHERE gs.user_id = auth.uid() 
    AND gs.gym_id = gym_member_messages.gym_id
    AND gs.status = 'active'
  )
);

DROP POLICY IF EXISTS "Gym staff can update gym messages" ON gym_member_messages;
CREATE POLICY "Gym staff can update gym messages" ON gym_member_messages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM gym_staff gs 
    WHERE gs.user_id = auth.uid() 
    AND gs.gym_id = gym_member_messages.gym_id
    AND gs.status = 'active'
  )
);