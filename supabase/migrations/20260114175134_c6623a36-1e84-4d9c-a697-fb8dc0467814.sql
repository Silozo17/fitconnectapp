-- Add assigned_location_ids to gym_staff for location-based access control
ALTER TABLE gym_staff ADD COLUMN IF NOT EXISTS assigned_location_ids UUID[] DEFAULT '{}';

-- Add permissions JSONB if not exists
ALTER TABLE gym_staff ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;

-- Create gym_staff_action_logs table for hierarchical audit logging
CREATE TABLE IF NOT EXISTS gym_staff_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gym_profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES gym_locations(id) ON DELETE SET NULL,
  staff_id UUID NOT NULL REFERENCES gym_staff(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_category TEXT NOT NULL,
  target_entity_type TEXT,
  target_entity_id UUID,
  description TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  requires_owner_review BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES gym_staff(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_gym_staff_logs_gym ON gym_staff_action_logs(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_staff_logs_staff ON gym_staff_action_logs(staff_id);
CREATE INDEX IF NOT EXISTS idx_gym_staff_logs_created ON gym_staff_action_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gym_staff_logs_category ON gym_staff_action_logs(action_category);
CREATE INDEX IF NOT EXISTS idx_gym_staff_logs_location ON gym_staff_action_logs(location_id);

-- Enable RLS
ALTER TABLE gym_staff_action_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check staff hierarchy (returns TEXT for consistent comparison)
CREATE OR REPLACE FUNCTION public.get_gym_staff_role(_user_id uuid, _gym_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Check if user is owner
  IF EXISTS (SELECT 1 FROM gym_profiles WHERE id = _gym_id AND user_id = _user_id) THEN
    RETURN 'owner';
  END IF;
  
  -- Get staff role and cast to text
  SELECT role::TEXT INTO v_role 
  FROM gym_staff 
  WHERE gym_id = _gym_id AND user_id = _user_id AND status = 'active';
  
  RETURN v_role;
END;
$$;

-- Create function to check if user can view logs
CREATE OR REPLACE FUNCTION public.can_view_gym_action_log(_user_id uuid, _log_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log RECORD;
  v_viewer_role TEXT;
  v_log_staff_role TEXT;
BEGIN
  -- Get the log details
  SELECT gym_id, staff_id INTO v_log FROM gym_staff_action_logs WHERE id = _log_id;
  
  IF v_log IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get viewer's role
  v_viewer_role := get_gym_staff_role(_user_id, v_log.gym_id);
  
  IF v_viewer_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Owner can see all logs
  IF v_viewer_role = 'owner' THEN
    RETURN true;
  END IF;
  
  -- Get the role of the staff member who created the log
  SELECT role::TEXT INTO v_log_staff_role FROM gym_staff WHERE id = v_log.staff_id;
  
  -- Manager can see logs from coach, marketing, and staff
  IF v_viewer_role = 'manager' AND v_log_staff_role IN ('coach', 'marketing', 'staff') THEN
    RETURN true;
  END IF;
  
  -- Staff can only see their own logs
  IF EXISTS (SELECT 1 FROM gym_staff WHERE id = v_log.staff_id AND user_id = _user_id) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- RLS Policy: Select - hierarchical visibility
CREATE POLICY "Staff can view logs based on hierarchy"
ON gym_staff_action_logs
FOR SELECT
TO authenticated
USING (public.can_view_gym_action_log(auth.uid(), id));

-- RLS Policy: Insert - any staff member can log their own actions
CREATE POLICY "Staff can insert their own action logs"
ON gym_staff_action_logs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM gym_staff 
    WHERE id = gym_staff_action_logs.staff_id 
    AND user_id = auth.uid()
    AND status = 'active'
  )
);

-- RLS Policy: Update - only owner/manager can update logs (for review)
CREATE POLICY "Owner and manager can update logs"
ON gym_staff_action_logs
FOR UPDATE
TO authenticated
USING (
  public.get_gym_staff_role(auth.uid(), gym_id) IN ('owner', 'manager')
);