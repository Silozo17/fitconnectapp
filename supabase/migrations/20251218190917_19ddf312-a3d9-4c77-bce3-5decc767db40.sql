-- Add auto-invoice tracking columns to coach_invoices
ALTER TABLE public.coach_invoices 
ADD COLUMN IF NOT EXISTS source_type text,
ADD COLUMN IF NOT EXISTS source_id uuid,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

-- Create index for quick lookup by payment intent (for refunds)
CREATE INDEX IF NOT EXISTS idx_coach_invoices_stripe_payment_intent 
ON public.coach_invoices(stripe_payment_intent_id) 
WHERE stripe_payment_intent_id IS NOT NULL;

-- Create index for source lookup
CREATE INDEX IF NOT EXISTS idx_coach_invoices_source 
ON public.coach_invoices(source_type, source_id) 
WHERE source_type IS NOT NULL;

-- Add comment explaining the columns
COMMENT ON COLUMN public.coach_invoices.source_type IS 'Type of purchase: package, subscription, booking';
COMMENT ON COLUMN public.coach_invoices.source_id IS 'ID of the purchase record';
COMMENT ON COLUMN public.coach_invoices.stripe_payment_intent_id IS 'Stripe payment intent for refund matching';