-- Fix the admin_update_coach_tier function to properly propagate session variable
CREATE OR REPLACE FUNCTION public.admin_update_coach_tier(
  p_coach_id UUID,
  p_new_tier TEXT
) RETURNS VOID AS $$
BEGIN
  -- Set the admin override flag (session-wide for trigger visibility)
  PERFORM set_config('app.admin_tier_change', 'true', false);
  
  -- Now update the tier (trigger will see the flag and allow it)
  UPDATE public.coach_profiles 
  SET subscription_tier = p_new_tier,
      updated_at = NOW()
  WHERE id = p_coach_id;
  
  -- Reset the flag after the update to prevent unintended side effects
  PERFORM set_config('app.admin_tier_change', 'false', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;