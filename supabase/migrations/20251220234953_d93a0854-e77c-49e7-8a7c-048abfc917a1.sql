-- Update notify_client function to check push preferences before creating notifications
CREATE OR REPLACE FUNCTION public.notify_client(p_client_id uuid, p_type text, p_title text, p_message text, p_data jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_pref_enabled BOOLEAN := true;
BEGIN
  SELECT user_id INTO v_user_id FROM client_profiles WHERE id = p_client_id;
  
  IF v_user_id IS NOT NULL THEN
    -- Check push preferences based on notification type (defaults to enabled if no preference exists)
    SELECT 
      CASE 
        WHEN p_type ILIKE '%booking%' OR p_type ILIKE '%session%' THEN COALESCE(push_bookings, true)
        WHEN p_type ILIKE '%message%' THEN COALESCE(push_messages, true)
        WHEN p_type ILIKE '%reminder%' THEN COALESCE(push_reminders, true)
        WHEN p_type ILIKE '%subscription%' OR p_type ILIKE '%plan%' THEN COALESCE(push_bookings, true)
        WHEN p_type ILIKE '%connection%' OR p_type ILIKE '%friend%' THEN COALESCE(push_messages, true)
        ELSE true
      END
    INTO v_pref_enabled
    FROM notification_preferences
    WHERE user_id = v_user_id;
    
    -- If no preference record exists, default to enabled
    IF v_pref_enabled IS NULL THEN
      v_pref_enabled := true;
    END IF;
    
    -- Only insert notification if preference allows it
    IF v_pref_enabled THEN
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (v_user_id, p_type, p_title, p_message, p_data);
    END IF;
  END IF;
END;
$function$;

-- Update notify_coach function to check push preferences before creating notifications
CREATE OR REPLACE FUNCTION public.notify_coach(p_coach_id uuid, p_type text, p_title text, p_message text, p_data jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_pref_enabled BOOLEAN := true;
BEGIN
  SELECT user_id INTO v_user_id FROM coach_profiles WHERE id = p_coach_id;
  
  IF v_user_id IS NOT NULL THEN
    -- Check push preferences based on notification type (defaults to enabled if no preference exists)
    SELECT 
      CASE 
        WHEN p_type ILIKE '%booking%' OR p_type ILIKE '%session%' THEN COALESCE(push_bookings, true)
        WHEN p_type ILIKE '%message%' THEN COALESCE(push_messages, true)
        WHEN p_type ILIKE '%reminder%' THEN COALESCE(push_reminders, true)
        WHEN p_type ILIKE '%subscription%' OR p_type ILIKE '%plan%' THEN COALESCE(push_bookings, true)
        WHEN p_type ILIKE '%review%' THEN COALESCE(push_bookings, true)
        WHEN p_type ILIKE '%lead%' THEN COALESCE(push_messages, true)
        ELSE true
      END
    INTO v_pref_enabled
    FROM notification_preferences
    WHERE user_id = v_user_id;
    
    -- If no preference record exists, default to enabled
    IF v_pref_enabled IS NULL THEN
      v_pref_enabled := true;
    END IF;
    
    -- Only insert notification if preference allows it
    IF v_pref_enabled THEN
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (v_user_id, p_type, p_title, p_message, p_data);
    END IF;
  END IF;
END;
$function$;