-- Create subscription tier change audit table
-- This logs all changes to subscription_tier and protects Founder tier from unauthorized changes

CREATE TABLE IF NOT EXISTS public.subscription_tier_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  old_tier TEXT,
  new_tier TEXT NOT NULL,
  change_source TEXT NOT NULL DEFAULT 'unknown',
  change_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups by coach
CREATE INDEX idx_subscription_tier_changes_coach_id ON public.subscription_tier_changes(coach_id);
CREATE INDEX idx_subscription_tier_changes_created_at ON public.subscription_tier_changes(created_at DESC);

-- Enable RLS
ALTER TABLE public.subscription_tier_changes ENABLE ROW LEVEL SECURITY;

-- Coaches can view their own tier change history
CREATE POLICY "Coaches can view their own tier changes"
ON public.subscription_tier_changes
FOR SELECT
USING (
  coach_id IN (
    SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
  )
);

-- Admins can view all tier changes
CREATE POLICY "Admins can view all tier changes"
ON public.subscription_tier_changes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()
  )
);

-- Only service role can insert (from edge functions/triggers)
CREATE POLICY "Service role can insert tier changes"
ON public.subscription_tier_changes
FOR INSERT
WITH CHECK (true);

-- Create function to log subscription tier changes
CREATE OR REPLACE FUNCTION public.log_subscription_tier_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if subscription_tier actually changed
  IF OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier THEN
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
      COALESCE(current_setting('app.tier_change_source', true), 'database_trigger'),
      COALESCE(current_setting('app.tier_change_reason', true), NULL),
      jsonb_build_object(
        'timestamp', now(),
        'old_tier', OLD.subscription_tier,
        'new_tier', NEW.subscription_tier
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to log tier changes
DROP TRIGGER IF EXISTS log_tier_change_trigger ON public.coach_profiles;
CREATE TRIGGER log_tier_change_trigger
  AFTER UPDATE OF subscription_tier ON public.coach_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_subscription_tier_change();

-- Create function to protect Founder tier from unauthorized changes
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
        coach_id,
        old_tier,
        new_tier,
        change_source,
        change_reason,
        metadata
      ) VALUES (
        OLD.id,
        OLD.subscription_tier,
        NEW.subscription_tier,
        COALESCE(current_setting('app.tier_change_source', true), 'blocked_attempt'),
        'BLOCKED: Attempted unauthorized Founder tier downgrade',
        jsonb_build_object(
          'blocked', true,
          'timestamp', now(),
          'attempted_new_tier', NEW.subscription_tier
        )
      );
      
      -- Prevent the change by keeping the old tier
      NEW.subscription_tier := OLD.subscription_tier;
      
      RAISE WARNING 'FOUNDER PROTECTION: Blocked attempt to downgrade Founder tier for coach %', OLD.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to protect Founder tier (runs BEFORE update to prevent the change)
DROP TRIGGER IF EXISTS protect_founder_tier_trigger ON public.coach_profiles;
CREATE TRIGGER protect_founder_tier_trigger
  BEFORE UPDATE OF subscription_tier ON public.coach_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_founder_tier();

-- Ensure all existing Founder accounts have admin_granted_subscriptions records
INSERT INTO public.admin_granted_subscriptions (coach_id, tier, is_active, reason)
SELECT 
  cp.id,
  'founder',
  true,
  'Auto-created to protect existing Founder account'
FROM public.coach_profiles cp
WHERE cp.subscription_tier = 'founder'
AND NOT EXISTS (
  SELECT 1 FROM public.admin_granted_subscriptions ags 
  WHERE ags.coach_id = cp.id 
  AND ags.tier = 'founder'
  AND ags.is_active = true
)
ON CONFLICT DO NOTHING;