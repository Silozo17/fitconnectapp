-- Update find_orphaned_auth_users function to also check user_profiles table
CREATE OR REPLACE FUNCTION public.find_orphaned_auth_users()
 RETURNS SETOF uuid
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT au.id
  FROM auth.users au
  LEFT JOIN public.client_profiles cp ON cp.user_id = au.id
  LEFT JOIN public.coach_profiles cop ON cop.user_id = au.id
  LEFT JOIN public.admin_profiles ap ON ap.user_id = au.id
  LEFT JOIN public.user_profiles up ON up.user_id = au.id
  LEFT JOIN public.user_roles ur ON ur.user_id = au.id
  WHERE cp.id IS NULL 
    AND cop.id IS NULL 
    AND ap.id IS NULL
    AND up.id IS NULL
    AND ur.id IS NULL;
$function$;

-- Clean up orphaned data for the known blocked email addresses
-- User IDs: e6ca5f47-011a-4e64-9364-0a7d12e1d65a, b0fde678-b1a5-4b8b-8e77-b795ad002b2c
DO $$
DECLARE
  orphan_ids UUID[] := ARRAY[
    'e6ca5f47-011a-4e64-9364-0a7d12e1d65a'::uuid,
    'b0fde678-b1a5-4b8b-8e77-b795ad002b2c'::uuid
  ];
  uid UUID;
BEGIN
  FOREACH uid IN ARRAY orphan_ids
  LOOP
    -- Delete from all user-linked tables
    DELETE FROM notifications WHERE user_id = uid;
    DELETE FROM notification_preferences WHERE user_id = uid;
    DELETE FROM email_preferences WHERE user_id = uid;
    DELETE FROM user_profiles WHERE user_id = uid;
    DELETE FROM client_profiles WHERE user_id = uid;
    DELETE FROM coach_profiles WHERE user_id = uid;
    DELETE FROM admin_profiles WHERE user_id = uid;
    DELETE FROM user_roles WHERE user_id = uid;
  END LOOP;
END $$;