-- Create coach_dashboard_widgets table
CREATE TABLE public.coach_dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  size TEXT DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large', 'full')),
  is_visible BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Coaches can manage their own widgets
CREATE POLICY "Coaches can view own widgets" ON public.coach_dashboard_widgets
  FOR SELECT USING (
    coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can insert own widgets" ON public.coach_dashboard_widgets
  FOR INSERT WITH CHECK (
    coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can update own widgets" ON public.coach_dashboard_widgets
  FOR UPDATE USING (
    coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can delete own widgets" ON public.coach_dashboard_widgets
  FOR DELETE USING (
    coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid())
  );

-- Index for faster lookups
CREATE INDEX idx_coach_dashboard_widgets_coach_id ON public.coach_dashboard_widgets(coach_id);

-- Trigger for updated_at
CREATE TRIGGER update_coach_dashboard_widgets_updated_at
  BEFORE UPDATE ON public.coach_dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();