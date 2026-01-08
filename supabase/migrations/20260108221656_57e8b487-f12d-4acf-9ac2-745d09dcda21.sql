-- Create a secure function for admins to update coach subscription tier
-- This bypasses the founder protection trigger by setting the admin flag
CREATE OR REPLACE FUNCTION public.admin_update_coach_tier(
  p_coach_id UUID,
  p_new_tier TEXT
) RETURNS VOID AS $$
BEGIN
  -- Set the admin override flag (transaction-local)
  PERFORM set_config('app.admin_tier_change', 'true', true);
  
  -- Now update the tier (trigger will see the flag and allow it)
  UPDATE public.coach_profiles 
  SET subscription_tier = p_new_tier,
      updated_at = NOW()
  WHERE id = p_coach_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;