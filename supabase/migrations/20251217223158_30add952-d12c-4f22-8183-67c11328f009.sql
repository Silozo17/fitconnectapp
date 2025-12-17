-- Backfill historical leads from existing messages
-- This ensures all coach-client conversations appear in the pipeline

INSERT INTO coach_leads (coach_id, client_id, stage, source, created_at, updated_at)
SELECT DISTINCT ON (m.receiver_id, m.sender_id)
  m.receiver_id AS coach_id,
  m.sender_id AS client_id,
  CASE 
    -- Check if already a client (deal closed)
    WHEN EXISTS (
      SELECT 1 FROM coach_clients cc 
      WHERE cc.coach_id = m.receiver_id AND cc.client_id = m.sender_id AND cc.status = 'active'
    ) THEN 'deal_closed'
    -- Check if coach sent pricing/package info (offer sent)
    WHEN EXISTS (
      SELECT 1 FROM messages m2 
      WHERE m2.sender_id = m.receiver_id AND m2.receiver_id = m.sender_id
      AND (
        m2.content ILIKE '%📦 Package:%' 
        OR m2.content ILIKE '%📋 Subscription:%'
        OR m2.content ILIKE '%💰 Price:%'
        OR m2.content ILIKE '%🛒 Ready to purchase%'
        OR m2.content ILIKE '%pricing%'
        OR m2.content ILIKE '%per session%'
        OR m2.content ILIKE '%per month%'
        OR m2.content ILIKE '%£%'
        OR m2.content ILIKE '%$%'
      )
    ) THEN 'offer_sent'
    -- Check if coach replied (conversation started)
    WHEN EXISTS (
      SELECT 1 FROM messages m2 
      WHERE m2.sender_id = m.receiver_id AND m2.receiver_id = m.sender_id
    ) THEN 'conversation_started'
    -- Otherwise new lead
    ELSE 'new_lead'
  END AS stage,
  'message_backfill' AS source,
  MIN(m.created_at) AS created_at,
  NOW() AS updated_at
FROM messages m
-- Only messages where receiver is a coach
JOIN coach_profiles cp ON cp.id = m.receiver_id
-- And sender is a client
JOIN client_profiles clp ON clp.id = m.sender_id
GROUP BY m.receiver_id, m.sender_id
ON CONFLICT (coach_id, client_id) DO UPDATE SET
  stage = CASE 
    WHEN coach_leads.stage = 'new_lead' THEN EXCLUDED.stage
    WHEN coach_leads.stage = 'conversation_started' AND EXCLUDED.stage IN ('offer_sent', 'deal_closed') THEN EXCLUDED.stage
    WHEN coach_leads.stage = 'offer_sent' AND EXCLUDED.stage = 'deal_closed' THEN EXCLUDED.stage
    ELSE coach_leads.stage
  END,
  updated_at = NOW();

-- Also backfill leads from booking requests (client requested booking = lead)
INSERT INTO coach_leads (coach_id, client_id, stage, source, created_at, updated_at)
SELECT DISTINCT ON (br.coach_id, br.client_id)
  br.coach_id,
  br.client_id,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM coach_clients cc 
      WHERE cc.coach_id = br.coach_id AND cc.client_id = br.client_id AND cc.status = 'active'
    ) THEN 'deal_closed'
    WHEN br.status = 'accepted' THEN 'deal_closed'
    ELSE 'new_lead'
  END AS stage,
  'booking_backfill' AS source,
  MIN(br.created_at) AS created_at,
  NOW() AS updated_at
FROM booking_requests br
GROUP BY br.coach_id, br.client_id, br.status
ON CONFLICT (coach_id, client_id) DO NOTHING;

-- Update offer_sent_at for leads that are in offer_sent stage
UPDATE coach_leads cl
SET offer_sent_at = (
  SELECT MIN(m.created_at)
  FROM messages m
  WHERE m.sender_id = cl.coach_id 
  AND m.receiver_id = cl.client_id
  AND (
    m.content ILIKE '%📦 Package:%' 
    OR m.content ILIKE '%📋 Subscription:%'
    OR m.content ILIKE '%💰 Price:%'
    OR m.content ILIKE '%🛒 Ready to purchase%'
    OR m.content ILIKE '%pricing%'
    OR m.content ILIKE '%per session%'
    OR m.content ILIKE '%per month%'
    OR m.content ILIKE '%£%'
    OR m.content ILIKE '%$%'
  )
)
WHERE cl.stage = 'offer_sent' AND cl.offer_sent_at IS NULL;

-- Update deal_closed_at for leads that are in deal_closed stage
UPDATE coach_leads cl
SET deal_closed_at = (
  SELECT MIN(cc.created_at)
  FROM coach_clients cc
  WHERE cc.coach_id = cl.coach_id AND cc.client_id = cl.client_id
)
WHERE cl.stage = 'deal_closed' AND cl.deal_closed_at IS NULL;

-- Improve the offer detection trigger with better patterns
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
    -- Check for structured package/subscription messages or pricing keywords
    IF NEW.content ILIKE '%📦 Package:%' 
       OR NEW.content ILIKE '%📋 Subscription:%'
       OR NEW.content ILIKE '%💰 Price:%'
       OR NEW.content ILIKE '%🛒 Ready to purchase%'
       OR NEW.content ILIKE '%pricing%' 
       OR NEW.content ILIKE '%package%'
       OR NEW.content ILIKE '%subscribe%'
       OR NEW.content ILIKE '%sign up%'
       OR NEW.content ILIKE '%signup%'
       OR NEW.content ILIKE '%per session%'
       OR NEW.content ILIKE '%per month%'
       OR NEW.content ILIKE '%per week%'
       OR NEW.content ILIKE '%£%'
       OR NEW.content ILIKE '%$%'
       OR NEW.content ILIKE '% GBP%'
       OR NEW.content ILIKE '% USD%'
       OR NEW.content ILIKE '%sessions for%'
       OR NEW.content ILIKE '%month plan%'
       OR NEW.content ILIKE '%weekly plan%' THEN
      
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