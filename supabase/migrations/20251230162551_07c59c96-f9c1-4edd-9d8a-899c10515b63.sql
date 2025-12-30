-- Drop the existing function first
DROP FUNCTION IF EXISTS public.delete_orphaned_auth_users();

-- Create a more comprehensive function to delete orphaned auth users
CREATE OR REPLACE FUNCTION public.delete_orphaned_auth_users()
RETURNS TABLE(deleted_user_id uuid, deleted_email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  orphan_record RECORD;
BEGIN
  -- Find and delete orphaned users
  FOR orphan_record IN 
    SELECT au.id, au.email
    FROM auth.users au
    WHERE au.id NOT IN (SELECT user_id FROM public.user_profiles WHERE user_id IS NOT NULL)
  LOOP
    -- Clean up ALL related tables including email_logs
    DELETE FROM public.email_logs WHERE user_id = orphan_record.id;
    DELETE FROM public.email_verifications WHERE email = orphan_record.email;
    DELETE FROM public.notifications WHERE user_id = orphan_record.id;
    DELETE FROM public.notification_preferences WHERE user_id = orphan_record.id;
    DELETE FROM public.email_preferences WHERE user_id = orphan_record.id;
    DELETE FROM public.push_tokens WHERE user_id = orphan_record.id;
    DELETE FROM public.client_profiles WHERE user_id = orphan_record.id;
    DELETE FROM public.coach_profiles WHERE user_id = orphan_record.id;
    DELETE FROM public.admin_profiles WHERE user_id = orphan_record.id;
    DELETE FROM public.user_roles WHERE user_id = orphan_record.id;
    
    -- Delete the auth user
    DELETE FROM auth.users WHERE id = orphan_record.id;
    
    deleted_user_id := orphan_record.id;
    deleted_email := orphan_record.email;
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$;

-- Only service role should be able to call this
REVOKE ALL ON FUNCTION public.delete_orphaned_auth_users() FROM anon, authenticated;

-- Run the cleanup now
SELECT * FROM public.delete_orphaned_auth_users();