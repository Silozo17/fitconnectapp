-- Fix notify_coach_new_message to handle all sender types
CREATE OR REPLACE FUNCTION public.notify_coach_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_is_coach BOOLEAN;
  sender_name TEXT;
BEGIN
  SELECT EXISTS(SELECT 1 FROM coach_profiles WHERE id = NEW.receiver_id) INTO v_is_coach;
  
  IF v_is_coach THEN
    -- Try client profile first
    SELECT first_name INTO sender_name FROM client_profiles WHERE id = NEW.sender_id;
    
    -- Try coach profile if not found
    IF sender_name IS NULL THEN
      SELECT display_name INTO sender_name FROM coach_profiles WHERE id = NEW.sender_id;
    END IF;
    
    -- Try admin profile if not found
    IF sender_name IS NULL THEN
      SELECT COALESCE(display_name, first_name) INTO sender_name FROM admin_profiles WHERE id = NEW.sender_id;
    END IF;
    
    -- Final fallback
    sender_name := COALESCE(sender_name, 'Someone');
    
    PERFORM notify_coach(
      NEW.receiver_id,
      'message',
      'New Message',
      sender_name || ' sent you a message.',
      jsonb_build_object('sender_id', NEW.sender_id::text, 'message_id', NEW.id::text)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Fix notify_client_new_message to handle all sender types
CREATE OR REPLACE FUNCTION public.notify_client_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_is_client BOOLEAN;
  sender_name TEXT;
BEGIN
  SELECT EXISTS(SELECT 1 FROM client_profiles WHERE id = NEW.receiver_id) INTO v_is_client;
  
  IF v_is_client THEN
    -- Try coach profile first
    SELECT display_name INTO sender_name FROM coach_profiles WHERE id = NEW.sender_id;
    
    -- Try client profile if not found (client-to-client messaging)
    IF sender_name IS NULL THEN
      SELECT first_name INTO sender_name FROM client_profiles WHERE id = NEW.sender_id;
    END IF;
    
    -- Try admin profile if not found
    IF sender_name IS NULL THEN
      SELECT COALESCE(display_name, first_name) INTO sender_name FROM admin_profiles WHERE id = NEW.sender_id;
    END IF;
    
    -- Final fallback
    sender_name := COALESCE(sender_name, 'Your coach');
    
    PERFORM notify_client(
      NEW.receiver_id,
      'message',
      'New Message',
      sender_name || ' sent you a message.',
      jsonb_build_object('sender_id', NEW.sender_id::text, 'message_id', NEW.id::text)
    );
  END IF;
  RETURN NEW;
END;
$$;