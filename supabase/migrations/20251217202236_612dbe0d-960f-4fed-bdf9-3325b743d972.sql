-- Coach Boosts table - tracks which coaches have Boost enabled
CREATE TABLE public.coach_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  activated_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  total_clients_acquired INTEGER DEFAULT 0,
  total_fees_paid NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(coach_id)
);

-- Boost Client Attributions - tracks NEW clients acquired via Boost
CREATE TABLE public.boost_client_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  attributed_at TIMESTAMPTZ DEFAULT now(),
  first_booking_id UUID REFERENCES public.booking_requests(id),
  booking_amount NUMERIC(10,2),
  fee_amount NUMERIC(10,2),
  fee_status TEXT DEFAULT 'pending' CHECK (fee_status IN ('pending', 'charged', 'waived')),
  stripe_charge_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(coach_id, client_id)
);

-- Boost Settings table - admin configurable rates
CREATE TABLE public.boost_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_rate NUMERIC(4,2) DEFAULT 0.30,
  min_fee NUMERIC(10,2) DEFAULT 10.00,
  max_fee NUMERIC(10,2) DEFAULT 100.00,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES public.admin_profiles(id)
);

-- Insert default boost settings
INSERT INTO public.boost_settings (commission_rate, min_fee, max_fee) 
VALUES (0.30, 10.00, 100.00);

-- Enable RLS
ALTER TABLE public.coach_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boost_client_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boost_settings ENABLE ROW LEVEL SECURITY;

-- Coach Boosts policies
CREATE POLICY "Coaches can view their own boost status"
ON public.coach_boosts FOR SELECT
USING (coach_id IN (
  SELECT id FROM coach_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Coaches can update their own boost status"
ON public.coach_boosts FOR UPDATE
USING (coach_id IN (
  SELECT id FROM coach_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Coaches can insert their own boost"
ON public.coach_boosts FOR INSERT
WITH CHECK (coach_id IN (
  SELECT id FROM coach_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all boosts"
ON public.coach_boosts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active boosts for marketplace"
ON public.coach_boosts FOR SELECT
USING (is_active = true);

-- Boost Client Attributions policies
CREATE POLICY "Coaches can view their own attributions"
ON public.boost_client_attributions FOR SELECT
USING (coach_id IN (
  SELECT id FROM coach_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all attributions"
ON public.boost_client_attributions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert attributions"
ON public.boost_client_attributions FOR INSERT
WITH CHECK (true);

-- Boost Settings policies
CREATE POLICY "Anyone can view boost settings"
ON public.boost_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage boost settings"
ON public.boost_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to calculate boost fee
CREATE OR REPLACE FUNCTION public.calculate_boost_fee(booking_amount NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  settings RECORD;
  calculated_fee NUMERIC;
BEGIN
  SELECT commission_rate, min_fee, max_fee INTO settings
  FROM boost_settings WHERE is_active = true LIMIT 1;
  
  IF settings IS NULL THEN
    settings.commission_rate := 0.30;
    settings.min_fee := 10.00;
    settings.max_fee := 100.00;
  END IF;
  
  calculated_fee := booking_amount * settings.commission_rate;
  calculated_fee := GREATEST(calculated_fee, settings.min_fee);
  calculated_fee := LEAST(calculated_fee, settings.max_fee);
  
  RETURN calculated_fee;
END;
$$;

-- Trigger to update timestamps
CREATE TRIGGER update_coach_boosts_updated_at
BEFORE UPDATE ON public.coach_boosts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();