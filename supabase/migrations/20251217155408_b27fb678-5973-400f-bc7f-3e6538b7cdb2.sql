-- Add verification fields to habit_logs
ALTER TABLE habit_logs ADD COLUMN IF NOT EXISTS verification_type TEXT DEFAULT 'manual';
-- Values: 'manual', 'wearable_auto', 'coach_verified'
ALTER TABLE habit_logs ADD COLUMN IF NOT EXISTS health_data_id UUID REFERENCES health_data_sync(id);

-- Add wearable linking to client_habits
ALTER TABLE client_habits ADD COLUMN IF NOT EXISTS wearable_target_type TEXT;
-- Values: 'steps', 'calories', 'active_minutes', 'sleep', 'heart_rate', 'distance', NULL (manual only)
ALTER TABLE client_habits ADD COLUMN IF NOT EXISTS wearable_target_value NUMERIC;
-- e.g., 10000 steps, 30 active minutes

-- Add verified progress tracking to challenge_participants
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS verified_progress INTEGER DEFAULT 0;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS unverified_progress INTEGER DEFAULT 0;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS last_wearable_sync_at TIMESTAMP WITH TIME ZONE;

-- Add verification requirements to challenges
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS requires_verification BOOLEAN DEFAULT false;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'any';
-- Values: 'wearable_only', 'verified_only', 'any'
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS wearable_data_type TEXT;
-- Which health data type to track: 'steps', 'calories', 'active_minutes', etc.

-- Add source tracking to client_progress
ALTER TABLE client_progress ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'manual';
-- Values: 'manual', 'wearable_sync', 'smart_scale', 'coach_entered'
ALTER TABLE client_progress ADD COLUMN IF NOT EXISTS wearable_connection_id UUID REFERENCES wearable_connections(id);
ALTER TABLE client_progress ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Create function to auto-complete habits and update challenges from wearable data
CREATE OR REPLACE FUNCTION process_wearable_data()
RETURNS TRIGGER AS $$
DECLARE
  v_habit RECORD;
  v_challenge RECORD;
  v_client_profile_id UUID;
BEGIN
  -- Get client profile ID from wearable connection
  SELECT client_id INTO v_client_profile_id
  FROM wearable_connections
  WHERE id = NEW.wearable_connection_id;
  
  IF v_client_profile_id IS NULL THEN
    v_client_profile_id := NEW.client_id;
  END IF;

  -- Auto-complete habits that match this wearable data type and target
  FOR v_habit IN 
    SELECT h.id, h.client_id, h.wearable_target_value
    FROM client_habits h
    WHERE h.client_id = v_client_profile_id
      AND h.wearable_target_type = NEW.data_type
      AND h.wearable_target_value <= NEW.value
      AND h.is_active = true
      AND NOT EXISTS (
        SELECT 1 FROM habit_logs hl 
        WHERE hl.habit_id = h.id 
        AND hl.logged_at = NEW.recorded_at::date
      )
  LOOP
    INSERT INTO habit_logs (habit_id, client_id, logged_at, completed_count, verification_type, health_data_id)
    VALUES (v_habit.id, v_habit.client_id, NEW.recorded_at::date, 1, 'wearable_auto', NEW.id)
    ON CONFLICT (habit_id, logged_at) DO UPDATE
    SET verification_type = 'wearable_auto',
        health_data_id = NEW.id,
        completed_count = GREATEST(habit_logs.completed_count, 1);
  END LOOP;

  -- Update challenge progress for wearable-based challenges
  FOR v_challenge IN
    SELECT cp.id as participant_id, c.id as challenge_id, c.wearable_data_type, c.requires_verification
    FROM challenge_participants cp
    JOIN challenges c ON cp.challenge_id = c.id
    WHERE cp.client_id = v_client_profile_id
      AND c.is_active = true
      AND c.wearable_data_type = NEW.data_type
      AND NEW.recorded_at::date BETWEEN c.start_date AND c.end_date
      AND cp.status = 'active'
  LOOP
    -- Update verified progress
    UPDATE challenge_participants
    SET verified_progress = verified_progress + NEW.value::integer,
        current_progress = CASE 
          WHEN v_challenge.requires_verification THEN verified_progress + NEW.value::integer
          ELSE current_progress + NEW.value::integer
        END,
        last_wearable_sync_at = NOW()
    WHERE id = v_challenge.participant_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on health_data_sync
DROP TRIGGER IF EXISTS trigger_process_wearable_data ON health_data_sync;
CREATE TRIGGER trigger_process_wearable_data
  AFTER INSERT ON health_data_sync
  FOR EACH ROW
  EXECUTE FUNCTION process_wearable_data();

-- Add wearable_connection_id to health_data_sync if not exists
ALTER TABLE health_data_sync ADD COLUMN IF NOT EXISTS wearable_connection_id UUID REFERENCES wearable_connections(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_health_data_sync_client_date ON health_data_sync(client_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_client_habits_wearable ON client_habits(client_id, wearable_target_type) WHERE wearable_target_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_challenges_wearable ON challenges(wearable_data_type) WHERE wearable_data_type IS NOT NULL;