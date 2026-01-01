-- Fix the search_path security warning for the create_lead_on_new_message function
CREATE OR REPLACE FUNCTION public.create_lead_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_coach_profile_id UUID;
  v_is_existing_client BOOLEAN;
  v_sender_is_client BOOLEAN;
  v_has_existing_request BOOLEAN;
BEGIN
  -- Check if receiver is a coach profile
  SELECT id INTO v_coach_profile_id 
  FROM public.coach_profiles 
  WHERE id = NEW.receiver_id;
  
  IF v_coach_profile_id IS NOT NULL THEN
    -- Check if sender is a client profile
    SELECT EXISTS(
      SELECT 1 FROM public.client_profiles 
      WHERE id = NEW.sender_id
    ) INTO v_sender_is_client;
    
    IF v_sender_is_client THEN
      -- Check if sender is already an established client
      SELECT EXISTS(
        SELECT 1 FROM public.coach_clients 
        WHERE coach_id = v_coach_profile_id 
        AND client_id = NEW.sender_id 
        AND status = 'active'
      ) INTO v_is_existing_client;
      
      -- If not an existing client, create lead and connection request
      IF NOT v_is_existing_client THEN
        -- Create lead (existing behavior)
        INSERT INTO public.coach_leads (coach_id, client_id, stage, source)
        VALUES (v_coach_profile_id, NEW.sender_id, 'new_lead', 'message')
        ON CONFLICT (coach_id, client_id) DO NOTHING;
        
        -- Check if connection request already exists
        SELECT EXISTS(
          SELECT 1 FROM public.connection_requests
          WHERE coach_id = v_coach_profile_id
          AND client_id = NEW.sender_id
        ) INTO v_has_existing_request;
        
        -- Create connection request if none exists
        IF NOT v_has_existing_request THEN
          INSERT INTO public.connection_requests (
            coach_id, 
            client_id, 
            status, 
            message
          )
          VALUES (
            v_coach_profile_id, 
            NEW.sender_id, 
            'pending', 
            NEW.content
          );
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;