-- Create client_habits table (habits assigned to clients by coaches)
CREATE TABLE public.client_habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  client_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  frequency TEXT NOT NULL DEFAULT 'daily',
  specific_days INTEGER[] DEFAULT '{}',
  target_count INTEGER NOT NULL DEFAULT 1,
  reminder_time TIME,
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create habit_logs table (client check-ins)
CREATE TABLE public.habit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID NOT NULL REFERENCES public.client_habits(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_count INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habit_id, logged_at)
);

-- Create habit_streaks table (cached streak data)
CREATE TABLE public.habit_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID NOT NULL UNIQUE REFERENCES public.client_habits(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  total_completions INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_habits
CREATE POLICY "Coaches can manage habits for their clients"
ON public.client_habits FOR ALL
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can view their assigned habits"
ON public.client_habits FOR SELECT
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

-- RLS Policies for habit_logs
CREATE POLICY "Clients can manage their own habit logs"
ON public.habit_logs FOR ALL
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can view their clients habit logs"
ON public.habit_logs FOR SELECT
USING (habit_id IN (
  SELECT h.id FROM client_habits h
  JOIN coach_profiles cp ON h.coach_id = cp.id
  WHERE cp.user_id = auth.uid()
));

-- RLS Policies for habit_streaks
CREATE POLICY "Clients can view their habit streaks"
ON public.habit_streaks FOR SELECT
USING (habit_id IN (
  SELECT h.id FROM client_habits h
  JOIN client_profiles cp ON h.client_id = cp.id
  WHERE cp.user_id = auth.uid()
));

CREATE POLICY "Coaches can view their clients habit streaks"
ON public.habit_streaks FOR SELECT
USING (habit_id IN (
  SELECT h.id FROM client_habits h
  JOIN coach_profiles cp ON h.coach_id = cp.id
  WHERE cp.user_id = auth.uid()
));

CREATE POLICY "System can manage habit streaks"
ON public.habit_streaks FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at on client_habits
CREATE TRIGGER update_client_habits_updated_at
BEFORE UPDATE ON public.client_habits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update streak on habit log
CREATE OR REPLACE FUNCTION public.update_habit_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_current_streak INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_total INTEGER := 0;
  v_last_date DATE;
  v_habit_record RECORD;
BEGIN
  -- Get or create streak record
  SELECT * INTO v_habit_record FROM habit_streaks WHERE habit_id = NEW.habit_id;
  
  IF NOT FOUND THEN
    INSERT INTO habit_streaks (habit_id, current_streak, longest_streak, last_completed_date, total_completions)
    VALUES (NEW.habit_id, 1, 1, NEW.logged_at, 1);
    RETURN NEW;
  END IF;
  
  v_last_date := v_habit_record.last_completed_date;
  v_current_streak := v_habit_record.current_streak;
  v_longest_streak := v_habit_record.longest_streak;
  v_total := v_habit_record.total_completions;
  
  -- Calculate new streak
  IF v_last_date IS NULL OR NEW.logged_at > v_last_date THEN
    IF v_last_date IS NULL OR NEW.logged_at = v_last_date + INTERVAL '1 day' THEN
      v_current_streak := v_current_streak + 1;
    ELSIF NEW.logged_at > v_last_date + INTERVAL '1 day' THEN
      v_current_streak := 1;
    END IF;
    
    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;
    
    v_total := v_total + NEW.completed_count;
    
    UPDATE habit_streaks
    SET current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_completed_date = NEW.logged_at,
        total_completions = v_total,
        updated_at = now()
    WHERE habit_id = NEW.habit_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for streak updates
CREATE TRIGGER update_streak_on_log
AFTER INSERT ON public.habit_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_habit_streak();