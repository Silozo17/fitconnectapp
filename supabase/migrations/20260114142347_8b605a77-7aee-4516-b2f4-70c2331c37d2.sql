-- Staff Shifts/Schedule table
CREATE TABLE public.gym_staff_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.gym_staff(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INTEGER DEFAULT 0,
  location_id UUID REFERENCES public.gym_locations(id) ON DELETE SET NULL,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff Time Clock entries for tracking actual hours worked
CREATE TABLE public.gym_staff_time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.gym_staff(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES public.gym_staff_shifts(id) ON DELETE SET NULL,
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  break_minutes INTEGER DEFAULT 0,
  notes TEXT,
  approved_by UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff Payroll Summary (for tracking pay periods)
CREATE TABLE public.gym_staff_payroll (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.gym_staff(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_hours DECIMAL(10,2) DEFAULT 0,
  regular_hours DECIMAL(10,2) DEFAULT 0,
  overtime_hours DECIMAL(10,2) DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  gross_pay DECIMAL(10,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'paid')),
  approved_by UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff Pay Rates
CREATE TABLE public.gym_staff_pay_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.gym_staff(id) ON DELETE CASCADE,
  hourly_rate DECIMAL(10,2) NOT NULL,
  overtime_rate DECIMAL(10,2),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gym_staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_staff_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_staff_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_staff_pay_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gym_staff_shifts
CREATE POLICY "Staff can view their own shifts" ON public.gym_staff_shifts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM gym_staff gs WHERE gs.id = staff_id AND gs.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gym_staff gs WHERE gs.gym_id = gym_staff_shifts.gym_id AND gs.user_id = auth.uid())
  );

CREATE POLICY "Managers can manage shifts" ON public.gym_staff_shifts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gym_staff gs WHERE gs.gym_id = gym_staff_shifts.gym_id AND gs.user_id = auth.uid() AND gs.role IN ('owner', 'manager'))
  );

-- RLS Policies for gym_staff_time_entries
CREATE POLICY "Staff can view own time entries" ON public.gym_staff_time_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM gym_staff gs WHERE gs.id = staff_id AND gs.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gym_staff gs WHERE gs.gym_id = gym_staff_time_entries.gym_id AND gs.user_id = auth.uid() AND gs.role IN ('owner', 'manager'))
  );

CREATE POLICY "Staff can insert own time entries" ON public.gym_staff_time_entries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM gym_staff gs WHERE gs.id = staff_id AND gs.user_id = auth.uid())
  );

CREATE POLICY "Managers can manage time entries" ON public.gym_staff_time_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gym_staff gs WHERE gs.gym_id = gym_staff_time_entries.gym_id AND gs.user_id = auth.uid() AND gs.role IN ('owner', 'manager'))
  );

-- RLS Policies for gym_staff_payroll
CREATE POLICY "Staff can view own payroll" ON public.gym_staff_payroll
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM gym_staff gs WHERE gs.id = staff_id AND gs.user_id = auth.uid())
  );

CREATE POLICY "Managers can manage payroll" ON public.gym_staff_payroll
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gym_staff gs WHERE gs.gym_id = gym_staff_payroll.gym_id AND gs.user_id = auth.uid() AND gs.role IN ('owner', 'manager'))
  );

-- RLS Policies for gym_staff_pay_rates
CREATE POLICY "Staff can view own pay rates" ON public.gym_staff_pay_rates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM gym_staff gs WHERE gs.id = staff_id AND gs.user_id = auth.uid())
  );

CREATE POLICY "Managers can manage pay rates" ON public.gym_staff_pay_rates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gym_staff gs WHERE gs.gym_id = gym_staff_pay_rates.gym_id AND gs.user_id = auth.uid() AND gs.role IN ('owner', 'manager'))
  );

-- Indexes for performance
CREATE INDEX idx_gym_staff_shifts_gym_date ON public.gym_staff_shifts(gym_id, shift_date);
CREATE INDEX idx_gym_staff_shifts_staff ON public.gym_staff_shifts(staff_id);
CREATE INDEX idx_gym_staff_time_entries_gym ON public.gym_staff_time_entries(gym_id);
CREATE INDEX idx_gym_staff_time_entries_staff ON public.gym_staff_time_entries(staff_id);
CREATE INDEX idx_gym_staff_payroll_gym ON public.gym_staff_payroll(gym_id);
CREATE INDEX idx_gym_staff_payroll_period ON public.gym_staff_payroll(period_start, period_end);
CREATE INDEX idx_gym_staff_pay_rates_staff ON public.gym_staff_pay_rates(staff_id, is_current);