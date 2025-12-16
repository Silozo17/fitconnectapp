-- Add Stripe Connect account ID to coach profiles
ALTER TABLE public.coach_profiles 
ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_connect_onboarded BOOLEAN DEFAULT false;

-- Add Stripe-related fields to client package purchases
ALTER TABLE public.client_package_purchases
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

-- Add Stripe-related fields to client subscriptions
ALTER TABLE public.client_subscriptions
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create platform_subscriptions for coach subscriptions to the platform
CREATE TABLE IF NOT EXISTS public.platform_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  tier TEXT NOT NULL DEFAULT 'starter', -- starter, pro, enterprise
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their own platform subscription"
ON public.platform_subscriptions FOR SELECT
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage platform subscriptions"
ON public.platform_subscriptions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_platform_subscriptions_updated_at
BEFORE UPDATE ON public.platform_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();