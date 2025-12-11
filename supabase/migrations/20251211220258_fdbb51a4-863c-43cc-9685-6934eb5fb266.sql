
-- Coach-Client relationship table
CREATE TABLE public.coach_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  plan_type TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coach_id, client_id)
);

-- Coaching sessions table
CREATE TABLE public.coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL DEFAULT '1-on-1',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  location TEXT,
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client notes table
CREATE TABLE public.client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'progress', 'injury', 'feedback', 'goal')),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client progress tracking table
CREATE TABLE public.client_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC,
  body_fat_percentage NUMERIC,
  measurements JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Training plans table
CREATE TABLE public.training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('workout', 'nutrition', 'hybrid')),
  content JSONB DEFAULT '[]'::jsonb,
  is_template BOOLEAN DEFAULT false,
  duration_weeks INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plan assignments table
CREATE TABLE public.plan_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.training_plans(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.coach_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coach_clients
CREATE POLICY "Coaches can view their own clients" ON public.coach_clients
  FOR SELECT USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can insert their own clients" ON public.coach_clients
  FOR INSERT WITH CHECK (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update their own clients" ON public.coach_clients
  FOR UPDATE USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can delete their own clients" ON public.coach_clients
  FOR DELETE USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- RLS Policies for coaching_sessions
CREATE POLICY "Coaches can view their own sessions" ON public.coaching_sessions
  FOR SELECT USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can insert their own sessions" ON public.coaching_sessions
  FOR INSERT WITH CHECK (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update their own sessions" ON public.coaching_sessions
  FOR UPDATE USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can delete their own sessions" ON public.coaching_sessions
  FOR DELETE USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- RLS Policies for client_notes
CREATE POLICY "Coaches can view their own notes" ON public.client_notes
  FOR SELECT USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can insert their own notes" ON public.client_notes
  FOR INSERT WITH CHECK (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update their own notes" ON public.client_notes
  FOR UPDATE USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can delete their own notes" ON public.client_notes
  FOR DELETE USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- RLS Policies for client_progress
CREATE POLICY "Coaches can view their clients progress" ON public.client_progress
  FOR SELECT USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can insert client progress" ON public.client_progress
  FOR INSERT WITH CHECK (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update client progress" ON public.client_progress
  FOR UPDATE USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can delete client progress" ON public.client_progress
  FOR DELETE USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- RLS Policies for training_plans
CREATE POLICY "Coaches can view their own plans" ON public.training_plans
  FOR SELECT USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can insert their own plans" ON public.training_plans
  FOR INSERT WITH CHECK (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update their own plans" ON public.training_plans
  FOR UPDATE USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can delete their own plans" ON public.training_plans
  FOR DELETE USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- RLS Policies for plan_assignments
CREATE POLICY "Coaches can view their plan assignments" ON public.plan_assignments
  FOR SELECT USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can insert plan assignments" ON public.plan_assignments
  FOR INSERT WITH CHECK (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update plan assignments" ON public.plan_assignments
  FOR UPDATE USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can delete plan assignments" ON public.plan_assignments
  FOR DELETE USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_coach_clients_updated_at BEFORE UPDATE ON public.coach_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaching_sessions_updated_at BEFORE UPDATE ON public.coaching_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_notes_updated_at BEFORE UPDATE ON public.client_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON public.training_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plan_assignments_updated_at BEFORE UPDATE ON public.plan_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
