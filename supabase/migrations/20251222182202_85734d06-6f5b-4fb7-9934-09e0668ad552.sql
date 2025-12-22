-- Database function to find orphaned auth users (those without any profiles or roles)
CREATE OR REPLACE FUNCTION public.find_orphaned_auth_users()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.id
  FROM auth.users au
  LEFT JOIN public.client_profiles cp ON cp.user_id = au.id
  LEFT JOIN public.coach_profiles cop ON cop.user_id = au.id
  LEFT JOIN public.admin_profiles ap ON ap.user_id = au.id
  LEFT JOIN public.user_roles ur ON ur.user_id = au.id
  WHERE cp.id IS NULL 
    AND cop.id IS NULL 
    AND ap.id IS NULL
    AND ur.id IS NULL;
$$;