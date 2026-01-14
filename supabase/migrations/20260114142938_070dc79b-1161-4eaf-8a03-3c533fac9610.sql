
-- Create gym_class_schedules table (individual class instances)
CREATE TABLE IF NOT EXISTS public.gym_class_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  class_type_id UUID NOT NULL REFERENCES public.gym_class_types(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 20,
  current_bookings INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled',
  room TEXT,
  notes TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_pattern TEXT,
  parent_schedule_id UUID REFERENCES public.gym_class_schedules(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Class waitlists
CREATE TABLE IF NOT EXISTS public.gym_class_waitlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_schedule_id UUID NOT NULL REFERENCES public.gym_class_schedules(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  offered_at TIMESTAMPTZ,
  offer_expires_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_schedule_id, member_id)
);

-- Recurring class bookings
CREATE TABLE IF NOT EXISTS public.gym_recurring_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  class_type_id UUID NOT NULL REFERENCES public.gym_class_types(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  preferred_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_book BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Credit packages
CREATE TABLE IF NOT EXISTS public.gym_credit_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  credit_type TEXT NOT NULL DEFAULT 'class',
  credits_amount INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  validity_days INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gym_class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_class_waitlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_recurring_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_credit_packages ENABLE ROW LEVEL SECURITY;

-- RLS for gym_class_schedules
CREATE POLICY "Anyone can view schedules" ON public.gym_class_schedules
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage schedules" ON public.gym_class_schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.gym_staff gs WHERE gs.gym_id = gym_class_schedules.gym_id AND gs.user_id = auth.uid() AND gs.status = 'active')
  );

-- RLS for gym_class_waitlists
CREATE POLICY "Members can view own waitlist" ON public.gym_class_waitlists
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.gym_members gm WHERE gm.id = member_id AND gm.user_id = auth.uid())
  );

CREATE POLICY "Members can join waitlist" ON public.gym_class_waitlists
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.gym_members gm WHERE gm.id = member_id AND gm.user_id = auth.uid())
  );

CREATE POLICY "Members can leave waitlist" ON public.gym_class_waitlists
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.gym_members gm WHERE gm.id = member_id AND gm.user_id = auth.uid())
  );

CREATE POLICY "Staff can manage waitlists" ON public.gym_class_waitlists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.gym_class_schedules gcs
      JOIN public.gym_staff gs ON gs.gym_id = gcs.gym_id
      WHERE gcs.id = class_schedule_id AND gs.user_id = auth.uid() AND gs.status = 'active'
    )
  );

-- RLS for gym_recurring_bookings
CREATE POLICY "Members can view own recurring" ON public.gym_recurring_bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.gym_members gm WHERE gm.id = member_id AND gm.user_id = auth.uid())
  );

CREATE POLICY "Members can manage own recurring" ON public.gym_recurring_bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.gym_members gm WHERE gm.id = member_id AND gm.user_id = auth.uid())
  );

CREATE POLICY "Staff can manage recurring" ON public.gym_recurring_bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.gym_staff gs WHERE gs.gym_id = gym_recurring_bookings.gym_id AND gs.user_id = auth.uid() AND gs.status = 'active')
  );

-- RLS for gym_credit_packages
CREATE POLICY "Anyone can view packages" ON public.gym_credit_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can manage packages" ON public.gym_credit_packages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.gym_staff gs WHERE gs.gym_id = gym_credit_packages.gym_id AND gs.user_id = auth.uid() AND gs.status = 'active')
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gym_class_schedules_gym ON public.gym_class_schedules(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_class_schedules_start ON public.gym_class_schedules(start_time);
CREATE INDEX IF NOT EXISTS idx_gym_class_waitlists_schedule ON public.gym_class_waitlists(class_schedule_id);
CREATE INDEX IF NOT EXISTS idx_gym_recurring_bookings_member ON public.gym_recurring_bookings(member_id);
CREATE INDEX IF NOT EXISTS idx_gym_credit_packages_gym ON public.gym_credit_packages(gym_id);
