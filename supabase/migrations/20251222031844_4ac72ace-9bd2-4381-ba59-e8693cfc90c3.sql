-- First, add unique constraint on badge name if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'badges_name_key'
  ) THEN
    ALTER TABLE badges ADD CONSTRAINT badges_name_key UNIQUE (name);
  END IF;
END $$;

-- Add new health-based badges for wearable milestones
INSERT INTO badges (name, description, category, icon, criteria, rarity, xp_reward, is_active) VALUES
-- Step milestones
('Step Master', 'Walked 100,000 steps tracked by wearable', 'fitness', 'footprints', '{"type": "steps_total", "value": 100000}'::jsonb, 'uncommon', 100, true),
('Step Champion', 'Walked 500,000 steps tracked by wearable', 'fitness', 'footprints', '{"type": "steps_total", "value": 500000}'::jsonb, 'rare', 250, true),
('Step Legend', 'Walked 1,000,000 steps tracked by wearable', 'fitness', 'crown', '{"type": "steps_total", "value": 1000000}'::jsonb, 'epic', 500, true),

-- Calorie milestones
('Calorie Burner', 'Burned 10,000 calories tracked by wearable', 'fitness', 'flame', '{"type": "calories_total", "value": 10000}'::jsonb, 'uncommon', 100, true),
('Calorie Crusher', 'Burned 50,000 calories tracked by wearable', 'fitness', 'flame', '{"type": "calories_total", "value": 50000}'::jsonb, 'rare', 250, true),
('Calorie Champion', 'Burned 100,000 calories tracked by wearable', 'fitness', 'flame', '{"type": "calories_total", "value": 100000}'::jsonb, 'epic', 500, true),

-- Active minutes milestones
('Active Starter', '1,000 active minutes from wearable', 'fitness', 'timer', '{"type": "active_minutes_total", "value": 1000}'::jsonb, 'uncommon', 100, true),
('Active Warrior', '5,000 active minutes from wearable', 'fitness', 'timer', '{"type": "active_minutes_total", "value": 5000}'::jsonb, 'rare', 250, true),
('Active Champion', '10,000 active minutes from wearable', 'fitness', 'timer', '{"type": "active_minutes_total", "value": 10000}'::jsonb, 'epic', 500, true),

-- Distance milestones
('Distance Runner', '100km tracked by wearable', 'fitness', 'map-pin', '{"type": "distance_total", "value": 100}'::jsonb, 'uncommon', 100, true),
('Marathon Master', '500km tracked by wearable', 'fitness', 'map', '{"type": "distance_total", "value": 500}'::jsonb, 'rare', 250, true),
('Ultra Runner', '1,000km tracked by wearable', 'fitness', 'globe', '{"type": "distance_total", "value": 1000}'::jsonb, 'epic', 500, true),

-- Sleep milestones
('Well Rested', '200 hours of sleep tracked', 'wellness', 'moon', '{"type": "sleep_hours_total", "value": 200}'::jsonb, 'uncommon', 100, true),
('Sleep Champion', '500 hours of sleep tracked', 'wellness', 'moon', '{"type": "sleep_hours_total", "value": 500}'::jsonb, 'rare', 200, true),

-- Workout milestones (wearable-tracked)
('Wearable Warrior', '10 workouts tracked by wearable', 'fitness', 'watch', '{"type": "wearable_workout_count", "value": 10}'::jsonb, 'uncommon', 100, true),
('Wearable Champion', '50 workouts tracked by wearable', 'fitness', 'watch', '{"type": "wearable_workout_count", "value": 50}'::jsonb, 'rare', 250, true),
('Wearable Legend', '100 workouts tracked by wearable', 'fitness', 'watch', '{"type": "wearable_workout_count", "value": 100}'::jsonb, 'epic', 500, true),

-- Device sync badges
('Connected', 'Connected first wearable device', 'tech', 'bluetooth', '{"type": "device_connected", "value": 1}'::jsonb, 'common', 25, true),
('Multi-Device', 'Connected 3 different wearable devices', 'tech', 'bluetooth', '{"type": "devices_connected", "value": 3}'::jsonb, 'rare', 100, true)

ON CONFLICT (name) DO NOTHING;

-- Create function to process wearable health data for achievements and challenges
CREATE OR REPLACE FUNCTION public.process_wearable_health_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_client_id UUID;
  v_challenge RECORD;
  v_total_value NUMERIC;
  v_challenge_total NUMERIC;
BEGIN
  -- Get client_id from wearable_connection if not directly available
  IF NEW.client_id IS NULL THEN
    SELECT client_id INTO v_client_id
    FROM wearable_connections
    WHERE id = NEW.wearable_connection_id;
  ELSE
    v_client_id := NEW.client_id;
  END IF;

  IF v_client_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Skip manual entries - only process wearable data
  IF NEW.source = 'manual' THEN
    RETURN NEW;
  END IF;

  -- Update challenge progress for matching wearable-type challenges
  FOR v_challenge IN
    SELECT 
      cp.id as participant_id, 
      c.id as challenge_id, 
      c.wearable_data_type,
      c.target_value,
      c.start_date,
      c.end_date,
      c.requires_verification
    FROM challenge_participants cp
    JOIN challenges c ON cp.challenge_id = c.id
    WHERE cp.client_id = v_client_id
      AND c.is_active = true
      AND cp.status = 'active'
      AND c.data_source = 'wearable'
      AND c.wearable_data_type = NEW.data_type
      AND NEW.recorded_at::date BETWEEN c.start_date AND c.end_date
  LOOP
    -- Calculate total from wearable data for this challenge period
    SELECT COALESCE(SUM(value), 0) INTO v_challenge_total
    FROM health_data_sync
    WHERE client_id = v_client_id
      AND data_type = v_challenge.wearable_data_type
      AND source != 'manual'
      AND recorded_at::date BETWEEN v_challenge.start_date AND v_challenge.end_date;

    -- Update challenge participant progress
    UPDATE challenge_participants
    SET 
      verified_progress = v_challenge_total::integer,
      current_progress = CASE 
        WHEN v_challenge.requires_verification THEN v_challenge_total::integer
        ELSE GREATEST(current_progress, v_challenge_total::integer)
      END,
      last_wearable_sync_at = NOW(),
      status = CASE 
        WHEN v_challenge_total >= v_challenge.target_value AND status = 'active' THEN 'completed'
        ELSE status
      END,
      completed_at = CASE 
        WHEN v_challenge_total >= v_challenge.target_value AND completed_at IS NULL THEN NOW()
        ELSE completed_at
      END
    WHERE id = v_challenge.participant_id;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger for health_data_sync to auto-update challenge progress
DROP TRIGGER IF EXISTS trigger_process_wearable_health_data ON health_data_sync;
CREATE TRIGGER trigger_process_wearable_health_data
  AFTER INSERT ON health_data_sync
  FOR EACH ROW
  EXECUTE FUNCTION process_wearable_health_data();

-- Create function to check and award health badges after wearable sync
CREATE OR REPLACE FUNCTION public.check_and_award_health_badges(p_client_id UUID)
RETURNS TABLE(badge_id UUID, badge_name TEXT, was_awarded BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_badge RECORD;
  v_total_value NUMERIC;
  v_criteria_type TEXT;
  v_criteria_value NUMERIC;
  v_data_type TEXT;
  v_already_has BOOLEAN;
BEGIN
  -- Loop through all health-based badges
  FOR v_badge IN
    SELECT b.id, b.name, b.criteria, b.xp_reward
    FROM badges b
    WHERE b.is_active = true
      AND b.category IN ('fitness', 'wellness', 'tech')
      AND (
        b.criteria->>'type' IN (
          'steps_total', 'calories_total', 'active_minutes_total', 
          'distance_total', 'sleep_hours_total', 'wearable_workout_count',
          'device_connected', 'devices_connected'
        )
      )
  LOOP
    v_criteria_type := v_badge.criteria->>'type';
    v_criteria_value := (v_badge.criteria->>'value')::numeric;
    
    -- Check if client already has this badge
    SELECT EXISTS(
      SELECT 1 FROM client_badges cb 
      WHERE cb.client_id = p_client_id AND cb.badge_id = v_badge.id
    ) INTO v_already_has;
    
    IF v_already_has THEN
      badge_id := v_badge.id;
      badge_name := v_badge.name;
      was_awarded := FALSE;
      RETURN NEXT;
      CONTINUE;
    END IF;
    
    -- Map criteria type to data type
    v_data_type := CASE v_criteria_type
      WHEN 'steps_total' THEN 'steps'
      WHEN 'calories_total' THEN 'calories'
      WHEN 'active_minutes_total' THEN 'active_minutes'
      WHEN 'distance_total' THEN 'distance'
      WHEN 'sleep_hours_total' THEN 'sleep'
      WHEN 'wearable_workout_count' THEN 'workout'
      ELSE NULL
    END;
    
    -- Calculate total based on type
    IF v_criteria_type = 'device_connected' THEN
      SELECT COUNT(*)::numeric INTO v_total_value
      FROM wearable_connections
      WHERE client_id = p_client_id AND is_active = true;
      
    ELSIF v_criteria_type = 'devices_connected' THEN
      SELECT COUNT(DISTINCT provider)::numeric INTO v_total_value
      FROM wearable_connections
      WHERE client_id = p_client_id AND is_active = true;
      
    ELSIF v_data_type IS NOT NULL THEN
      -- Get sum from wearable data only (exclude manual)
      SELECT COALESCE(SUM(value), 0) INTO v_total_value
      FROM health_data_sync
      WHERE client_id = p_client_id
        AND data_type = v_data_type
        AND source != 'manual';
        
      -- Convert sleep to hours (stored in minutes)
      IF v_data_type = 'sleep' THEN
        v_total_value := v_total_value / 60;
      END IF;
    ELSE
      v_total_value := 0;
    END IF;
    
    -- Check if criteria met and award badge
    IF v_total_value >= v_criteria_value THEN
      INSERT INTO client_badges (client_id, badge_id, source_data)
      VALUES (p_client_id, v_badge.id, jsonb_build_object(
        'source', 'wearable_sync',
        'total_value', v_total_value,
        'criteria_value', v_criteria_value
      ))
      ON CONFLICT DO NOTHING;
      
      -- Award XP for badge
      UPDATE client_xp
      SET total_xp = total_xp + v_badge.xp_reward,
          updated_at = NOW()
      WHERE client_id = p_client_id;
      
      badge_id := v_badge.id;
      badge_name := v_badge.name;
      was_awarded := TRUE;
      RETURN NEXT;
    ELSE
      badge_id := v_badge.id;
      badge_name := v_badge.name;
      was_awarded := FALSE;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;