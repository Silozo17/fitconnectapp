-- Phase 8: Advanced Automation Tables

-- =====================================================
-- 1. Recurring Class Schedules (for auto-generating class instances)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.gym_recurring_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  class_type_id UUID NOT NULL REFERENCES public.gym_class_types(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.gym_locations(id) ON DELETE SET NULL,
  
  -- Recurrence pattern
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  
  -- Scheduling settings
  capacity INTEGER,
  auto_generate_weeks_ahead INTEGER DEFAULT 4,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL
);

ALTER TABLE public.gym_recurring_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gym staff can view recurring schedules"
  ON public.gym_recurring_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_recurring_schedules.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

CREATE POLICY "Gym managers can manage recurring schedules"
  ON public.gym_recurring_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_recurring_schedules.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
      AND gs.role IN ('owner', 'manager')
    )
  );

-- =====================================================
-- 2. Waitlist Auto-Promotion Settings
-- =====================================================
CREATE TABLE IF NOT EXISTS public.gym_waitlist_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE UNIQUE,
  
  auto_promote_enabled BOOLEAN DEFAULT true,
  promotion_window_hours INTEGER DEFAULT 24,
  max_auto_promotions INTEGER DEFAULT 3,
  
  notify_on_promotion BOOLEAN DEFAULT true,
  notify_on_waitlist_join BOOLEAN DEFAULT true,
  promotion_message_template TEXT DEFAULT 'Great news! A spot opened up in {{class_name}} on {{class_date}}. You have been automatically enrolled!',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gym_waitlist_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gym staff can view waitlist settings"
  ON public.gym_waitlist_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_waitlist_settings.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

CREATE POLICY "Gym managers can manage waitlist settings"
  ON public.gym_waitlist_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_waitlist_settings.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
      AND gs.role IN ('owner', 'manager')
    )
  );

-- =====================================================
-- 3. Waitlist Promotion Logs
-- =====================================================
CREATE TABLE IF NOT EXISTS public.gym_waitlist_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  class_schedule_id UUID NOT NULL REFERENCES public.gym_class_schedules(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  
  promoted_from_position INTEGER NOT NULL,
  promotion_type TEXT NOT NULL DEFAULT 'auto' CHECK (promotion_type IN ('auto', 'manual')),
  promoted_at TIMESTAMPTZ DEFAULT now(),
  
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ
);

ALTER TABLE public.gym_waitlist_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gym staff can view promotions"
  ON public.gym_waitlist_promotions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_waitlist_promotions.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

CREATE POLICY "Gym managers can manage promotions"
  ON public.gym_waitlist_promotions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_waitlist_promotions.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
      AND gs.role IN ('owner', 'manager')
    )
  );

-- =====================================================
-- 4. Failed Payment Tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS public.gym_failed_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES public.gym_memberships(id) ON DELETE SET NULL,
  
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  failure_reason TEXT,
  stripe_payment_intent_id TEXT,
  
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  max_retries INTEGER DEFAULT 3,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'retrying', 'resolved', 'failed', 'cancelled')),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  member_notified BOOLEAN DEFAULT false,
  member_notified_at TIMESTAMPTZ,
  staff_notified BOOLEAN DEFAULT false,
  staff_notified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gym_failed_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gym staff can view failed payments"
  ON public.gym_failed_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_failed_payments.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

CREATE POLICY "Gym managers can manage failed payments"
  ON public.gym_failed_payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_failed_payments.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
      AND gs.role IN ('owner', 'manager')
    )
  );

-- =====================================================
-- 5. Automation Logs
-- =====================================================
CREATE TABLE IF NOT EXISTS public.gym_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  
  automation_type TEXT NOT NULL CHECK (automation_type IN (
    'recurring_class_generation',
    'waitlist_promotion',
    'payment_retry',
    'membership_renewal',
    'expiry_notification'
  )),
  
  related_entity_type TEXT,
  related_entity_id UUID,
  
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'skipped')),
  message TEXT,
  metadata JSONB DEFAULT '{}',
  
  executed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gym_automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gym staff can view automation logs"
  ON public.gym_automation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_automation_logs.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

CREATE POLICY "System can insert automation logs"
  ON public.gym_automation_logs FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gym_recurring_schedules_gym ON public.gym_recurring_schedules(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_recurring_schedules_day ON public.gym_recurring_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_gym_waitlist_promotions_class ON public.gym_waitlist_promotions(class_schedule_id);
CREATE INDEX IF NOT EXISTS idx_gym_failed_payments_status ON public.gym_failed_payments(status);
CREATE INDEX IF NOT EXISTS idx_gym_automation_logs_type ON public.gym_automation_logs(automation_type);