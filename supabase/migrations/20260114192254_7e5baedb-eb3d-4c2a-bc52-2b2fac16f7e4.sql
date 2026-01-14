-- Add Stripe Connect columns to gym_locations for per-location payment processing
ALTER TABLE public.gym_locations
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_account_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'GBP';

-- Add index for faster Stripe account lookups
CREATE INDEX IF NOT EXISTS idx_gym_locations_stripe_account 
ON public.gym_locations(stripe_account_id) WHERE stripe_account_id IS NOT NULL;

-- Add comment explaining the purpose
COMMENT ON COLUMN public.gym_locations.stripe_account_id IS 'Stripe Connect account ID for this location';
COMMENT ON COLUMN public.gym_locations.stripe_account_status IS 'Status of Stripe onboarding: pending, in_progress, complete';
COMMENT ON COLUMN public.gym_locations.stripe_onboarding_complete IS 'Whether Stripe onboarding is fully complete';
COMMENT ON COLUMN public.gym_locations.currency IS 'Currency code for this location (e.g., GBP, USD, EUR)';