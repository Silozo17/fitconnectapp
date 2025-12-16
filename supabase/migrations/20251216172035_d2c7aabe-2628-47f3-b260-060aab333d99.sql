
-- Helper function to notify a specific coach
CREATE OR REPLACE FUNCTION public.notify_coach(
  p_coach_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM coach_profiles WHERE id = p_coach_id;
  IF v_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (v_user_id, p_type, p_title, p_message, p_data);
  END IF;
END;
$$;

-- Helper function to notify a specific client
CREATE OR REPLACE FUNCTION public.notify_client(
  p_client_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM client_profiles WHERE id = p_client_id;
  IF v_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (v_user_id, p_type, p_title, p_message, p_data);
  END IF;
END;
$$;

-- COACH NOTIFICATIONS

-- 1. Notify coach when they receive a connection request
CREATE OR REPLACE FUNCTION public.notify_coach_connection_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  client_name TEXT;
BEGIN
  SELECT COALESCE(first_name || ' ' || last_name, first_name, 'A client') 
  INTO client_name FROM client_profiles WHERE id = NEW.client_id;
  
  PERFORM notify_coach(
    NEW.coach_id,
    'connection_request',
    'New Connection Request',
    client_name || ' wants to connect with you.',
    jsonb_build_object('request_id', NEW.id::text, 'client_id', NEW.client_id::text)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_connection_request_created
  AFTER INSERT ON connection_requests
  FOR EACH ROW EXECUTE FUNCTION notify_coach_connection_request();

-- 2. Notify coach when they receive a message from a client
CREATE OR REPLACE FUNCTION public.notify_coach_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_is_coach BOOLEAN;
  client_name TEXT;
BEGIN
  -- Check if receiver is a coach
  SELECT EXISTS(SELECT 1 FROM coach_profiles WHERE id = NEW.receiver_id) INTO v_is_coach;
  
  IF v_is_coach THEN
    SELECT COALESCE(first_name, 'Someone') INTO client_name FROM client_profiles WHERE id = NEW.sender_id;
    
    PERFORM notify_coach(
      NEW.receiver_id,
      'message',
      'New Message',
      client_name || ' sent you a message.',
      jsonb_build_object('sender_id', NEW.sender_id::text, 'message_id', NEW.id::text)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_to_coach
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_coach_new_message();

-- 3. Notify coach when they receive a review (update existing)
CREATE OR REPLACE FUNCTION public.notify_coach_new_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM notify_coach(
    NEW.coach_id,
    'review',
    'New Review Received',
    'You received a ' || NEW.rating || '-star review.',
    jsonb_build_object('review_id', NEW.id::text, 'rating', NEW.rating)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_for_coach
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION notify_coach_new_review();

-- 4. Notify coach when a session is cancelled
CREATE OR REPLACE FUNCTION public.notify_coach_session_cancelled()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  client_name TEXT;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    SELECT COALESCE(first_name, 'A client') INTO client_name FROM client_profiles WHERE id = NEW.client_id;
    
    PERFORM notify_coach(
      NEW.coach_id,
      'session_cancelled',
      'Session Cancelled',
      client_name || ' cancelled their session.',
      jsonb_build_object('session_id', NEW.id::text, 'client_id', NEW.client_id::text)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_session_cancelled_notify_coach
  AFTER UPDATE ON coaching_sessions
  FOR EACH ROW EXECUTE FUNCTION notify_coach_session_cancelled();

-- 5. Notify coach of new booking request
CREATE OR REPLACE FUNCTION public.notify_coach_booking_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  client_name TEXT;
BEGIN
  SELECT COALESCE(first_name, 'A client') INTO client_name FROM client_profiles WHERE id = NEW.client_id;
  
  PERFORM notify_coach(
    NEW.coach_id,
    'booking_request',
    'New Booking Request',
    client_name || ' requested to book a session.',
    jsonb_build_object('booking_id', NEW.id::text, 'client_id', NEW.client_id::text)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_booking_request_created
  AFTER INSERT ON booking_requests
  FOR EACH ROW EXECUTE FUNCTION notify_coach_booking_request();

-- CLIENT NOTIFICATIONS

-- 1. Notify client when connection request is accepted
CREATE OR REPLACE FUNCTION public.notify_client_connection_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  coach_name TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    SELECT COALESCE(display_name, 'Your coach') INTO coach_name FROM coach_profiles WHERE id = NEW.coach_id;
    
    PERFORM notify_client(
      NEW.client_id,
      'connection_accepted',
      'Connection Accepted',
      coach_name || ' accepted your connection request.',
      jsonb_build_object('request_id', NEW.id::text, 'coach_id', NEW.coach_id::text)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_connection_accepted
  AFTER UPDATE ON connection_requests
  FOR EACH ROW EXECUTE FUNCTION notify_client_connection_accepted();

-- 2. Notify client when they receive a message from a coach
CREATE OR REPLACE FUNCTION public.notify_client_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_is_client BOOLEAN;
  coach_name TEXT;
BEGIN
  -- Check if receiver is a client
  SELECT EXISTS(SELECT 1 FROM client_profiles WHERE id = NEW.receiver_id) INTO v_is_client;
  
  IF v_is_client THEN
    SELECT COALESCE(display_name, 'Your coach') INTO coach_name FROM coach_profiles WHERE id = NEW.sender_id;
    
    PERFORM notify_client(
      NEW.receiver_id,
      'message',
      'New Message',
      coach_name || ' sent you a message.',
      jsonb_build_object('sender_id', NEW.sender_id::text, 'message_id', NEW.id::text)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_to_client
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_client_new_message();

-- 3. Notify client when a session is scheduled
CREATE OR REPLACE FUNCTION public.notify_client_session_scheduled()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  coach_name TEXT;
BEGIN
  SELECT COALESCE(display_name, 'Your coach') INTO coach_name FROM coach_profiles WHERE id = NEW.coach_id;
  
  PERFORM notify_client(
    NEW.client_id,
    'session_scheduled',
    'Session Scheduled',
    coach_name || ' scheduled a session with you.',
    jsonb_build_object('session_id', NEW.id::text, 'coach_id', NEW.coach_id::text, 'scheduled_at', NEW.scheduled_at::text)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_session_scheduled
  AFTER INSERT ON coaching_sessions
  FOR EACH ROW EXECUTE FUNCTION notify_client_session_scheduled();

-- 4. Notify client when a plan is assigned
CREATE OR REPLACE FUNCTION public.notify_client_plan_assigned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  plan_name TEXT;
  coach_name TEXT;
BEGIN
  SELECT name INTO plan_name FROM training_plans WHERE id = NEW.plan_id;
  SELECT COALESCE(display_name, 'Your coach') INTO coach_name FROM coach_profiles WHERE id = NEW.coach_id;
  
  PERFORM notify_client(
    NEW.client_id,
    'plan_assigned',
    'New Plan Assigned',
    coach_name || ' assigned you a new plan: ' || COALESCE(plan_name, 'Training Plan'),
    jsonb_build_object('assignment_id', NEW.id::text, 'plan_id', NEW.plan_id::text)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_plan_assigned
  AFTER INSERT ON plan_assignments
  FOR EACH ROW EXECUTE FUNCTION notify_client_plan_assigned();

-- 5. Notify client when session is cancelled/rescheduled by coach
CREATE OR REPLACE FUNCTION public.notify_client_session_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  coach_name TEXT;
BEGIN
  SELECT COALESCE(display_name, 'Your coach') INTO coach_name FROM coach_profiles WHERE id = NEW.coach_id;
  
  -- Session cancelled
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    PERFORM notify_client(
      NEW.client_id,
      'session_cancelled',
      'Session Cancelled',
      coach_name || ' cancelled your session.',
      jsonb_build_object('session_id', NEW.id::text, 'coach_id', NEW.coach_id::text)
    );
  -- Session rescheduled
  ELSIF NEW.rescheduled_from IS NOT NULL AND OLD.rescheduled_from IS NULL THEN
    PERFORM notify_client(
      NEW.client_id,
      'session_rescheduled',
      'Session Rescheduled',
      coach_name || ' rescheduled your session.',
      jsonb_build_object('session_id', NEW.id::text, 'new_time', NEW.scheduled_at::text)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_session_updated_notify_client
  AFTER UPDATE ON coaching_sessions
  FOR EACH ROW EXECUTE FUNCTION notify_client_session_updated();
