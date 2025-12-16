-- Platform features table for feature flag system
CREATE TABLE public.platform_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  feature_type TEXT DEFAULT 'boolean',
  default_value JSONB DEFAULT 'false',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tier features mapping
CREATE TABLE public.tier_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL,
  feature_id UUID REFERENCES public.platform_features(id) ON DELETE CASCADE,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tier, feature_id)
);

-- Coach feature overrides (admin can override features for specific coaches)
CREATE TABLE public.coach_feature_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES public.platform_features(id) ON DELETE CASCADE,
  value JSONB NOT NULL,
  granted_by UUID,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(coach_id, feature_id)
);

-- Review disputes table
CREATE TABLE public.review_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin granted subscriptions (free plans given by admin)
CREATE TABLE public.admin_granted_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  granted_by UUID,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.platform_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_granted_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_features (admins only)
CREATE POLICY "Admins can manage platform features" ON public.platform_features
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view platform features" ON public.platform_features
  FOR SELECT USING (true);

-- RLS Policies for tier_features (admins manage, all view)
CREATE POLICY "Admins can manage tier features" ON public.tier_features
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view tier features" ON public.tier_features
  FOR SELECT USING (true);

-- RLS Policies for coach_feature_overrides
CREATE POLICY "Admins can manage coach feature overrides" ON public.coach_feature_overrides
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches can view their own overrides" ON public.coach_feature_overrides
  FOR SELECT USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

-- RLS Policies for review_disputes
CREATE POLICY "Admins can manage review disputes" ON public.review_disputes
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches can create and view their own disputes" ON public.review_disputes
  FOR SELECT USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can insert disputes" ON public.review_disputes
  FOR INSERT WITH CHECK (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

-- RLS Policies for admin_granted_subscriptions
CREATE POLICY "Admins can manage granted subscriptions" ON public.admin_granted_subscriptions
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches can view their granted subscriptions" ON public.admin_granted_subscriptions
  FOR SELECT USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

-- Insert default platform features
INSERT INTO public.platform_features (feature_key, name, description, feature_type, default_value) VALUES
  ('max_clients', 'Maximum Clients', 'Maximum number of clients a coach can have', 'number', '3'::jsonb),
  ('session_packages', 'Session Packages', 'Ability to create session packages', 'boolean', 'false'::jsonb),
  ('subscription_plans', 'Subscription Plans', 'Ability to create subscription plans', 'boolean', 'false'::jsonb),
  ('nutrition_builder', 'Nutrition Builder', 'Access level for nutrition builder', 'tier', '"none"'::jsonb),
  ('training_builder', 'Training Plan Builder', 'Access level for training plan builder', 'tier', '"basic"'::jsonb),
  ('ai_meal_suggestions', 'AI Meal Suggestions', 'Access to AI-powered meal suggestions', 'tier', '"none"'::jsonb),
  ('custom_branding', 'Custom Branding', 'Ability to customize branding', 'boolean', 'false'::jsonb),
  ('priority_support', 'Priority Support', 'Access to priority support', 'boolean', 'false'::jsonb),
  ('marketplace_boost', 'Marketplace Boosting', 'Boosted visibility in marketplace', 'boolean', 'false'::jsonb),
  ('analytics_dashboard', 'Analytics Dashboard', 'Level of analytics access', 'tier', '"basic"'::jsonb);

-- Insert tier feature values for free tier
INSERT INTO public.tier_features (tier, feature_id, value) 
SELECT 'free', id, 
  CASE feature_key
    WHEN 'max_clients' THEN '3'::jsonb
    WHEN 'session_packages' THEN 'false'::jsonb
    WHEN 'subscription_plans' THEN 'false'::jsonb
    WHEN 'nutrition_builder' THEN '"none"'::jsonb
    WHEN 'training_builder' THEN '"basic"'::jsonb
    WHEN 'ai_meal_suggestions' THEN '"none"'::jsonb
    WHEN 'custom_branding' THEN 'false'::jsonb
    WHEN 'priority_support' THEN 'false'::jsonb
    WHEN 'marketplace_boost' THEN 'false'::jsonb
    WHEN 'analytics_dashboard' THEN '"basic"'::jsonb
  END
FROM public.platform_features;

-- Insert tier feature values for starter tier
INSERT INTO public.tier_features (tier, feature_id, value) 
SELECT 'starter', id, 
  CASE feature_key
    WHEN 'max_clients' THEN '15'::jsonb
    WHEN 'session_packages' THEN 'true'::jsonb
    WHEN 'subscription_plans' THEN 'false'::jsonb
    WHEN 'nutrition_builder' THEN '"basic"'::jsonb
    WHEN 'training_builder' THEN '"full"'::jsonb
    WHEN 'ai_meal_suggestions' THEN '"none"'::jsonb
    WHEN 'custom_branding' THEN 'false'::jsonb
    WHEN 'priority_support' THEN 'false'::jsonb
    WHEN 'marketplace_boost' THEN 'false'::jsonb
    WHEN 'analytics_dashboard' THEN '"standard"'::jsonb
  END
FROM public.platform_features;

-- Insert tier feature values for pro tier
INSERT INTO public.tier_features (tier, feature_id, value) 
SELECT 'pro', id, 
  CASE feature_key
    WHEN 'max_clients' THEN '50'::jsonb
    WHEN 'session_packages' THEN 'true'::jsonb
    WHEN 'subscription_plans' THEN 'true'::jsonb
    WHEN 'nutrition_builder' THEN '"full"'::jsonb
    WHEN 'training_builder' THEN '"full"'::jsonb
    WHEN 'ai_meal_suggestions' THEN '"limited"'::jsonb
    WHEN 'custom_branding' THEN 'false'::jsonb
    WHEN 'priority_support' THEN 'true'::jsonb
    WHEN 'marketplace_boost' THEN 'false'::jsonb
    WHEN 'analytics_dashboard' THEN '"advanced"'::jsonb
  END
FROM public.platform_features;

-- Insert tier feature values for enterprise tier
INSERT INTO public.tier_features (tier, feature_id, value) 
SELECT 'enterprise', id, 
  CASE feature_key
    WHEN 'max_clients' THEN '999'::jsonb
    WHEN 'session_packages' THEN 'true'::jsonb
    WHEN 'subscription_plans' THEN 'true'::jsonb
    WHEN 'nutrition_builder' THEN '"full"'::jsonb
    WHEN 'training_builder' THEN '"full"'::jsonb
    WHEN 'ai_meal_suggestions' THEN '"unlimited"'::jsonb
    WHEN 'custom_branding' THEN 'true'::jsonb
    WHEN 'priority_support' THEN 'true'::jsonb
    WHEN 'marketplace_boost' THEN 'true'::jsonb
    WHEN 'analytics_dashboard' THEN '"full"'::jsonb
  END
FROM public.platform_features;