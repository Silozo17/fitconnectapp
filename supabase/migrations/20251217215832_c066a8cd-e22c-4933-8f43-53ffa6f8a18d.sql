-- Drop the problematic policy causing infinite recursion
DROP POLICY IF EXISTS "Coaches can view client profiles from messages via profile id" ON client_profiles;

-- Create a SECURITY DEFINER function to check if coach has messaged this client profile
-- This bypasses RLS to prevent recursion
CREATE OR REPLACE FUNCTION public.coach_can_view_client_profile(client_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM messages m
    JOIN coach_profiles cp ON cp.user_id = auth.uid()
    WHERE (
      (m.sender_id = client_profile_id AND m.receiver_id = cp.id)
      OR (m.receiver_id = client_profile_id AND m.sender_id = cp.id)
    )
  )
$$;

-- Create the safe policy using the function
CREATE POLICY "Coaches can view client profiles they messaged with"
ON client_profiles FOR SELECT
TO authenticated
USING (public.coach_can_view_client_profile(id));