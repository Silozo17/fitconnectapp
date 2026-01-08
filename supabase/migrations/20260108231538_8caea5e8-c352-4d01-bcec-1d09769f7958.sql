-- Recreate the tier logging trigger (doesn't block, just logs)
CREATE OR REPLACE FUNCTION public.log_subscription_tier_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if tier actually changed
  IF OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier THEN
    INSERT INTO public.subscription_tier_changes (
      coach_id, old_tier, new_tier, change_source, change_reason
    ) VALUES (
      NEW.id, 
      OLD.subscription_tier, 
      NEW.subscription_tier,
      'database_trigger',
      'Tier changed via coach_profiles update'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create the logging trigger as AFTER trigger (doesn't interfere with update)
CREATE TRIGGER log_tier_change_trigger
AFTER UPDATE OF subscription_tier ON public.coach_profiles
FOR EACH ROW
WHEN (OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier)
EXECUTE FUNCTION log_subscription_tier_change();

-- Now create a SMARTER founder protection trigger that uses a session-local flag
-- The key is to check for application_name which we can set in the admin function
CREATE OR REPLACE FUNCTION public.protect_founder_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bypass_allowed BOOLEAN;
BEGIN
  -- If changing FROM founder tier, check if this is an authorized admin action
  IF OLD.subscription_tier = 'founder' AND NEW.subscription_tier != 'founder' THEN
    -- Check if bypass is allowed via application_name (set by admin function)
    bypass_allowed := current_setting('application_name', true) = 'admin_tier_bypass';
    
    IF NOT bypass_allowed THEN
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

-- Create the protection trigger as BEFORE trigger (can modify NEW values)
CREATE TRIGGER protect_founder_tier_trigger
BEFORE UPDATE OF subscription_tier ON public.coach_profiles
FOR EACH ROW
EXECUTE FUNCTION protect_founder_tier();

-- Create the admin bypass function that sets application_name
CREATE OR REPLACE FUNCTION public.admin_update_coach_tier(p_coach_id UUID, p_new_tier TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_tier TEXT;
BEGIN
  -- Get current tier for logging
  SELECT subscription_tier INTO old_tier FROM public.coach_profiles WHERE id = p_coach_id;
  
  -- Set the application_name to bypass the trigger
  -- This works because application_name is a session variable that the trigger can read
  PERFORM set_config('application_name', 'admin_tier_bypass', true);
  
  -- Now update the tier
  UPDATE public.coach_profiles 
  SET subscription_tier = p_new_tier,
      updated_at = NOW()
  WHERE id = p_coach_id;
  
  -- Reset application_name
  PERFORM set_config('application_name', '', true);
  
  -- Log this admin action
  INSERT INTO public.subscription_tier_changes (
    coach_id, old_tier, new_tier, change_source, change_reason
  ) VALUES (
    p_coach_id, old_tier, p_new_tier, 'admin_override', 'Admin tier change via admin_update_coach_tier function'
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.admin_update_coach_tier(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.protect_founder_tier() TO service_role;
GRANT EXECUTE ON FUNCTION public.log_subscription_tier_change() TO service_role;