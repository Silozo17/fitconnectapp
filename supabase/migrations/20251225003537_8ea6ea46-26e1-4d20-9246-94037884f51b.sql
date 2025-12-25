
-- Phase 8: Fix Coach-Client Visibility
-- Create security definer function to check if client is connected to coach
CREATE OR REPLACE FUNCTION public.client_is_connected_to_coach(coach_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM coach_clients cc
    JOIN client_profiles cp ON cc.client_id = cp.id
    WHERE cc.coach_id = coach_profile_id
    AND cp.user_id = auth.uid()
    AND cc.status = 'active'
  )
$$;

-- Allow clients to view their own coach connections
CREATE POLICY "Clients can view their own coach connections" 
ON public.coach_clients
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.client_profiles 
    WHERE user_id = auth.uid()
  )
);

-- Allow clients to view profiles of coaches they are connected to
CREATE POLICY "Clients can view their connected coaches profiles"
ON public.coach_profiles
FOR SELECT
TO authenticated
USING (
  public.client_is_connected_to_coach(id)
);
