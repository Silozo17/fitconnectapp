-- Fix: Update streak function to only count wearable_auto verification for wearable-linked habits
-- This ensures streaks for wearable habits only increment when the actual target is met

CREATE OR REPLACE FUNCTION public.update_habit_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_current_streak INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_total INTEGER := 0;
  v_last_date DATE;
  v_habit_record RECORD;
  v_habit RECORD;
  v_is_wearable_habit BOOLEAN;
BEGIN
  -- Check if this is a wearable-linked habit
  SELECT wearable_target_type IS NOT NULL INTO v_is_wearable_habit
  FROM client_habits 
  WHERE id = NEW.habit_id;
  
  -- For wearable-linked habits, only count wearable_auto verified logs
  -- This prevents manual logs from counting toward streaks when targets weren't met
  IF v_is_wearable_habit AND NEW.verification_type != 'wearable_auto' THEN
    RETURN NEW;
  END IF;

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