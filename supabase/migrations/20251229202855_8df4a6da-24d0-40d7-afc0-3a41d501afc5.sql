-- =============================================
-- PHASE 1: Extend privacy controls to cover client data
-- =============================================

-- The health_data_sharing_preferences table already exists and uses 'data_type' as text
-- We'll extend it to support these new types: 'progress_photos', 'meal_logs', 'training_logs'
-- No schema changes needed - just using new data_type values

-- Create a helper function to check if a coach can view specific client data
-- This respects the privacy settings stored in health_data_sharing_preferences
CREATE OR REPLACE FUNCTION public.coach_can_view_client_data(
  p_coach_user_id UUID,
  p_client_id UUID,
  p_data_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coach_id UUID;
  v_is_coach_of_client BOOLEAN;
  v_all_pref BOOLEAN;
  v_specific_pref BOOLEAN;
BEGIN
  -- Get coach profile id from user id
  SELECT id INTO v_coach_id
  FROM coach_profiles
  WHERE user_id = p_coach_user_id;
  
  IF v_coach_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if this coach has an active relationship with the client
  SELECT EXISTS (
    SELECT 1 FROM coach_clients
    WHERE coach_id = v_coach_id
      AND client_id = p_client_id
      AND status = 'active'
  ) INTO v_is_coach_of_client;
  
  IF NOT v_is_coach_of_client THEN
    RETURN FALSE;
  END IF;
  
  -- Check specific preference for this data type
  SELECT is_allowed INTO v_specific_pref
  FROM health_data_sharing_preferences
  WHERE client_id = p_client_id
    AND coach_id = v_coach_id
    AND data_type = p_data_type;
    
  -- If specific preference exists, use it
  IF v_specific_pref IS NOT NULL THEN
    RETURN v_specific_pref;
  END IF;
  
  -- Check "all" preference as fallback
  SELECT is_allowed INTO v_all_pref
  FROM health_data_sharing_preferences
  WHERE client_id = p_client_id
    AND coach_id = v_coach_id
    AND data_type = 'all';
    
  -- If "all" preference exists, use it
  IF v_all_pref IS NOT NULL THEN
    RETURN v_all_pref;
  END IF;
  
  -- Default: allow access (backwards compatibility)
  RETURN TRUE;
END;
$$;

-- =============================================
-- PHASE 2: Create Training Logs Tables
-- =============================================

-- Training logs main table
CREATE TABLE public.training_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  workout_name TEXT NOT NULL,
  duration_minutes INTEGER,
  notes TEXT,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
  fatigue_level TEXT CHECK (fatigue_level IN ('low', 'moderate', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX idx_training_logs_client_date ON training_logs(client_id, logged_at DESC);

-- Training log exercises
CREATE TABLE public.training_log_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_log_id UUID NOT NULL REFERENCES training_logs(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_training_log_exercises_log ON training_log_exercises(training_log_id);

-- Training log sets
CREATE TABLE public.training_log_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES training_log_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL DEFAULT 1,
  reps INTEGER,
  weight_kg NUMERIC(10,2),
  duration_seconds INTEGER,
  distance_meters NUMERIC(10,2),
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
  is_warmup BOOLEAN DEFAULT FALSE,
  is_drop_set BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_training_log_sets_exercise ON training_log_sets(exercise_id);

-- Enable RLS on all training tables
ALTER TABLE public.training_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_log_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_log_sets ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for Training Logs
-- =============================================

-- Clients can CRUD their own training logs
CREATE POLICY "Clients can view their own training logs"
ON public.training_logs FOR SELECT
USING (
  client_id IN (
    SELECT id FROM client_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Clients can create their own training logs"
ON public.training_logs FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT id FROM client_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Clients can update their own training logs"
ON public.training_logs FOR UPDATE
USING (
  client_id IN (
    SELECT id FROM client_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Clients can delete their own training logs"
ON public.training_logs FOR DELETE
USING (
  client_id IN (
    SELECT id FROM client_profiles WHERE user_id = auth.uid()
  )
);

-- Coaches can view their clients' training logs (with privacy check)
CREATE POLICY "Coaches can view client training logs"
ON public.training_logs FOR SELECT
USING (
  coach_can_view_client_data(auth.uid(), client_id, 'training_logs')
);

-- Training log exercises inherit from parent training log
CREATE POLICY "Users can view exercises for accessible training logs"
ON public.training_log_exercises FOR SELECT
USING (
  training_log_id IN (
    SELECT id FROM training_logs WHERE
      client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
      OR coach_can_view_client_data(auth.uid(), client_id, 'training_logs')
  )
);

CREATE POLICY "Clients can manage exercises for their training logs"
ON public.training_log_exercises FOR INSERT
WITH CHECK (
  training_log_id IN (
    SELECT id FROM training_logs WHERE client_id IN (
      SELECT id FROM client_profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Clients can update exercises for their training logs"
ON public.training_log_exercises FOR UPDATE
USING (
  training_log_id IN (
    SELECT id FROM training_logs WHERE client_id IN (
      SELECT id FROM client_profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Clients can delete exercises from their training logs"
ON public.training_log_exercises FOR DELETE
USING (
  training_log_id IN (
    SELECT id FROM training_logs WHERE client_id IN (
      SELECT id FROM client_profiles WHERE user_id = auth.uid()
    )
  )
);

-- Training log sets inherit from parent exercise
CREATE POLICY "Users can view sets for accessible exercises"
ON public.training_log_sets FOR SELECT
USING (
  exercise_id IN (
    SELECT e.id FROM training_log_exercises e
    JOIN training_logs t ON e.training_log_id = t.id
    WHERE t.client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
      OR coach_can_view_client_data(auth.uid(), t.client_id, 'training_logs')
  )
);

CREATE POLICY "Clients can manage sets for their exercises"
ON public.training_log_sets FOR INSERT
WITH CHECK (
  exercise_id IN (
    SELECT e.id FROM training_log_exercises e
    JOIN training_logs t ON e.training_log_id = t.id
    WHERE t.client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Clients can update their exercise sets"
ON public.training_log_sets FOR UPDATE
USING (
  exercise_id IN (
    SELECT e.id FROM training_log_exercises e
    JOIN training_logs t ON e.training_log_id = t.id
    WHERE t.client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Clients can delete their exercise sets"
ON public.training_log_sets FOR DELETE
USING (
  exercise_id IN (
    SELECT e.id FROM training_log_exercises e
    JOIN training_logs t ON e.training_log_id = t.id
    WHERE t.client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  )
);

-- =============================================
-- RLS for Coach Access to Meal Logs (food_diary)
-- =============================================

-- Add policy for coaches to view client food diary entries
CREATE POLICY "Coaches can view client food diary"
ON public.food_diary FOR SELECT
USING (
  coach_can_view_client_data(auth.uid(), client_id, 'meal_logs')
);

-- =============================================
-- Update triggers for timestamps
-- =============================================

CREATE TRIGGER update_training_logs_updated_at
BEFORE UPDATE ON public.training_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();