-- Fix ALL infinite recursion issues on client_profiles table
-- The root cause: Multiple policies and functions query tables that have policies
-- which query back to client_profiles, creating circular dependencies.

-- 1. Fix coach_can_view_client_profile - rewrite from SQL to plpgsql with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.coach_can_view_client_profile(client_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_coach_profile_id uuid;
BEGIN
  -- Get current user's coach profile ID with elevated privileges (bypasses RLS)
  SELECT id INTO my_coach_profile_id 
  FROM coach_profiles 
  WHERE user_id = auth.uid();
  
  IF my_coach_profile_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if coach has messaged this client (without triggering RLS)
  RETURN EXISTS (
    SELECT 1 FROM messages m
    WHERE (
      (m.sender_id = client_profile_id AND m.receiver_id = my_coach_profile_id)
      OR (m.receiver_id = client_profile_id AND m.sender_id = my_coach_profile_id)
    )
  );
END;
$$;

-- 2. Fix client_has_messaged_coach - rewrite from SQL to plpgsql with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.client_has_messaged_coach(client_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_coach_profile_id uuid;
BEGIN
  -- Get current user's coach profile ID with elevated privileges (bypasses RLS)
  SELECT id INTO my_coach_profile_id 
  FROM coach_profiles 
  WHERE user_id = auth.uid();
  
  IF my_coach_profile_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if this client has messaged the coach (without triggering RLS)
  RETURN EXISTS (
    SELECT 1 FROM messages m
    WHERE (
      (m.sender_id = client_profile_id AND m.receiver_id = my_coach_profile_id)
      OR (m.receiver_id = client_profile_id AND m.sender_id = my_coach_profile_id)
    )
  );
END;
$$;

-- 3. Create new coach_has_client function to replace the problematic direct subquery
-- The old policy "Coaches can view their clients profiles" used a direct JOIN that caused recursion
CREATE OR REPLACE FUNCTION public.coach_has_client(client_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_coach_profile_id uuid;
BEGIN
  -- Get current user's coach profile ID with elevated privileges (bypasses RLS)
  SELECT id INTO my_coach_profile_id 
  FROM coach_profiles 
  WHERE user_id = auth.uid();
  
  IF my_coach_profile_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if this client is linked to the coach (without triggering RLS on client_profiles)
  RETURN EXISTS (
    SELECT 1 FROM coach_clients cc
    WHERE cc.coach_id = my_coach_profile_id
    AND cc.client_id = client_profile_id
  );
END;
$$;

-- 4. Drop and recreate the problematic policy to use the new function
DROP POLICY IF EXISTS "Coaches can view their clients profiles" ON client_profiles;

CREATE POLICY "Coaches can view their clients profiles"
ON client_profiles
FOR SELECT
TO authenticated
USING (public.coach_has_client(id));