-- Phase 5: Add pending_tier column to track scheduled plan changes (downgrades)
-- When a user downgrades, we record the new tier here and apply it at period end
ALTER TABLE public.platform_subscriptions 
ADD COLUMN IF NOT EXISTS pending_tier text DEFAULT NULL;

-- Add a comment explaining the column purpose
COMMENT ON COLUMN public.platform_subscriptions.pending_tier IS 'Stores the tier the subscription will change to at the end of the current billing period (for downgrades)';
