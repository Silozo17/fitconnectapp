-- Phase 1: Database schema changes for paid Boost entitlements

-- Add time-based entitlement columns to coach_boosts
ALTER TABLE public.coach_boosts
ADD COLUMN IF NOT EXISTS boost_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS boost_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS activation_payment_intent_id TEXT;

-- Add pricing configuration to boost_settings
ALTER TABLE public.boost_settings
ADD COLUMN IF NOT EXISTS boost_price INTEGER DEFAULT 500,
ADD COLUMN IF NOT EXISTS boost_duration_days INTEGER DEFAULT 30;

-- Add constraint to ensure valid payment status values
ALTER TABLE public.coach_boosts
ADD CONSTRAINT valid_payment_status 
CHECK (payment_status IN ('none', 'pending', 'succeeded', 'failed', 'cancelled'));

-- Create index for efficient active boost queries
CREATE INDEX IF NOT EXISTS idx_coach_boosts_end_date 
ON public.coach_boosts (boost_end_date) 
WHERE boost_end_date IS NOT NULL;

-- Update existing boost_settings with default pricing (£5 = 500 pence, 30 days)
UPDATE public.boost_settings
SET boost_price = 500, boost_duration_days = 30
WHERE boost_price IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.coach_boosts.boost_start_date IS 'Start date of the current paid boost period';
COMMENT ON COLUMN public.coach_boosts.boost_end_date IS 'End date of the current paid boost period - boost is active only if this is in the future';
COMMENT ON COLUMN public.coach_boosts.payment_status IS 'Status of the activation payment: none, pending, succeeded, failed, cancelled';
COMMENT ON COLUMN public.coach_boosts.activation_payment_intent_id IS 'Stripe PaymentIntent ID for the boost activation payment';
COMMENT ON COLUMN public.boost_settings.boost_price IS 'Price in pence for boost activation (default 500 = £5)';
COMMENT ON COLUMN public.boost_settings.boost_duration_days IS 'Duration of boost in days after payment (default 30)';