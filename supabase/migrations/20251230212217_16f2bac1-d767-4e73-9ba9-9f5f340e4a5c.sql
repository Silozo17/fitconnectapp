-- Phase 2 Database Tables

-- B1. AI Client Summaries
CREATE TABLE public.client_ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  summary_type TEXT NOT NULL DEFAULT 'weekly',
  generated_content JSONB NOT NULL,
  coach_edits JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  approved_at TIMESTAMPTZ,
  shared_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- B2. Plateau History
CREATE TABLE public.plateau_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  start_date DATE NOT NULL,
  end_date DATE,
  duration_weeks INTEGER,
  baseline_value NUMERIC,
  current_value NUMERIC,
  change_percentage NUMERIC,
  is_manual BOOLEAN DEFAULT FALSE,
  coach_notes TEXT,
  breakthrough_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A4. Client Goals
CREATE TABLE public.client_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES public.coach_profiles(id),
  goal_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  target_unit TEXT,
  start_value NUMERIC,
  current_value NUMERIC,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE,
  status TEXT DEFAULT 'active',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A4. Goal Milestones
CREATE TABLE public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.client_goals(id) ON DELETE CASCADE,
  milestone_value NUMERIC NOT NULL,
  milestone_label TEXT,
  reached_at TIMESTAMPTZ,
  celebrated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- C4. Upsell Suggestions
CREATE TABLE public.upsell_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL,
  package_id UUID REFERENCES public.coach_packages(id),
  reason TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  suggested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  outcome TEXT,
  outcome_at TIMESTAMPTZ,
  converted_purchase_id UUID REFERENCES public.client_package_purchases(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- E1. Client Outcome Consents
CREATE TABLE public.client_outcome_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  client_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, coach_id, consent_type)
);

-- E1. Coach Outcome Showcases
CREATE TABLE public.coach_outcome_showcases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  consent_id UUID NOT NULL REFERENCES public.client_outcome_consents(id),
  title TEXT,
  description TEXT,
  before_photo_url TEXT,
  after_photo_url TEXT,
  stats JSONB,
  is_anonymized BOOLEAN DEFAULT FALSE,
  display_name TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.client_ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plateau_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsell_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_outcome_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_outcome_showcases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_ai_summaries
CREATE POLICY "Coaches can manage their client summaries"
ON public.client_ai_summaries FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.coach_profiles WHERE id = coach_id));

CREATE POLICY "Clients can view their shared summaries"
ON public.client_ai_summaries FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM public.client_profiles WHERE id = client_id) AND status = 'shared');

-- RLS Policies for plateau_history
CREATE POLICY "Coaches can manage plateau history"
ON public.plateau_history FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.coach_profiles WHERE id = coach_id));

CREATE POLICY "Clients can view their plateau history"
ON public.plateau_history FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM public.client_profiles WHERE id = client_id));

-- RLS Policies for client_goals
CREATE POLICY "Coaches can manage client goals"
ON public.client_goals FOR ALL
USING (coach_id IS NULL OR auth.uid() IN (SELECT user_id FROM public.coach_profiles WHERE id = coach_id));

CREATE POLICY "Clients can manage their own goals"
ON public.client_goals FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.client_profiles WHERE id = client_id));

-- RLS Policies for goal_milestones
CREATE POLICY "Users can manage milestones for accessible goals"
ON public.goal_milestones FOR ALL
USING (goal_id IN (SELECT id FROM public.client_goals));

-- RLS Policies for upsell_suggestions
CREATE POLICY "Coaches can manage upsell suggestions"
ON public.upsell_suggestions FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.coach_profiles WHERE id = coach_id));

-- RLS Policies for client_outcome_consents
CREATE POLICY "Coaches can view consents for their clients"
ON public.client_outcome_consents FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM public.coach_profiles WHERE id = coach_id));

CREATE POLICY "Clients can manage their own consents"
ON public.client_outcome_consents FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.client_profiles WHERE id = client_id));

-- RLS Policies for coach_outcome_showcases
CREATE POLICY "Coaches can manage their showcases"
ON public.coach_outcome_showcases FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.coach_profiles WHERE id = coach_id));

CREATE POLICY "Public can view published showcases"
ON public.coach_outcome_showcases FOR SELECT
USING (is_published = TRUE);

-- Indexes for performance
CREATE INDEX idx_client_ai_summaries_client ON public.client_ai_summaries(client_id);
CREATE INDEX idx_client_ai_summaries_coach ON public.client_ai_summaries(coach_id);
CREATE INDEX idx_plateau_history_client ON public.plateau_history(client_id);
CREATE INDEX idx_plateau_history_coach ON public.plateau_history(coach_id);
CREATE INDEX idx_client_goals_client ON public.client_goals(client_id);
CREATE INDEX idx_client_goals_coach ON public.client_goals(coach_id);
CREATE INDEX idx_goal_milestones_goal ON public.goal_milestones(goal_id);
CREATE INDEX idx_upsell_suggestions_client ON public.upsell_suggestions(client_id);
CREATE INDEX idx_upsell_suggestions_coach ON public.upsell_suggestions(coach_id);
CREATE INDEX idx_client_outcome_consents_client ON public.client_outcome_consents(client_id);
CREATE INDEX idx_coach_outcome_showcases_coach ON public.coach_outcome_showcases(coach_id);
CREATE INDEX idx_coach_outcome_showcases_published ON public.coach_outcome_showcases(is_published) WHERE is_published = TRUE;