-- Create coach invoice settings table
CREATE TABLE public.coach_invoice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES public.coach_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name TEXT,
  business_address TEXT,
  business_email TEXT,
  business_phone TEXT,
  vat_number TEXT,
  company_registration TEXT,
  logo_url TEXT,
  template_id TEXT DEFAULT 'modern',
  accent_color TEXT DEFAULT '#BEFF00',
  default_payment_terms TEXT DEFAULT 'Payment due within 14 days',
  default_notes TEXT,
  bank_details TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add new columns to coach_invoices
ALTER TABLE public.coach_invoices 
ADD COLUMN IF NOT EXISTS template_id TEXT DEFAULT 'modern',
ADD COLUMN IF NOT EXISTS accent_color TEXT,
ADD COLUMN IF NOT EXISTS business_snapshot JSONB;

-- Enable RLS
ALTER TABLE public.coach_invoice_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for coach_invoice_settings
CREATE POLICY "Coaches can view own invoice settings"
ON public.coach_invoice_settings FOR SELECT
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can insert own invoice settings"
ON public.coach_invoice_settings FOR INSERT
WITH CHECK (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update own invoice settings"
ON public.coach_invoice_settings FOR UPDATE
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- Clients can view invoice settings for receipts
CREATE POLICY "Clients can view coach invoice settings for their invoices"
ON public.coach_invoice_settings FOR SELECT
USING (
  coach_id IN (
    SELECT coach_id FROM public.coach_invoices 
    WHERE client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
  )
);

-- Update timestamp trigger
CREATE TRIGGER update_coach_invoice_settings_updated_at
BEFORE UPDATE ON public.coach_invoice_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();