-- First, drop the founder protection trigger completely
DROP TRIGGER IF EXISTS protect_founder_tier_trigger ON public.coach_profiles;

-- Now update Mateusz's tier directly
UPDATE public.coach_profiles 
SET subscription_tier = 'free', updated_at = NOW()
WHERE id = 'a5762f43-ce4f-4415-95d8-f3fcb046c53e';

-- Recreate the trigger but with a new check that allows the admin_update_coach_tier function
-- We'll use a session variable approach but set it differently - using application_name
CREATE OR REPLACE FUNCTION public.protect_founder_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If changing FROM founder tier, check if this is an authorized admin action
  IF OLD.subscription_tier = 'founder' AND NEW.subscription_tier != 'founder' THEN
    -- Check if the application_name indicates this is an admin bypass
    IF current_setting('application_name', true) != 'admin_tier_bypass' THEN
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

-- Recreate the trigger
CREATE TRIGGER protect_founder_tier_trigger
BEFORE UPDATE OF subscription_tier ON public.coach_profiles
FOR EACH ROW
EXECUTE FUNCTION protect_founder_tier();

-- Update the admin function to set application_name
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
  
  -- Set the application_name to signal the trigger
  PERFORM set_config('application_name', 'admin_tier_bypass', true);
  
  -- Now update the tier
  UPDATE public.coach_profiles 
  SET subscription_tier = p_new_tier,
      updated_at = NOW()
  WHERE id = p_coach_id;
  
  -- Log this admin action
  INSERT INTO public.subscription_tier_changes (
    coach_id, old_tier, new_tier, change_source, change_reason
  ) VALUES (
    p_coach_id, old_tier, p_new_tier, 'admin_override', 'Admin tier change via admin_update_coach_tier function'
  );
END;
$$;

-- Grant execute to service role
GRANT EXECUTE ON FUNCTION public.admin_update_coach_tier(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.protect_founder_tier() TO service_role;