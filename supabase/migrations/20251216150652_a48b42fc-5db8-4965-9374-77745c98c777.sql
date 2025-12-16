-- Admin dashboard widgets for customizable dashboard
CREATE TABLE IF NOT EXISTS admin_dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_profiles(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  size TEXT DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large', 'full')),
  is_visible BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Admins can manage their own widgets
CREATE POLICY "Admins can manage their own widgets"
ON admin_dashboard_widgets FOR ALL
USING (
  admin_id IN (SELECT id FROM admin_profiles WHERE user_id = auth.uid())
  OR admin_id IS NULL
);

-- Add category to platform features
ALTER TABLE platform_features ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE platform_features ADD COLUMN IF NOT EXISTS is_enforced BOOLEAN DEFAULT false;

-- Platform tier Stripe mapping
CREATE TABLE IF NOT EXISTS platform_tier_stripe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT UNIQUE NOT NULL,
  stripe_product_id TEXT,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_synced BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_tier_stripe ENABLE ROW LEVEL SECURITY;

-- Only admins can manage tier stripe mappings
CREATE POLICY "Admins can manage tier stripe mappings"
ON platform_tier_stripe FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default widget configurations (null admin_id = defaults for all)
INSERT INTO admin_dashboard_widgets (admin_id, widget_type, title, position, size)
VALUES 
  (NULL, 'stats_users', 'Total Users', 0, 'small'),
  (NULL, 'stats_coaches', 'Active Coaches', 1, 'small'),
  (NULL, 'stats_sessions', 'Scheduled Sessions', 2, 'small'),
  (NULL, 'stats_revenue', 'Monthly Revenue', 3, 'small'),
  (NULL, 'recent_activity', 'Recent Activity', 4, 'medium'),
  (NULL, 'quick_actions', 'Quick Actions', 5, 'medium'),
  (NULL, 'pending_verifications', 'Pending Verifications', 6, 'medium'),
  (NULL, 'recent_signups', 'Recent Signups', 7, 'medium')
ON CONFLICT DO NOTHING;