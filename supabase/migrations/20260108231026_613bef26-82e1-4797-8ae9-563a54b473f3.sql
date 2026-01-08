-- Drop and recreate the admin_update_coach_tier function with proper GUC handling
-- The issue is that the GUC needs to be LOCAL to the transaction for the trigger to see it

CREATE OR REPLACE FUNCTION public.admin_update_coach_tier(p_coach_id UUID, p_new_tier TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set the admin override flag LOCAL to this transaction
  -- Using 'true' as third param makes it transaction-local
  PERFORM set_config('app.admin_tier_change', 'true', true);
  
  -- Now update the tier (trigger will see the flag and allow it)
  UPDATE public.coach_profiles 
  SET subscription_tier = p_new_tier,
      updated_at = NOW()
  WHERE id = p_coach_id;
  
  -- No need to reset - transaction-local GUC auto-resets when transaction ends
END;
$$;

-- Grant execute to service role
GRANT EXECUTE ON FUNCTION public.admin_update_coach_tier(UUID, TEXT) TO service_role;