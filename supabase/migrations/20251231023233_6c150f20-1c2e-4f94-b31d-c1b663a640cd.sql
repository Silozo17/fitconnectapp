-- Add the trigger function for founder protection (table and policies already exist)
CREATE OR REPLACE FUNCTION public.log_subscription_tier_change()
RETURNS TRIGGER AS $$
BEGIN
  -- FOUNDER PROTECTION: Log but never allow actual changes FROM founder
  IF OLD.subscription_tier = 'founder' AND NEW.subscription_tier != 'founder' THEN
    -- Log the attempted change
    INSERT INTO public.subscription_tier_changes (
      coach_id, 
      old_tier, 
      new_tier, 
      change_source, 
      change_reason,
      metadata
    ) VALUES (
      NEW.id,
      OLD.subscription_tier,
      NEW.subscription_tier,
      'database_trigger',
      'BLOCKED: Attempted to downgrade from founder tier',
      jsonb_build_object('blocked', true, 'attempted_new_tier', NEW.subscription_tier)
    );
    
    -- CRITICAL: Prevent the downgrade by keeping the old tier
    NEW.subscription_tier := 'founder';
    RETURN NEW;
  END IF;

  -- Log the tier change
  INSERT INTO public.subscription_tier_changes (
    coach_id, 
    old_tier, 
    new_tier, 
    change_source, 
    change_reason
  ) VALUES (
    NEW.id,
    OLD.subscription_tier,
    NEW.subscription_tier,
    'database_trigger',
    'Tier changed via coach_profiles update'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on coach_profiles for tier changes
DROP TRIGGER IF EXISTS track_tier_changes ON public.coach_profiles;
CREATE TRIGGER track_tier_changes
BEFORE UPDATE OF subscription_tier ON public.coach_profiles
FOR EACH ROW
WHEN (OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier)
EXECUTE FUNCTION public.log_subscription_tier_change();