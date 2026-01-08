-- The GUC approach doesn't work across security contexts
-- Instead, we'll modify the trigger to check if the update is coming from the admin_update_coach_tier function
-- by checking the call stack using pg_backend_pid and session info

-- First, drop the existing protect_founder_tier function and recreate with a direct bypass check
CREATE OR REPLACE FUNCTION public.protect_founder_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_action BOOLEAN;
  calling_function TEXT;
BEGIN
  -- If changing FROM founder tier, check if this is an authorized admin action
  IF OLD.subscription_tier = 'founder' AND NEW.subscription_tier != 'founder' THEN
    -- Check if this is an admin-authorized change via GUC (check both session and local)
    is_admin_action := COALESCE(current_setting('app.admin_tier_change', true), 'false') = 'true';
    
    -- Also check if we're being called from the admin function by checking the query
    IF NOT is_admin_action THEN
      -- Check if the calling context set the flag via query (backup method)
      SELECT INTO calling_function current_query();
      is_admin_action := calling_function ILIKE '%admin_update_coach_tier%';
    END IF;
    
    IF NOT is_admin_action THEN
      -- Log the blocked attempt
      INSERT INTO public.subscription_tier_changes (
        coach_id, old_tier, new_tier, change_source, change_reason, metadata
      ) VALUES (
        OLD.id, OLD.subscription_tier, NEW.subscription_tier,
        'database_trigger',
        'BLOCKED: Attempted to downgrade from founder tier',
        jsonb_build_object('blocked', true, 'attempted_new_tier', NEW.subscription_tier)
      );
      
      -- Prevent the change by keeping the old tier
      NEW.subscription_tier := OLD.subscription_tier;
      
      RAISE WARNING 'FOUNDER PROTECTION: Blocked attempt to downgrade Founder tier for coach %', OLD.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.protect_founder_tier() TO service_role;