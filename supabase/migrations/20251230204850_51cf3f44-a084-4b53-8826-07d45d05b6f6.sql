-- Client Engagement History for trend tracking
CREATE TABLE public.client_engagement_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  engagement_score INTEGER NOT NULL CHECK (engagement_score >= 0 AND engagement_score <= 100),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  trajectory TEXT CHECK (trajectory IN ('improving', 'stable', 'declining', 'critical')),
  factors JSONB DEFAULT '{}',
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client Engagement Scores (current snapshot)
CREATE TABLE public.client_engagement_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  session_attendance_score INTEGER DEFAULT 0 CHECK (session_attendance_score >= 0 AND session_attendance_score <= 100),
  habit_completion_score INTEGER DEFAULT 0 CHECK (habit_completion_score >= 0 AND habit_completion_score <= 100),
  message_responsiveness_score INTEGER DEFAULT 0 CHECK (message_responsiveness_score >= 0 AND message_responsiveness_score <= 100),
  progress_logging_score INTEGER DEFAULT 0 CHECK (progress_logging_score >= 0 AND progress_logging_score <= 100),
  plan_adherence_score INTEGER DEFAULT 0 CHECK (plan_adherence_score >= 0 AND plan_adherence_score <= 100),
  week_over_week_change INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, coach_id)
);

-- Template Folders for organization
CREATE TABLE public.template_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Extend message_templates with folder, tags, usage tracking
ALTER TABLE public.message_templates 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.template_folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS variables TEXT[] DEFAULT '{}';

-- Extend notification_preferences for dropoff alerts
ALTER TABLE public.notification_preferences
ADD COLUMN IF NOT EXISTS push_dropoff_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_dropoff_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS dropoff_threshold_days INTEGER DEFAULT 7;

-- Indexes for performance
CREATE INDEX idx_engagement_history_client_week ON public.client_engagement_history(client_id, week_start DESC);
CREATE INDEX idx_engagement_history_coach ON public.client_engagement_history(coach_id);
CREATE INDEX idx_engagement_scores_coach ON public.client_engagement_scores(coach_id);
CREATE INDEX idx_template_folders_coach ON public.template_folders(coach_id);
CREATE INDEX idx_message_templates_folder ON public.message_templates(folder_id);

-- Enable RLS
ALTER TABLE public.client_engagement_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_engagement_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_engagement_history
CREATE POLICY "Coaches can view their clients engagement history"
ON public.client_engagement_history FOR SELECT
USING (coach_id IN (
  SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Coaches can insert engagement history for their clients"
ON public.client_engagement_history FOR INSERT
WITH CHECK (coach_id IN (
  SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Coaches can update their clients engagement history"
ON public.client_engagement_history FOR UPDATE
USING (coach_id IN (
  SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
));

-- RLS Policies for client_engagement_scores
CREATE POLICY "Coaches can view their clients engagement scores"
ON public.client_engagement_scores FOR SELECT
USING (coach_id IN (
  SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Coaches can manage their clients engagement scores"
ON public.client_engagement_scores FOR ALL
USING (coach_id IN (
  SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
));

-- RLS Policies for template_folders
CREATE POLICY "Coaches can view their own template folders"
ON public.template_folders FOR SELECT
USING (coach_id IN (
  SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Coaches can manage their own template folders"
ON public.template_folders FOR ALL
USING (coach_id IN (
  SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
));