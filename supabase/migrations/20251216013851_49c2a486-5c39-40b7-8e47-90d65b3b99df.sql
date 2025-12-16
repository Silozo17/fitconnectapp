-- Create admin_profiles table
CREATE TABLE public.admin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  first_name text,
  last_name text,
  display_name text,
  phone text,
  department text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- RLS for admin_profiles
CREATE POLICY "Admins can view all admin profiles"
ON public.admin_profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own admin profile"
ON public.admin_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own admin profile"
ON public.admin_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert admin profiles"
ON public.admin_profiles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all admin profiles"
ON public.admin_profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete admin profiles"
ON public.admin_profiles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create subscriptions table for coach subscription tracking
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free',
  amount decimal(10,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  status text DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS for subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view all subscriptions"
ON public.subscriptions FOR SELECT
USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Coaches can view their own subscriptions"
ON public.subscriptions FOR SELECT
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage subscriptions"
ON public.subscriptions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create transactions table for all platform transactions
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type text NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  coach_id uuid REFERENCES public.coach_profiles(id),
  client_id uuid REFERENCES public.client_profiles(id),
  session_id uuid REFERENCES public.coaching_sessions(id),
  subscription_id uuid REFERENCES public.subscriptions(id),
  commission_amount decimal(10,2) DEFAULT 0,
  commission_rate decimal(5,2) DEFAULT 0.15,
  status text DEFAULT 'completed',
  description text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS for transactions
CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view all transactions"
ON public.transactions FOR SELECT
USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can manage transactions"
ON public.transactions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create platform_settings table
CREATE TABLE public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS for platform_settings
CREATE POLICY "Admins can view settings"
ON public.platform_settings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage settings"
ON public.platform_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, description) VALUES
('commission_rate', '{"default": 0.15}', 'Platform commission rate (15%)'),
('subscription_tiers', '{"free": 0, "basic": 29, "pro": 79, "enterprise": 199}', 'Monthly subscription prices'),
('auto_approve_coaches', '{"enabled": false}', 'Auto-approve coach registrations');

-- Update handle_new_user function to handle admin profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
BEGIN
  user_role := COALESCE(
    (new.raw_user_meta_data ->> 'role')::app_role,
    'client'::app_role
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);
  
  IF user_role = 'client' THEN
    INSERT INTO public.client_profiles (user_id)
    VALUES (new.id);
  ELSIF user_role = 'coach' THEN
    INSERT INTO public.coach_profiles (user_id)
    VALUES (new.id);
  ELSIF user_role IN ('admin', 'manager', 'staff') THEN
    INSERT INTO public.admin_profiles (user_id)
    VALUES (new.id);
  END IF;
  
  RETURN new;
END;
$function$;

-- Add trigger for updated_at on admin_profiles
CREATE TRIGGER update_admin_profiles_updated_at
BEFORE UPDATE ON public.admin_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();