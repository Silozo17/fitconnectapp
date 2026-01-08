-- Fix the protect_founder_tier trigger to allow GUC variable propagation
-- Removing SET search_path = public to allow session variables to be visible
CREATE OR REPLACE FUNCTION public.protect_founder_tier()
RETURNS TRIGGER AS $$
DECLARE
  is_admin_action BOOLEAN;
BEGIN
  -- If changing FROM founder tier, check if this is an authorized admin action
  IF OLD.subscription_tier = 'founder' AND NEW.subscription_tier != 'founder' THEN
    -- Check if this is an admin-authorized change
    is_admin_action := COALESCE(current_setting('app.admin_tier_change', true), 'false') = 'true';
    
    IF NOT is_admin_action THEN
      -- Log the blocked attempt
      INSERT INTO public.subscription_tier_changes (
        coach_id, old_tier, new_tier, change_source, change_reason, metadata
      ) VALUES (
        OLD.id, OLD.subscription_tier, NEW.subscription_tier,
        COALESCE(current_setting('app.tier_change_source', true), 'blocked_attempt'),
        'BLOCKED: Attempted unauthorized Founder tier downgrade',
        jsonb_build_object('blocked', true, 'timestamp', now(), 'attempted_new_tier', NEW.subscription_tier)
      );
      
      -- Prevent the change by keeping the old tier
      NEW.subscription_tier := OLD.subscription_tier;
      
      RAISE WARNING 'FOUNDER PROTECTION: Blocked attempt to downgrade Founder tier for coach %', OLD.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;