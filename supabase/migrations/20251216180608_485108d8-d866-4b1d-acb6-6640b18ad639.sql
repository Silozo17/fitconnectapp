-- 1. Notify coach when they get a new subscriber
CREATE OR REPLACE FUNCTION public.notify_coach_new_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  client_name TEXT;
  plan_name TEXT;
BEGIN
  SELECT COALESCE(first_name || ' ' || last_name, first_name, 'A client') 
  INTO client_name FROM client_profiles WHERE id = NEW.client_id;
  
  SELECT name INTO plan_name FROM coach_subscription_plans WHERE id = NEW.plan_id;
  
  PERFORM notify_coach(
    NEW.coach_id,
    'new_subscription',
    'New Subscriber!',
    client_name || ' subscribed to your ' || COALESCE(plan_name, 'plan') || '.',
    jsonb_build_object('subscription_id', NEW.id::text, 'client_id', NEW.client_id::text, 'plan_id', NEW.plan_id::text)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_subscription_notify_coach
  AFTER INSERT ON client_subscriptions
  FOR EACH ROW EXECUTE FUNCTION notify_coach_new_subscription();

-- 2. Notify client when subscription is created (confirmation)
CREATE OR REPLACE FUNCTION public.notify_client_subscription_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  coach_name TEXT;
  plan_name TEXT;
BEGIN
  SELECT COALESCE(display_name, 'Your coach') INTO coach_name FROM coach_profiles WHERE id = NEW.coach_id;
  SELECT name INTO plan_name FROM coach_subscription_plans WHERE id = NEW.plan_id;
  
  PERFORM notify_client(
    NEW.client_id,
    'subscription_confirmed',
    'Subscription Active',
    'Your subscription to ' || coach_name || '''s ' || COALESCE(plan_name, 'plan') || ' is now active.',
    jsonb_build_object('subscription_id', NEW.id::text, 'coach_id', NEW.coach_id::text)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_subscription_confirmed_notify_client
  AFTER INSERT ON client_subscriptions
  FOR EACH ROW EXECUTE FUNCTION notify_client_subscription_confirmed();

-- 3. Notify admin of new subscription
CREATE OR REPLACE FUNCTION public.notify_admin_new_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  coach_name TEXT;
  client_name TEXT;
BEGIN
  SELECT COALESCE(display_name, 'Unknown coach') INTO coach_name FROM coach_profiles WHERE id = NEW.coach_id;
  SELECT COALESCE(first_name, 'A client') INTO client_name FROM client_profiles WHERE id = NEW.client_id;
  
  PERFORM notify_admins(
    'new_subscription',
    'New Subscription',
    client_name || ' subscribed to ' || coach_name || '''s plan.',
    jsonb_build_object('subscription_id', NEW.id::text, 'coach_id', NEW.coach_id::text, 'client_id', NEW.client_id::text)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_subscription_notify_admin
  AFTER INSERT ON client_subscriptions
  FOR EACH ROW EXECUTE FUNCTION notify_admin_new_subscription();

-- 4. Notify client when their booking request is accepted or rejected
CREATE OR REPLACE FUNCTION public.notify_client_booking_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  coach_name TEXT;
BEGIN
  -- Only trigger on status change from 'pending'
  IF OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected', 'declined') THEN
    SELECT COALESCE(display_name, 'Your coach') INTO coach_name FROM coach_profiles WHERE id = NEW.coach_id;
    
    IF NEW.status = 'accepted' THEN
      PERFORM notify_client(
        NEW.client_id,
        'booking_accepted',
        'Booking Request Accepted',
        coach_name || ' accepted your booking request.',
        jsonb_build_object('booking_id', NEW.id::text, 'coach_id', NEW.coach_id::text)
      );
    ELSE
      PERFORM notify_client(
        NEW.client_id,
        'booking_declined',
        'Booking Request Declined',
        coach_name || ' was unable to accept your booking request.',
        jsonb_build_object('booking_id', NEW.id::text, 'coach_id', NEW.coach_id::text)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_booking_response_notify_client
  AFTER UPDATE ON booking_requests
  FOR EACH ROW EXECUTE FUNCTION notify_client_booking_response();

-- 5. Notify coach and client when subscription is cancelled
CREATE OR REPLACE FUNCTION public.notify_subscription_cancelled()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  coach_name TEXT;
  client_name TEXT;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    SELECT COALESCE(display_name, 'Your coach') INTO coach_name FROM coach_profiles WHERE id = NEW.coach_id;
    SELECT COALESCE(first_name, 'A client') INTO client_name FROM client_profiles WHERE id = NEW.client_id;
    
    -- Notify coach
    PERFORM notify_coach(
      NEW.coach_id,
      'subscription_cancelled',
      'Subscription Cancelled',
      client_name || ' cancelled their subscription.',
      jsonb_build_object('subscription_id', NEW.id::text, 'client_id', NEW.client_id::text)
    );
    
    -- Notify client (confirmation)
    PERFORM notify_client(
      NEW.client_id,
      'subscription_cancelled',
      'Subscription Cancelled',
      'Your subscription with ' || coach_name || ' has been cancelled.',
      jsonb_build_object('subscription_id', NEW.id::text, 'coach_id', NEW.coach_id::text)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_subscription_cancelled
  AFTER UPDATE ON client_subscriptions
  FOR EACH ROW EXECUTE FUNCTION notify_subscription_cancelled();