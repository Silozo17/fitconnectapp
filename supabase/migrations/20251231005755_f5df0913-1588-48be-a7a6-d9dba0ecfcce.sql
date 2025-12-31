-- =============================================
-- PHASE 1: Foundation for Coach Automations
-- =============================================

-- 1. Coach Automation Settings (stores config for all automation types)
CREATE TABLE public.coach_automation_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  automation_type TEXT NOT NULL CHECK (automation_type IN ('dropoff_rescue', 'milestone_celebration', 'reminder')),
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coach_id, automation_type)
);

-- 2. Automation Logs (audit trail for all automation actions)
CREATE TABLE public.automation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE SET NULL,
  automation_type TEXT NOT NULL,
  action_type TEXT NOT NULL,
  message_sent TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'skipped', 'failed', 'pending_review')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Client Automation Status (per-client state for drop-off rescue)
CREATE TABLE public.client_automation_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  is_at_risk BOOLEAN NOT NULL DEFAULT false,
  risk_stage INTEGER NOT NULL DEFAULT 0 CHECK (risk_stage BETWEEN 0 AND 3),
  last_soft_checkin_at TIMESTAMP WITH TIME ZONE,
  last_coach_alert_at TIMESTAMP WITH TIME ZONE,
  last_recovery_attempt_at TIMESTAMP WITH TIME ZONE,
  muted_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coach_id, client_id)
);

-- 4. Reminder Templates (system + coach custom templates)
CREATE TABLE public.reminder_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hydration', 'logging', 'checkin', 'photos', 'weighin', 'rest', 'custom')),
  message_template TEXT NOT NULL,
  default_time TIME NOT NULL DEFAULT '09:00',
  default_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (default_frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Client Reminders (active reminder assignments)
CREATE TABLE public.client_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.reminder_templates(id) ON DELETE SET NULL,
  custom_message TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly', 'custom')),
  custom_interval_days INTEGER,
  time_of_day TIME NOT NULL DEFAULT '09:00',
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_paused BOOLEAN NOT NULL DEFAULT false,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  max_sends INTEGER,
  sends_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Milestone Automations (celebration configs)
CREATE TABLE public.milestone_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('streak', 'program_complete', 'challenge_complete', 'wearable_target', 'adherence', 'pr')),
  threshold_value INTEGER NOT NULL DEFAULT 7,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  actions JSONB NOT NULL DEFAULT '{"send_message": true, "award_xp": 50, "trigger_animation": true, "notify_coach": false}',
  message_template TEXT,
  apply_to_all_clients BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Scheduled Checkin Assignments (for template-based multi-client)
CREATE TABLE public.scheduled_checkin_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_checkin_id UUID NOT NULL REFERENCES public.scheduled_checkins(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_checkin_id, client_id)
);

-- 8. Extend scheduled_checkins for template support
ALTER TABLE public.scheduled_checkins 
  ADD COLUMN IF NOT EXISTS is_template BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS linked_template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL;

-- =============================================
-- RLS Policies
-- =============================================

-- Coach Automation Settings
ALTER TABLE public.coach_automation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their own automation settings"
  ON public.coach_automation_settings FOR SELECT
  USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can insert their own automation settings"
  ON public.coach_automation_settings FOR INSERT
  WITH CHECK (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update their own automation settings"
  ON public.coach_automation_settings FOR UPDATE
  USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can delete their own automation settings"
  ON public.coach_automation_settings FOR DELETE
  USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- Automation Logs
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their own automation logs"
  ON public.automation_logs FOR SELECT
  USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Service role can insert automation logs"
  ON public.automation_logs FOR INSERT
  WITH CHECK (true);

-- Client Automation Status
ALTER TABLE public.client_automation_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their clients automation status"
  ON public.client_automation_status FOR SELECT
  USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can manage their clients automation status"
  ON public.client_automation_status FOR ALL
  USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- Reminder Templates
ALTER TABLE public.reminder_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view system reminder templates"
  ON public.reminder_templates FOR SELECT
  USING (is_system = true OR coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can manage their reminder templates"
  ON public.reminder_templates FOR ALL
  USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- Client Reminders
ALTER TABLE public.client_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their client reminders"
  ON public.client_reminders FOR SELECT
  USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can manage their client reminders"
  ON public.client_reminders FOR ALL
  USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can view their own reminders"
  ON public.client_reminders FOR SELECT
  USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

-- Milestone Automations
ALTER TABLE public.milestone_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their milestone automations"
  ON public.milestone_automations FOR SELECT
  USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can manage their milestone automations"
  ON public.milestone_automations FOR ALL
  USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- Scheduled Checkin Assignments
ALTER TABLE public.scheduled_checkin_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their checkin assignments"
  ON public.scheduled_checkin_assignments FOR SELECT
  USING (template_checkin_id IN (
    SELECT id FROM public.scheduled_checkins 
    WHERE coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
  ));

CREATE POLICY "Coaches can manage their checkin assignments"
  ON public.scheduled_checkin_assignments FOR ALL
  USING (template_checkin_id IN (
    SELECT id FROM public.scheduled_checkins 
    WHERE coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
  ));

-- =============================================
-- Indexes for Performance
-- =============================================

CREATE INDEX idx_automation_logs_coach_id ON public.automation_logs(coach_id);
CREATE INDEX idx_automation_logs_client_id ON public.automation_logs(client_id);
CREATE INDEX idx_automation_logs_created_at ON public.automation_logs(created_at DESC);
CREATE INDEX idx_client_reminders_next_run ON public.client_reminders(next_run_at) WHERE is_active = true AND is_paused = false;
CREATE INDEX idx_client_automation_status_risk ON public.client_automation_status(coach_id) WHERE is_at_risk = true;
CREATE INDEX idx_scheduled_checkin_assignments_template ON public.scheduled_checkin_assignments(template_checkin_id) WHERE is_active = true;

-- =============================================
-- Insert Default System Reminder Templates
-- =============================================

INSERT INTO public.reminder_templates (name, category, message_template, default_time, default_frequency, is_system) VALUES
  ('Daily Hydration Reminder', 'hydration', 'Hey {{client_name}}! 💧 Remember to stay hydrated today. Aim for at least 8 glasses of water!', '10:00', 'daily', true),
  ('Log Your Workout', 'logging', 'Hi {{client_name}}! Don''t forget to log your workout today. Tracking helps us measure your progress! 💪', '18:00', 'daily', true),
  ('Weekly Check-In', 'checkin', 'Hi {{client_name}}! Time for your weekly check-in. How are you feeling? Any wins or challenges to share?', '09:00', 'weekly', true),
  ('Progress Photos Reminder', 'photos', 'Hi {{client_name}}! It''s time for your progress photos. Remember, consistency in tracking shows your amazing transformation! 📸', '09:00', 'weekly', true),
  ('Weekly Weigh-In', 'weighin', 'Hi {{client_name}}! Time for your weekly weigh-in. Remember, it''s just one data point in your journey! ⚖️', '07:00', 'weekly', true),
  ('Rest Day Reminder', 'rest', 'Hi {{client_name}}! Today is your scheduled rest day. Recovery is when the magic happens! 🧘', '09:00', 'weekly', true);

-- =============================================
-- Triggers for updated_at
-- =============================================

CREATE TRIGGER update_coach_automation_settings_updated_at
  BEFORE UPDATE ON public.coach_automation_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_automation_status_updated_at
  BEFORE UPDATE ON public.client_automation_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_reminders_updated_at
  BEFORE UPDATE ON public.client_reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_milestone_automations_updated_at
  BEFORE UPDATE ON public.milestone_automations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();