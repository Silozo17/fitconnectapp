-- Create gym_campaigns table for marketing campaigns
CREATE TABLE public.gym_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'draft',
  target_audience TEXT NOT NULL DEFAULT 'all_members',
  audience_filter JSONB,
  content JSONB NOT NULL DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  stats JSONB DEFAULT '{"sent": 0, "opened": 0, "clicked": 0}',
  created_by UUID REFERENCES public.gym_staff(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create gym_promotions table for offers and discounts
CREATE TABLE public.gym_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  promotion_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10,2),
  promo_code TEXT,
  applicable_plans UUID[],
  start_date DATE NOT NULL,
  end_date DATE,
  max_redemptions INTEGER,
  current_redemptions INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  terms_conditions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gym_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_promotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gym_campaigns
CREATE POLICY "Staff can view campaigns for their gym"
  ON public.gym_campaigns FOR SELECT
  TO authenticated
  USING (
    gym_id IN (
      SELECT gym_id FROM public.gym_staff 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Staff with manage permission can manage campaigns"
  ON public.gym_campaigns FOR ALL
  TO authenticated
  USING (
    gym_id IN (
      SELECT gym_id FROM public.gym_staff 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'manager', 'marketing')
    )
  );

-- RLS Policies for gym_promotions
CREATE POLICY "Anyone can view active promotions"
  ON public.gym_promotions FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Staff can view all promotions for their gym"
  ON public.gym_promotions FOR SELECT
  TO authenticated
  USING (
    gym_id IN (
      SELECT gym_id FROM public.gym_staff 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Staff with manage permission can manage promotions"
  ON public.gym_promotions FOR ALL
  TO authenticated
  USING (
    gym_id IN (
      SELECT gym_id FROM public.gym_staff 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'manager', 'marketing')
    )
  );

-- Indexes
CREATE INDEX idx_gym_campaigns_gym ON public.gym_campaigns(gym_id);
CREATE INDEX idx_gym_campaigns_status ON public.gym_campaigns(status);
CREATE INDEX idx_gym_promotions_gym ON public.gym_promotions(gym_id);
CREATE INDEX idx_gym_promotions_code ON public.gym_promotions(promo_code);
CREATE INDEX idx_gym_promotions_active ON public.gym_promotions(is_active);