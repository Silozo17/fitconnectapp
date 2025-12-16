-- Enable REPLICA IDENTITY FULL on messages table for better realtime support
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add unique constraint on coach_leads to prevent duplicates
ALTER TABLE public.coach_leads 
ADD CONSTRAINT coach_leads_coach_client_unique UNIQUE (coach_id, client_id);

-- Create trigger function to create lead when coach receives new message from non-client
CREATE OR REPLACE FUNCTION public.create_lead_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_coach_profile_id UUID;
  v_is_existing_client BOOLEAN;
  v_sender_is_client BOOLEAN;
BEGIN
  -- Check if receiver is a coach profile
  SELECT id INTO v_coach_profile_id 
  FROM public.coach_profiles 
  WHERE id = NEW.receiver_id;
  
  IF v_coach_profile_id IS NOT NULL THEN
    -- Check if sender is a client profile (not another coach or admin)
    SELECT EXISTS(
      SELECT 1 FROM public.client_profiles 
      WHERE id = NEW.sender_id
    ) INTO v_sender_is_client;
    
    IF v_sender_is_client THEN
      -- Check if sender is already an established client of this coach
      SELECT EXISTS(
        SELECT 1 FROM public.coach_clients 
        WHERE coach_id = v_coach_profile_id 
        AND client_id = NEW.sender_id 
        AND status = 'active'
      ) INTO v_is_existing_client;
      
      -- If not an existing client, create lead
      IF NOT v_is_existing_client THEN
        INSERT INTO public.coach_leads (coach_id, client_id, stage, source)
        VALUES (v_coach_profile_id, NEW.sender_id, 'new_lead', 'message')
        ON CONFLICT (coach_id, client_id) DO NOTHING;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger function to update lead stage when coach replies
CREATE OR REPLACE FUNCTION public.update_lead_on_coach_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_is_coach BOOLEAN;
BEGIN
  -- Check if sender is a coach
  SELECT EXISTS(
    SELECT 1 FROM public.coach_profiles WHERE id = NEW.sender_id
  ) INTO v_is_coach;
  
  IF v_is_coach THEN
    -- Update lead stage to conversation_started if currently new_lead
    UPDATE public.coach_leads
    SET stage = 'conversation_started', updated_at = NOW()
    WHERE coach_id = NEW.sender_id
    AND client_id = NEW.receiver_id
    AND stage = 'new_lead';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger function to update lead stage when offer is sent
CREATE OR REPLACE FUNCTION public.update_lead_on_offer_sent()
RETURNS TRIGGER AS $$
DECLARE
  v_is_coach BOOLEAN;
BEGIN
  -- Check if sender is a coach
  SELECT EXISTS(
    SELECT 1 FROM public.coach_profiles WHERE id = NEW.sender_id
  ) INTO v_is_coach;
  
  IF v_is_coach THEN
    -- Check if message contains pricing indicators
    IF NEW.content ILIKE '%pricing%' 
       OR NEW.content ILIKE '%package%'
       OR NEW.content ILIKE '%subscribe%'
       OR NEW.content ILIKE '%sign up%'
       OR NEW.content ILIKE '%signup%'
       OR NEW.content ILIKE '%£%'
       OR NEW.content ILIKE '%$%'
       OR NEW.content ILIKE '%per session%'
       OR NEW.content ILIKE '%per month%' THEN
      
      UPDATE public.coach_leads
      SET stage = 'offer_sent', offer_sent_at = NOW(), updated_at = NOW()
      WHERE coach_id = NEW.sender_id
      AND client_id = NEW.receiver_id
      AND stage IN ('new_lead', 'conversation_started');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger function to close deal when client becomes established
CREATE OR REPLACE FUNCTION public.update_lead_on_deal_closed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.coach_leads
  SET stage = 'deal_closed', deal_closed_at = NOW(), updated_at = NOW()
  WHERE coach_id = NEW.coach_id
  AND client_id = NEW.client_id
  AND stage != 'deal_closed';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers on messages table
DROP TRIGGER IF EXISTS trigger_create_lead_on_message ON public.messages;
CREATE TRIGGER trigger_create_lead_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_lead_on_new_message();

DROP TRIGGER IF EXISTS trigger_update_lead_on_reply ON public.messages;
CREATE TRIGGER trigger_update_lead_on_reply
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_on_coach_reply();

DROP TRIGGER IF EXISTS trigger_update_lead_on_offer ON public.messages;
CREATE TRIGGER trigger_update_lead_on_offer
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_on_offer_sent();

-- Create trigger on coach_clients table for deal closed
DROP TRIGGER IF EXISTS trigger_close_lead_on_client ON public.coach_clients;
CREATE TRIGGER trigger_close_lead_on_client
  AFTER INSERT ON public.coach_clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_on_deal_closed();