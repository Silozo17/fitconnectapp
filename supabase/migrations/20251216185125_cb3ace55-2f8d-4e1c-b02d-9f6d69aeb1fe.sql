-- Function to notify admins when a new team member is added
CREATE OR REPLACE FUNCTION public.notify_admin_new_team_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  member_name TEXT;
BEGIN
  -- Only notify for admin/manager/staff roles (team members)
  IF NEW.role IN ('admin', 'manager', 'staff') THEN
    -- Get the team member's name from admin_profiles
    SELECT COALESCE(display_name, first_name || ' ' || last_name, 'A new team member')
    INTO member_name
    FROM admin_profiles 
    WHERE user_id = NEW.user_id;
    
    -- Notify all existing admins (using existing notify_admins function)
    PERFORM notify_admins(
      'new_team_member',
      'New Team Member Added',
      COALESCE(member_name, 'A new ' || NEW.role) || ' has joined the team as ' || NEW.role || '.',
      jsonb_build_object(
        'user_id', NEW.user_id::text, 
        'role', NEW.role::text
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on user_roles for team member notifications
CREATE TRIGGER on_new_team_member_notify_admins
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_team_member();