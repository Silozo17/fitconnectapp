-- Add subscription and admin management fields to gym_profiles
ALTER TABLE gym_profiles 
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS location_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_by UUID,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Create platform_gym_feature_toggles table for admin to disable features per gym
CREATE TABLE IF NOT EXISTS platform_gym_feature_toggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gym_profiles(id) ON DELETE CASCADE NOT NULL,
  feature_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  disabled_by UUID,
  disabled_at TIMESTAMPTZ,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gym_id, feature_key)
);

-- Enable RLS on platform_gym_feature_toggles
ALTER TABLE platform_gym_feature_toggles ENABLE ROW LEVEL SECURITY;

-- Admins can manage all feature toggles
CREATE POLICY "Admins can manage gym feature toggles"
  ON platform_gym_feature_toggles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Gym owners can view their own toggles
CREATE POLICY "Gym owners can view their feature toggles"
  ON platform_gym_feature_toggles
  FOR SELECT
  USING (
    gym_id IN (
      SELECT id FROM gym_profiles WHERE user_id = auth.uid()
    )
  );

-- Create platform_gym_announcements table for mass communication to gyms
CREATE TABLE IF NOT EXISTS platform_gym_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_gym_ids UUID[] DEFAULT NULL,
  sent_by UUID NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivery_method TEXT DEFAULT 'in_app',
  read_by JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on platform_gym_announcements
ALTER TABLE platform_gym_announcements ENABLE ROW LEVEL SECURITY;

-- Admins can manage all announcements
CREATE POLICY "Admins can manage gym announcements"
  ON platform_gym_announcements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Gym owners can view announcements targeted at them
CREATE POLICY "Gym owners can view their announcements"
  ON platform_gym_announcements
  FOR SELECT
  USING (
    target_gym_ids IS NULL
    OR EXISTS (
      SELECT 1 FROM gym_profiles
      WHERE user_id = auth.uid()
      AND id = ANY(target_gym_ids)
    )
  );

-- Create admin_impersonation_sessions table for tracking impersonation
CREATE TABLE IF NOT EXISTS admin_impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_profiles(id),
  target_user_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_entity_id UUID NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  reason TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS on admin_impersonation_sessions
ALTER TABLE admin_impersonation_sessions ENABLE ROW LEVEL SECURITY;

-- Only admins can access impersonation sessions
CREATE POLICY "Admins can manage impersonation sessions"
  ON admin_impersonation_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Add index for faster gym listing queries
CREATE INDEX IF NOT EXISTS idx_gym_profiles_status ON gym_profiles(status);
CREATE INDEX IF NOT EXISTS idx_gym_profiles_subscription_status ON gym_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_gym_profiles_is_verified ON gym_profiles(is_verified);

-- Add index for feature toggles
CREATE INDEX IF NOT EXISTS idx_platform_gym_feature_toggles_gym_id ON platform_gym_feature_toggles(gym_id);