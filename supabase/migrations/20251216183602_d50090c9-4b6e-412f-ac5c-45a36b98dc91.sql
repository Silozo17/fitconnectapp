-- Add unique constraint on coach_clients for upsert operations
ALTER TABLE public.coach_clients 
ADD CONSTRAINT coach_clients_coach_client_unique 
UNIQUE (coach_id, client_id);

-- Create lead when booking request is submitted
CREATE OR REPLACE FUNCTION public.create_lead_on_booking_request()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.coach_leads (coach_id, client_id, stage, source)
  VALUES (NEW.coach_id, NEW.client_id, 'new_lead', 'booking')
  ON CONFLICT (coach_id, client_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_create_lead_on_booking
  AFTER INSERT ON public.booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_lead_on_booking_request();

-- Close lead when package is purchased
CREATE OR REPLACE FUNCTION public.close_lead_on_package_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Create coach_clients relationship (triggers deal_closed via existing trigger)
  INSERT INTO public.coach_clients (coach_id, client_id, status, plan_type)
  VALUES (NEW.coach_id, NEW.client_id, 'active', 'package')
  ON CONFLICT (coach_id, client_id) DO UPDATE SET status = 'active', updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_close_lead_on_purchase
  AFTER INSERT ON public.client_package_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.close_lead_on_package_purchase();

-- Close lead when subscription is created
CREATE OR REPLACE FUNCTION public.close_lead_on_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.coach_clients (coach_id, client_id, status, plan_type)
  VALUES (NEW.coach_id, NEW.client_id, 'active', 'subscription')
  ON CONFLICT (coach_id, client_id) DO UPDATE SET status = 'active', updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_close_lead_on_subscription
  AFTER INSERT ON public.client_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.close_lead_on_subscription();