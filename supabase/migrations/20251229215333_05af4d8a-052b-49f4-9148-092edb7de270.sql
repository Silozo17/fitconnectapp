-- Fix search_path for validation functions
CREATE OR REPLACE FUNCTION public.validate_coaching_session_payment_mode()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_mode IS NOT NULL AND NEW.payment_mode NOT IN ('free', 'use_credits', 'paid') THEN
    RAISE EXCEPTION 'Invalid payment_mode: %. Must be free, use_credits, or paid', NEW.payment_mode;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.validate_session_offer_payment_mode()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_mode IS NOT NULL AND NEW.payment_mode NOT IN ('free', 'use_credits', 'paid') THEN
    RAISE EXCEPTION 'Invalid payment_mode: %. Must be free, use_credits, or paid', NEW.payment_mode;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;