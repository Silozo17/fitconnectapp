
-- Fix infinite recursion in client_can_view_client_profile function
-- The issue: This function is used in RLS policy on client_profiles, 
-- but it queries client_profiles internally, causing infinite recursion.
-- Solution: Use plpgsql with a local variable so the initial SELECT runs
-- with SECURITY DEFINER privileges which bypasses RLS.

CREATE OR REPLACE FUNCTION public.client_can_view_client_profile(target_client_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_client_profile_id uuid;
BEGIN
  -- Get current user's client profile ID with elevated privileges (bypasses RLS)
  SELECT id INTO my_client_profile_id 
  FROM client_profiles 
  WHERE user_id = auth.uid();
  
  IF my_client_profile_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Now check messages without triggering client_profiles RLS
  RETURN EXISTS (
    SELECT 1 FROM messages m
    WHERE (
      (m.sender_id = target_client_profile_id AND m.receiver_id = my_client_profile_id)
      OR (m.receiver_id = target_client_profile_id AND m.sender_id = my_client_profile_id)
    )
  );
END;
$$;
