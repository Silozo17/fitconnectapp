-- Create a secure function to search users by email
-- Returns public profile info only, with proper security

CREATE OR REPLACE FUNCTION public.search_users_by_email(search_email text)
RETURNS TABLE (
  user_id uuid,
  username text,
  display_name text,
  first_name text,
  last_name text,
  avatar_url text,
  profile_image_url text,
  profile_type text,
  location text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Find user by exact email match in auth.users
  SELECT au.id INTO v_user_id
  FROM auth.users au
  WHERE lower(au.email) = lower(search_email)
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Check if user is a client
  RETURN QUERY
  SELECT 
    cp.user_id,
    cp.username,
    NULL::text as display_name,
    cp.first_name,
    cp.last_name,
    cp.avatar_url,
    NULL::text as profile_image_url,
    'client'::text as profile_type,
    cp.location
  FROM client_profiles cp
  WHERE cp.user_id = v_user_id;
  
  -- Check if user is a coach
  RETURN QUERY
  SELECT 
    ccp.user_id,
    ccp.username,
    ccp.display_name,
    NULL::text as first_name,
    NULL::text as last_name,
    NULL::text as avatar_url,
    ccp.profile_image_url,
    'coach'::text as profile_type,
    ccp.location
  FROM coach_profiles ccp
  WHERE ccp.user_id = v_user_id;
  
  -- Check if user is admin
  RETURN QUERY
  SELECT 
    ap.user_id,
    ap.username,
    ap.display_name,
    ap.first_name,
    ap.last_name,
    ap.avatar_url,
    NULL::text as profile_image_url,
    'admin'::text as profile_type,
    NULL::text as location
  FROM admin_profiles ap
  WHERE ap.user_id = v_user_id;
END;
$$;