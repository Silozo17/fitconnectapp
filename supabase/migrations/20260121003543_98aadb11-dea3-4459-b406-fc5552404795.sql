-- Create tier history table for accurate upgrade/downgrade tracking
CREATE TABLE public.subscription_tier_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  old_tier TEXT,
  new_tier TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  change_type TEXT NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'cancel', 'reactivate', 'change'))
);

-- Enable RLS
ALTER TABLE public.subscription_tier_history ENABLE ROW LEVEL SECURITY;

-- Admin read policy
CREATE POLICY "Admins can read tier history"
  ON public.subscription_tier_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = auth.uid())
  );

-- Create trigger function to log tier changes
CREATE OR REPLACE FUNCTION log_subscription_tier_change()
RETURNS TRIGGER AS $$
DECLARE
  tier_order TEXT[] := ARRAY['free', 'starter', 'pro', 'enterprise', 'founder'];
  old_index INT;
  new_index INT;
  change TEXT;
BEGIN
  IF OLD.tier IS DISTINCT FROM NEW.tier THEN
    old_index := COALESCE(array_position(tier_order, COALESCE(OLD.tier, 'free')), 0);
    new_index := COALESCE(array_position(tier_order, NEW.tier), 0);
    
    IF new_index > old_index THEN
      change := 'upgrade';
    ELSIF new_index < old_index THEN
      change := 'downgrade';
    ELSE
      change := 'change';
    END IF;
    
    INSERT INTO subscription_tier_history (coach_id, old_tier, new_tier, change_type)
    VALUES (NEW.coach_id, OLD.tier, NEW.tier, change);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to platform_subscriptions
CREATE TRIGGER on_subscription_tier_change
  AFTER UPDATE ON platform_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_tier_change();

-- Insert test automation rules
INSERT INTO admin_automation_rules (
  name, trigger_type, target_audience, message_type, message_template, 
  is_enabled, max_sends_per_user
) VALUES (
  'Welcome New Clients',
  'user_signup_client',
  'clients',
  '["in_app", "push"]',
  'Welcome to FitConnect, {first_name}! 🎉 Start your fitness journey by finding the perfect coach.',
  true,
  1
);

INSERT INTO admin_automation_rules (
  name, trigger_type, target_audience, message_type, message_template,
  is_enabled, max_sends_per_user
) VALUES (
  'Welcome New Coaches',
  'user_signup_coach',
  'coaches',
  '["in_app", "push"]',
  'Welcome to FitConnect, {first_name}! Complete your profile to start attracting clients.',
  true,
  1
);

INSERT INTO admin_automation_rules (
  name, trigger_type, target_audience, message_type, message_template,
  is_enabled, max_sends_per_user
) VALUES (
  'Coach Upgrade Congratulations',
  'coach_subscription_upgraded',
  'coaches',
  '["in_app", "push"]',
  'Congratulations {first_name}! You''ve upgraded your subscription. Enjoy your new features!',
  true,
  1
);

INSERT INTO admin_automation_rules (
  name, trigger_type, trigger_config, target_audience, message_type, message_template,
  is_enabled, cooldown_days
) VALUES (
  'Re-engage Inactive Users',
  'inactive_days',
  '{"days": 7}',
  'all',
  '["in_app"]',
  'Hey {first_name}, we miss you! Come back and continue making progress on your fitness goals.',
  true,
  7
);

INSERT INTO admin_automation_rules (
  name, trigger_type, target_audience, message_type, message_template,
  is_enabled, cooldown_days
) VALUES (
  'Session Completed - Ask for Review',
  'session_completed',
  'clients',
  '["in_app"]',
  'Great job completing your session, {first_name}! How was it? Leave a review for your coach.',
  true,
  1
);

INSERT INTO admin_automation_rules (
  name, trigger_type, target_audience, message_type, message_template,
  is_enabled, max_sends_per_user
) VALUES (
  'Coach Verified',
  'coach_verified',
  'coaches',
  '["in_app", "push"]',
  'Congratulations {first_name}! Your profile is now verified. You''ll appear higher in search results.',
  true,
  1
);