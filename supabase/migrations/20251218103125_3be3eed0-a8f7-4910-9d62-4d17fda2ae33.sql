-- Coach Invoices table
CREATE TABLE public.coach_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  subtotal INTEGER DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  currency TEXT DEFAULT 'GBP',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Invoice line items table
CREATE TABLE public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.coach_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Coach expenses table
CREATE TABLE public.coach_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('equipment', 'marketing', 'gym_rental', 'training_materials', 'software', 'travel', 'insurance', 'other')),
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'GBP',
  expense_date DATE NOT NULL,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coach_invoices
CREATE POLICY "Coaches can view their own invoices"
ON public.coach_invoices FOR SELECT
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can create their own invoices"
ON public.coach_invoices FOR INSERT
WITH CHECK (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update their own invoices"
ON public.coach_invoices FOR UPDATE
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can delete their own invoices"
ON public.coach_invoices FOR DELETE
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- RLS Policies for invoice_line_items
CREATE POLICY "Coaches can view their invoice line items"
ON public.invoice_line_items FOR SELECT
USING (invoice_id IN (
  SELECT id FROM public.coach_invoices 
  WHERE coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
));

CREATE POLICY "Coaches can create invoice line items"
ON public.invoice_line_items FOR INSERT
WITH CHECK (invoice_id IN (
  SELECT id FROM public.coach_invoices 
  WHERE coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
));

CREATE POLICY "Coaches can update their invoice line items"
ON public.invoice_line_items FOR UPDATE
USING (invoice_id IN (
  SELECT id FROM public.coach_invoices 
  WHERE coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
));

CREATE POLICY "Coaches can delete their invoice line items"
ON public.invoice_line_items FOR DELETE
USING (invoice_id IN (
  SELECT id FROM public.coach_invoices 
  WHERE coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
));

-- RLS Policies for coach_expenses
CREATE POLICY "Coaches can view their own expenses"
ON public.coach_expenses FOR SELECT
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can create their own expenses"
ON public.coach_expenses FOR INSERT
WITH CHECK (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update their own expenses"
ON public.coach_expenses FOR UPDATE
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can delete their own expenses"
ON public.coach_expenses FOR DELETE
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_coach_invoices_coach_id ON public.coach_invoices(coach_id);
CREATE INDEX idx_coach_invoices_client_id ON public.coach_invoices(client_id);
CREATE INDEX idx_coach_invoices_status ON public.coach_invoices(status);
CREATE INDEX idx_invoice_line_items_invoice_id ON public.invoice_line_items(invoice_id);
CREATE INDEX idx_coach_expenses_coach_id ON public.coach_expenses(coach_id);
CREATE INDEX idx_coach_expenses_category ON public.coach_expenses(category);

-- Triggers for updated_at
CREATE TRIGGER update_coach_invoices_updated_at
BEFORE UPDATE ON public.coach_invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_expenses_updated_at
BEFORE UPDATE ON public.coach_expenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();