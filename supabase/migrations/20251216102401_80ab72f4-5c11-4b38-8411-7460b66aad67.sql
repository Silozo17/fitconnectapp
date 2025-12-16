-- Coach packages (session bundles)
CREATE TABLE public.coach_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  session_count INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'GBP',
  validity_days INTEGER DEFAULT 90,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Coach subscription plans (recurring)
CREATE TABLE public.coach_subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'GBP',
  billing_period TEXT NOT NULL DEFAULT 'monthly', -- monthly, quarterly, yearly
  sessions_per_period INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client package purchases
CREATE TABLE public.client_package_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  coach_id UUID NOT NULL,
  package_id UUID NOT NULL,
  sessions_total INTEGER NOT NULL,
  sessions_used INTEGER DEFAULT 0,
  amount_paid NUMERIC NOT NULL,
  status TEXT DEFAULT 'active', -- active, expired, fully_used
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client subscriptions
CREATE TABLE public.client_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  coach_id UUID NOT NULL,
  plan_id UUID NOT NULL,
  status TEXT DEFAULT 'active', -- active, cancelled, paused, expired
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_package_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_subscriptions ENABLE ROW LEVEL SECURITY;

-- Coach packages policies
CREATE POLICY "Anyone can view active packages"
ON public.coach_packages FOR SELECT
USING (is_active = true);

CREATE POLICY "Coaches can manage their own packages"
ON public.coach_packages FOR ALL
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

-- Coach subscription plans policies
CREATE POLICY "Anyone can view active subscription plans"
ON public.coach_subscription_plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Coaches can manage their own subscription plans"
ON public.coach_subscription_plans FOR ALL
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

-- Client package purchases policies
CREATE POLICY "Clients can view their own purchases"
ON public.client_package_purchases FOR SELECT
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can view purchases of their packages"
ON public.client_package_purchases FOR SELECT
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can create purchases"
ON public.client_package_purchases FOR INSERT
WITH CHECK (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

-- Client subscriptions policies
CREATE POLICY "Clients can view their own subscriptions"
ON public.client_subscriptions FOR SELECT
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can view subscriptions to their plans"
ON public.client_subscriptions FOR SELECT
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can create subscriptions"
ON public.client_subscriptions FOR INSERT
WITH CHECK (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can update their own subscriptions"
ON public.client_subscriptions FOR UPDATE
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_coach_packages_updated_at
BEFORE UPDATE ON public.coach_packages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_subscription_plans_updated_at
BEFORE UPDATE ON public.coach_subscription_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_subscriptions_updated_at
BEFORE UPDATE ON public.client_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();