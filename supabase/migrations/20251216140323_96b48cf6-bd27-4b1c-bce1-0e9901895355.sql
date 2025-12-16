-- Create security definer function to check if a client profile has messaged the current user (as coach)
CREATE OR REPLACE FUNCTION public.client_has_messaged_coach(client_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM messages m
    WHERE (m.sender_id = client_profile_id AND m.receiver_id IN (
      SELECT id FROM coach_profiles WHERE user_id = auth.uid()
    ))
    OR (m.receiver_id = client_profile_id AND m.sender_id IN (
      SELECT id FROM coach_profiles WHERE user_id = auth.uid()
    ))
  )
$$;

-- Create security definer function to check if a coach profile has messaged the current user (as client)
CREATE OR REPLACE FUNCTION public.coach_has_messaged_client(coach_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM messages m
    WHERE (m.sender_id = coach_profile_id AND m.receiver_id IN (
      SELECT id FROM client_profiles WHERE user_id = auth.uid()
    ))
    OR (m.receiver_id = coach_profile_id AND m.sender_id IN (
      SELECT id FROM client_profiles WHERE user_id = auth.uid()
    ))
  )
$$;

-- Drop the problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Coaches can view client profiles from messages" ON client_profiles;
DROP POLICY IF EXISTS "Clients can view coach profiles from messages" ON coach_profiles;

-- Create new RLS policies using the security definer functions
CREATE POLICY "Coaches can view client profiles from messages" 
ON client_profiles FOR SELECT
USING (public.client_has_messaged_coach(id));

CREATE POLICY "Clients can view coach profiles from messages" 
ON coach_profiles FOR SELECT
USING (public.coach_has_messaged_client(id));