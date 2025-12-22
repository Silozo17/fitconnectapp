-- Create health data sharing preferences table
CREATE TABLE public.health_data_sharing_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL, -- 'steps', 'heart_rate', 'sleep', 'calories', 'distance', 'active_minutes', 'all'
  is_allowed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, coach_id, data_type)
);

-- Enable RLS
ALTER TABLE public.health_data_sharing_preferences ENABLE ROW LEVEL SECURITY;

-- Clients can manage their own sharing preferences
CREATE POLICY "Clients manage own sharing preferences"
ON public.health_data_sharing_preferences FOR ALL
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()))
WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

-- Coaches can view preferences for their clients (read-only)
CREATE POLICY "Coaches can view sharing preferences for their clients"
ON public.health_data_sharing_preferences FOR SELECT
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- Create security definer function for permission checking
CREATE OR REPLACE FUNCTION public.coach_can_view_health_data(
  p_coach_user_id UUID,
  p_client_id UUID,
  p_data_type TEXT
) RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Must have active coach-client relationship
    SELECT 1 
    FROM coach_clients cc
    JOIN coach_profiles cp ON cc.coach_id = cp.id
    WHERE cp.user_id = p_coach_user_id
      AND cc.client_id = p_client_id
      AND cc.status = 'active'
      -- Check if permission exists and is allowed, OR no preference exists (default allow for backward compatibility)
      AND (
        NOT EXISTS (
          SELECT 1 FROM health_data_sharing_preferences hdsp
          WHERE hdsp.client_id = p_client_id
            AND hdsp.coach_id = cp.id
            AND (hdsp.data_type = p_data_type OR hdsp.data_type = 'all')
            AND hdsp.is_allowed = false
        )
      )
  )
$$;

-- Drop the existing overly permissive policy if it exists
DROP POLICY IF EXISTS "Coaches can view their clients health data" ON public.health_data_sync;

-- New permission-aware policy for coaches
CREATE POLICY "Coaches can view permitted client health data"
ON public.health_data_sync FOR SELECT
USING (
  public.coach_can_view_health_data(auth.uid(), client_id, data_type)
);

-- Create trigger function to add default preferences on new coach-client relationship
CREATE OR REPLACE FUNCTION public.create_default_health_sharing_prefs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create default "allow all" preference for new relationships
  INSERT INTO public.health_data_sharing_preferences (client_id, coach_id, data_type, is_allowed)
  VALUES (NEW.client_id, NEW.coach_id, 'all', true)
  ON CONFLICT (client_id, coach_id, data_type) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger on coach_clients
CREATE TRIGGER on_coach_client_created
AFTER INSERT ON public.coach_clients
FOR EACH ROW
EXECUTE FUNCTION public.create_default_health_sharing_prefs();

-- Add updated_at trigger
CREATE TRIGGER update_health_data_sharing_preferences_updated_at
BEFORE UPDATE ON public.health_data_sharing_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();