-- Helper function to notify all admin users
CREATE OR REPLACE FUNCTION public.notify_admins(
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  SELECT ur.user_id, p_type, p_title, p_message, p_data
  FROM user_roles ur
  WHERE ur.role IN ('admin', 'manager', 'staff');
END;
$$;

-- Trigger function for new user sign-up
CREATE OR REPLACE FUNCTION public.notify_admin_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Don't notify for admin/manager/staff users (they are the admins)
  IF NEW.role NOT IN ('admin', 'manager', 'staff') THEN
    PERFORM notify_admins(
      'new_user',
      'New User Registered',
      'A new ' || NEW.role || ' has joined the platform.',
      jsonb_build_object('user_id', NEW.user_id::text, 'role', NEW.role::text)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_user_notify_admin ON user_roles;
CREATE TRIGGER on_new_user_notify_admin
  AFTER INSERT ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_user();

-- Trigger function for coach verification document submission
CREATE OR REPLACE FUNCTION public.notify_admin_verification_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  coach_name TEXT;
BEGIN
  IF NEW.status = 'pending' THEN
    SELECT display_name INTO coach_name FROM coach_profiles WHERE id = NEW.coach_id;
    PERFORM notify_admins(
      'verification_request',
      'New Verification Document',
      COALESCE(coach_name, 'A coach') || ' has submitted a document for verification.',
      jsonb_build_object('coach_id', NEW.coach_id::text, 'document_type', NEW.document_type)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_verification_document_notify_admin ON coach_verification_documents;
CREATE TRIGGER on_verification_document_notify_admin
  AFTER INSERT ON coach_verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_verification_request();

-- Trigger function for new review posted
CREATE OR REPLACE FUNCTION public.notify_admin_new_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  coach_name TEXT;
BEGIN
  SELECT display_name INTO coach_name FROM coach_profiles WHERE id = NEW.coach_id;
  PERFORM notify_admins(
    'new_review',
    'New Review Posted',
    'A ' || NEW.rating || '-star review was posted for ' || COALESCE(coach_name, 'a coach') || '.',
    jsonb_build_object('review_id', NEW.id::text, 'coach_id', NEW.coach_id::text, 'rating', NEW.rating)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_review_notify_admin ON reviews;
CREATE TRIGGER on_new_review_notify_admin
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_review();

-- Trigger function for new coaching session booked
CREATE OR REPLACE FUNCTION public.notify_admin_new_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM notify_admins(
    'new_booking',
    'New Session Booked',
    'A new coaching session has been scheduled.',
    jsonb_build_object('session_id', NEW.id::text, 'coach_id', NEW.coach_id::text, 'client_id', NEW.client_id::text)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_session_notify_admin ON coaching_sessions;
CREATE TRIGGER on_new_session_notify_admin
  AFTER INSERT ON coaching_sessions
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_session();