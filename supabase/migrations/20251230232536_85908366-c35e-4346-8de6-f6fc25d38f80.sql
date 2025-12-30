-- =====================================================
-- Phase 3 Database Schema Migration
-- =====================================================

-- 1. Scheduled Check-ins Table
CREATE TABLE public.scheduled_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  message_template TEXT NOT NULL,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('once', 'daily', 'weekly', 'monthly')),
  scheduled_at TIMESTAMPTZ,
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  day_of_month INT CHECK (day_of_month BETWEEN 1 AND 31),
  time_of_day TIME NOT NULL,
  timezone TEXT DEFAULT 'Europe/London',
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AI Plan Recommendations Table
CREATE TABLE public.ai_plan_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('workout', 'nutrition', 'recovery', 'general')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_changes JSONB,
  rationale TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed', 'expired')),
  applied_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Plan Phase Completions Table (Auto Progression)
CREATE TABLE public.plan_phase_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  plan_assignment_id UUID NOT NULL REFERENCES public.plan_assignments(id) ON DELETE CASCADE,
  phase_number INT NOT NULL,
  week_number INT NOT NULL,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  auto_progressed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Case Studies Table
CREATE TABLE public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  showcase_id UUID REFERENCES public.coach_outcome_showcases(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  generated_narrative TEXT,
  is_published BOOLEAN DEFAULT false,
  public_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Review Prompts Table
CREATE TABLE public.review_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.coaching_sessions(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN DEFAULT false,
  review_id UUID REFERENCES public.reviews(id) ON DELETE SET NULL,
  reminder_count INT DEFAULT 0,
  last_reminder_at TIMESTAMPTZ
);

-- 6. Alter training_plans table for auto-progression
ALTER TABLE public.training_plans ADD COLUMN IF NOT EXISTS progression_rules JSONB;
ALTER TABLE public.training_plans ADD COLUMN IF NOT EXISTS auto_progress_enabled BOOLEAN DEFAULT false;

-- 7. Alter reviews table for coach responses
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS coach_response TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS coach_responded_at TIMESTAMPTZ;

-- =====================================================
-- Enable RLS on all new tables
-- =====================================================
ALTER TABLE public.scheduled_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_plan_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_phase_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_prompts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies for scheduled_checkins
-- =====================================================
CREATE POLICY "Coaches can manage their scheduled checkins"
ON public.scheduled_checkins
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.coach_profiles
    WHERE coach_profiles.id = scheduled_checkins.coach_id
    AND coach_profiles.user_id = auth.uid()
  )
);

-- =====================================================
-- RLS Policies for ai_plan_recommendations
-- =====================================================
CREATE POLICY "Coaches can manage their AI recommendations"
ON public.ai_plan_recommendations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.coach_profiles
    WHERE coach_profiles.id = ai_plan_recommendations.coach_id
    AND coach_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Clients can view their recommendations"
ON public.ai_plan_recommendations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_profiles
    WHERE client_profiles.id = ai_plan_recommendations.client_id
    AND client_profiles.user_id = auth.uid()
  )
);

-- =====================================================
-- RLS Policies for plan_phase_completions
-- =====================================================
CREATE POLICY "Coaches can manage phase completions for their clients"
ON public.plan_phase_completions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.plan_assignments pa
    JOIN public.coach_profiles cp ON cp.id = pa.coach_id
    WHERE pa.id = plan_phase_completions.plan_assignment_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Clients can view their phase completions"
ON public.plan_phase_completions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_profiles
    WHERE client_profiles.id = plan_phase_completions.client_id
    AND client_profiles.user_id = auth.uid()
  )
);

-- =====================================================
-- RLS Policies for case_studies
-- =====================================================
CREATE POLICY "Coaches can manage their case studies"
ON public.case_studies
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.coach_profiles
    WHERE coach_profiles.id = case_studies.coach_id
    AND coach_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Published case studies are public"
ON public.case_studies
FOR SELECT
USING (is_published = true);

-- =====================================================
-- RLS Policies for review_prompts
-- =====================================================
CREATE POLICY "Coaches can manage their review prompts"
ON public.review_prompts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.coach_profiles
    WHERE coach_profiles.id = review_prompts.coach_id
    AND coach_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Clients can view and update their review prompts"
ON public.review_prompts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.client_profiles
    WHERE client_profiles.id = review_prompts.client_id
    AND client_profiles.user_id = auth.uid()
  )
);

-- =====================================================
-- Indexes for performance
-- =====================================================
CREATE INDEX idx_scheduled_checkins_coach ON public.scheduled_checkins(coach_id);
CREATE INDEX idx_scheduled_checkins_next_run ON public.scheduled_checkins(next_run_at) WHERE is_active = true;
CREATE INDEX idx_ai_recommendations_coach ON public.ai_plan_recommendations(coach_id);
CREATE INDEX idx_ai_recommendations_status ON public.ai_plan_recommendations(status) WHERE status = 'pending';
CREATE INDEX idx_plan_phase_completions_assignment ON public.plan_phase_completions(plan_assignment_id);
CREATE INDEX idx_case_studies_coach ON public.case_studies(coach_id);
CREATE INDEX idx_case_studies_published ON public.case_studies(is_published) WHERE is_published = true;
CREATE INDEX idx_review_prompts_coach ON public.review_prompts(coach_id);
CREATE INDEX idx_review_prompts_pending ON public.review_prompts(client_id) WHERE completed = false;

-- =====================================================
-- Trigger for updated_at on scheduled_checkins
-- =====================================================
CREATE TRIGGER update_scheduled_checkins_updated_at
BEFORE UPDATE ON public.scheduled_checkins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Trigger for updated_at on case_studies
-- =====================================================
CREATE TRIGGER update_case_studies_updated_at
BEFORE UPDATE ON public.case_studies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();