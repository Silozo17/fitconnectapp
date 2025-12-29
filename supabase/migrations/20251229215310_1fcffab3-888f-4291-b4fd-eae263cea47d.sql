-- Add payment_mode to coaching_sessions table
ALTER TABLE public.coaching_sessions 
ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'free';

-- Add payment_mode to session_offers table  
ALTER TABLE public.session_offers
ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'paid';

-- Add payment_status column if not exists
ALTER TABLE public.coaching_sessions
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT NULL;

-- Add price column for paid sessions
ALTER TABLE public.coaching_sessions
ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT NULL;

-- Add currency column for paid sessions
ALTER TABLE public.coaching_sessions
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'GBP';

-- Add stripe_payment_intent_id for tracking payments
ALTER TABLE public.coaching_sessions
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT DEFAULT NULL;

-- Create validation trigger for payment_mode values (instead of CHECK constraint)
CREATE OR REPLACE FUNCTION public.validate_coaching_session_payment_mode()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_mode IS NOT NULL AND NEW.payment_mode NOT IN ('free', 'use_credits', 'paid') THEN
    RAISE EXCEPTION 'Invalid payment_mode: %. Must be free, use_credits, or paid', NEW.payment_mode;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_session_payment_mode ON public.coaching_sessions;
CREATE TRIGGER validate_session_payment_mode
  BEFORE INSERT OR UPDATE ON public.coaching_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_coaching_session_payment_mode();

-- Create validation trigger for session_offers payment_mode
CREATE OR REPLACE FUNCTION public.validate_session_offer_payment_mode()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_mode IS NOT NULL AND NEW.payment_mode NOT IN ('free', 'use_credits', 'paid') THEN
    RAISE EXCEPTION 'Invalid payment_mode: %. Must be free, use_credits, or paid', NEW.payment_mode;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_offer_payment_mode ON public.session_offers;
CREATE TRIGGER validate_offer_payment_mode
  BEFORE INSERT OR UPDATE ON public.session_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_session_offer_payment_mode();

-- Create index for querying pending payment sessions
CREATE INDEX IF NOT EXISTS idx_sessions_pending_payment 
ON public.coaching_sessions(client_id, payment_mode) 
WHERE payment_mode = 'paid' AND payment_status = 'pending';