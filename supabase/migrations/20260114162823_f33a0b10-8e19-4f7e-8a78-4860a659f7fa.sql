-- Phase 8 & 9: Create tables if not exists and add RLS
CREATE TABLE IF NOT EXISTS public.gym_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GBP',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gym_invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.gym_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  item_type TEXT DEFAULT 'service',
  product_id UUID,
  membership_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gym_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  automation_type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  trigger_config JSONB NOT NULL DEFAULT '{}',
  action_config JSONB NOT NULL DEFAULT '{}',
  message_template TEXT,
  send_email BOOLEAN DEFAULT true,
  send_sms BOOLEAN DEFAULT false,
  send_push BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on invoice tables
ALTER TABLE public.gym_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_invoice_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Gym staff can manage invoices" ON public.gym_invoices;
DROP POLICY IF EXISTS "Members can view their own invoices" ON public.gym_invoices;
DROP POLICY IF EXISTS "Gym staff can manage invoice items" ON public.gym_invoice_items;
DROP POLICY IF EXISTS "Members can view their own invoice items" ON public.gym_invoice_items;

CREATE POLICY "Gym staff can manage invoices"
ON public.gym_invoices FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.gym_staff gs
    WHERE gs.gym_id = gym_invoices.gym_id
    AND gs.user_id = auth.uid()
    AND gs.status = 'active'
  )
);

CREATE POLICY "Members can view their own invoices"
ON public.gym_invoices FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.gym_members gm
    WHERE gm.id = gym_invoices.member_id
    AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Gym staff can manage invoice items"
ON public.gym_invoice_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.gym_invoices gi
    JOIN public.gym_staff gs ON gs.gym_id = gi.gym_id
    WHERE gi.id = gym_invoice_items.invoice_id
    AND gs.user_id = auth.uid()
    AND gs.status = 'active'
  )
);

CREATE POLICY "Members can view their own invoice items"
ON public.gym_invoice_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.gym_invoices gi
    JOIN public.gym_members gm ON gm.id = gi.member_id
    WHERE gi.id = gym_invoice_items.invoice_id
    AND gm.user_id = auth.uid()
  )
);

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_gym_invoices_gym_id ON public.gym_invoices(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_invoices_member_id ON public.gym_invoices(member_id);
CREATE INDEX IF NOT EXISTS idx_gym_invoices_status ON public.gym_invoices(status);
CREATE INDEX IF NOT EXISTS idx_gym_invoice_items_invoice_id ON public.gym_invoice_items(invoice_id);