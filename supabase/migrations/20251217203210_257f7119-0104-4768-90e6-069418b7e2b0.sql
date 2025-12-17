-- Add is_boosted_acquisition column to booking_requests
ALTER TABLE public.booking_requests 
ADD COLUMN IF NOT EXISTS is_boosted_acquisition BOOLEAN DEFAULT false;

-- Create function to increment boost stats
CREATE OR REPLACE FUNCTION public.increment_boost_stats(p_coach_id UUID, p_fee_amount NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE coach_boosts
  SET 
    total_clients_acquired = COALESCE(total_clients_acquired, 0) + 1,
    total_fees_paid = COALESCE(total_fees_paid, 0) + p_fee_amount,
    updated_at = NOW()
  WHERE coach_id = p_coach_id;
END;
$$;