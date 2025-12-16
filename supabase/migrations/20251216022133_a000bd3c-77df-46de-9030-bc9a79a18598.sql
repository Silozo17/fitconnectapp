-- Create exercise categories table
CREATE TABLE public.exercise_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.exercise_categories(id),
  muscle_groups TEXT[] DEFAULT '{}',
  equipment TEXT,
  difficulty TEXT DEFAULT 'intermediate',
  instructions TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  is_custom BOOLEAN DEFAULT false,
  coach_id UUID REFERENCES public.coach_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- RLS policies for exercise_categories (public read)
CREATE POLICY "Anyone can view exercise categories"
  ON public.exercise_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.exercise_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for exercises
CREATE POLICY "Anyone can view public exercises"
  ON public.exercises FOR SELECT
  USING (is_custom = false);

CREATE POLICY "Coaches can view their custom exercises"
  ON public.exercises FOR SELECT
  USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can create custom exercises"
  ON public.exercises FOR INSERT
  WITH CHECK (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()) AND is_custom = true);

CREATE POLICY "Coaches can update their custom exercises"
  ON public.exercises FOR UPDATE
  USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()) AND is_custom = true);

CREATE POLICY "Coaches can delete their custom exercises"
  ON public.exercises FOR DELETE
  USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()) AND is_custom = true);

CREATE POLICY "Admins can manage all exercises"
  ON public.exercises FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.exercise_categories (name, icon, color) VALUES
  ('Chest', 'dumbbell', 'red'),
  ('Back', 'dumbbell', 'blue'),
  ('Shoulders', 'dumbbell', 'orange'),
  ('Arms', 'dumbbell', 'purple'),
  ('Legs', 'dumbbell', 'green'),
  ('Core', 'dumbbell', 'yellow'),
  ('Cardio', 'heart-pulse', 'pink'),
  ('Full Body', 'activity', 'cyan');

-- Insert default exercises
INSERT INTO public.exercises (name, category_id, muscle_groups, equipment, difficulty, instructions, video_url) VALUES
  -- Chest exercises
  ('Barbell Bench Press', (SELECT id FROM exercise_categories WHERE name = 'Chest'), ARRAY['chest', 'triceps', 'shoulders'], 'Barbell', 'intermediate', 'Lie on bench, grip bar shoulder-width, lower to chest, press up', 'https://www.youtube.com/watch?v=rT7DgCr-3pg'),
  ('Incline Dumbbell Press', (SELECT id FROM exercise_categories WHERE name = 'Chest'), ARRAY['upper chest', 'triceps', 'shoulders'], 'Dumbbells', 'intermediate', 'Set bench to 30-45 degrees, press dumbbells up and together', NULL),
  ('Push-Ups', (SELECT id FROM exercise_categories WHERE name = 'Chest'), ARRAY['chest', 'triceps', 'core'], 'Bodyweight', 'beginner', 'Keep body straight, lower chest to floor, push back up', NULL),
  ('Dumbbell Flyes', (SELECT id FROM exercise_categories WHERE name = 'Chest'), ARRAY['chest'], 'Dumbbells', 'intermediate', 'Lie on bench, arms extended, lower weights in arc motion', NULL),
  ('Cable Crossovers', (SELECT id FROM exercise_categories WHERE name = 'Chest'), ARRAY['chest'], 'Cable Machine', 'intermediate', 'Stand between cables, bring handles together in front of chest', NULL),
  
  -- Back exercises
  ('Deadlift', (SELECT id FROM exercise_categories WHERE name = 'Back'), ARRAY['back', 'glutes', 'hamstrings'], 'Barbell', 'advanced', 'Hinge at hips, grip bar, drive through heels to stand', 'https://www.youtube.com/watch?v=op9kVnSso6Q'),
  ('Pull-Ups', (SELECT id FROM exercise_categories WHERE name = 'Back'), ARRAY['lats', 'biceps', 'back'], 'Pull-up Bar', 'intermediate', 'Hang from bar, pull chin over bar, lower with control', NULL),
  ('Barbell Rows', (SELECT id FROM exercise_categories WHERE name = 'Back'), ARRAY['back', 'biceps', 'rear delts'], 'Barbell', 'intermediate', 'Bend at hips, pull bar to lower chest, squeeze back', NULL),
  ('Lat Pulldown', (SELECT id FROM exercise_categories WHERE name = 'Back'), ARRAY['lats', 'biceps'], 'Cable Machine', 'beginner', 'Grip bar wide, pull to upper chest, control the return', NULL),
  ('Seated Cable Row', (SELECT id FROM exercise_categories WHERE name = 'Back'), ARRAY['back', 'biceps'], 'Cable Machine', 'beginner', 'Sit upright, pull handle to torso, squeeze shoulder blades', NULL),
  
  -- Shoulder exercises
  ('Overhead Press', (SELECT id FROM exercise_categories WHERE name = 'Shoulders'), ARRAY['shoulders', 'triceps'], 'Barbell', 'intermediate', 'Press bar overhead from shoulders, lock out at top', NULL),
  ('Lateral Raises', (SELECT id FROM exercise_categories WHERE name = 'Shoulders'), ARRAY['lateral delts'], 'Dumbbells', 'beginner', 'Raise dumbbells to sides until parallel with floor', NULL),
  ('Front Raises', (SELECT id FROM exercise_categories WHERE name = 'Shoulders'), ARRAY['front delts'], 'Dumbbells', 'beginner', 'Raise dumbbells in front until parallel with floor', NULL),
  ('Face Pulls', (SELECT id FROM exercise_categories WHERE name = 'Shoulders'), ARRAY['rear delts', 'traps'], 'Cable Machine', 'beginner', 'Pull rope to face, externally rotate at end', NULL),
  ('Arnold Press', (SELECT id FROM exercise_categories WHERE name = 'Shoulders'), ARRAY['shoulders'], 'Dumbbells', 'intermediate', 'Rotate palms while pressing dumbbells overhead', NULL),
  
  -- Arms exercises
  ('Barbell Curls', (SELECT id FROM exercise_categories WHERE name = 'Arms'), ARRAY['biceps'], 'Barbell', 'beginner', 'Curl bar to shoulders keeping elbows stationary', NULL),
  ('Tricep Dips', (SELECT id FROM exercise_categories WHERE name = 'Arms'), ARRAY['triceps', 'chest'], 'Parallel Bars', 'intermediate', 'Lower body by bending arms, push back up', NULL),
  ('Hammer Curls', (SELECT id FROM exercise_categories WHERE name = 'Arms'), ARRAY['biceps', 'forearms'], 'Dumbbells', 'beginner', 'Curl dumbbells with neutral grip', NULL),
  ('Skull Crushers', (SELECT id FROM exercise_categories WHERE name = 'Arms'), ARRAY['triceps'], 'EZ Bar', 'intermediate', 'Lower bar to forehead, extend arms to press up', NULL),
  ('Cable Tricep Pushdown', (SELECT id FROM exercise_categories WHERE name = 'Arms'), ARRAY['triceps'], 'Cable Machine', 'beginner', 'Push bar down until arms are straight', NULL),
  
  -- Leg exercises
  ('Barbell Squat', (SELECT id FROM exercise_categories WHERE name = 'Legs'), ARRAY['quads', 'glutes', 'hamstrings'], 'Barbell', 'intermediate', 'Bar on back, squat until thighs parallel, drive up', 'https://www.youtube.com/watch?v=ultWZbUMPL8'),
  ('Leg Press', (SELECT id FROM exercise_categories WHERE name = 'Legs'), ARRAY['quads', 'glutes'], 'Leg Press Machine', 'beginner', 'Push platform away, control the descent', NULL),
  ('Romanian Deadlift', (SELECT id FROM exercise_categories WHERE name = 'Legs'), ARRAY['hamstrings', 'glutes'], 'Barbell', 'intermediate', 'Hinge at hips with slight knee bend, feel hamstring stretch', NULL),
  ('Lunges', (SELECT id FROM exercise_categories WHERE name = 'Legs'), ARRAY['quads', 'glutes'], 'Bodyweight', 'beginner', 'Step forward, lower back knee toward floor, push back', NULL),
  ('Leg Curls', (SELECT id FROM exercise_categories WHERE name = 'Legs'), ARRAY['hamstrings'], 'Machine', 'beginner', 'Curl weight toward glutes, control the return', NULL),
  ('Calf Raises', (SELECT id FROM exercise_categories WHERE name = 'Legs'), ARRAY['calves'], 'Machine', 'beginner', 'Rise onto toes, hold at top, lower with control', NULL),
  
  -- Core exercises
  ('Plank', (SELECT id FROM exercise_categories WHERE name = 'Core'), ARRAY['core', 'abs'], 'Bodyweight', 'beginner', 'Hold push-up position on forearms, keep body straight', NULL),
  ('Hanging Leg Raises', (SELECT id FROM exercise_categories WHERE name = 'Core'), ARRAY['abs', 'hip flexors'], 'Pull-up Bar', 'intermediate', 'Hang from bar, raise legs to parallel, lower with control', NULL),
  ('Russian Twists', (SELECT id FROM exercise_categories WHERE name = 'Core'), ARRAY['obliques', 'abs'], 'Bodyweight', 'beginner', 'Seated lean back, rotate torso side to side', NULL),
  ('Cable Crunches', (SELECT id FROM exercise_categories WHERE name = 'Core'), ARRAY['abs'], 'Cable Machine', 'beginner', 'Kneel, pull cable down by crunching abs', NULL),
  ('Dead Bug', (SELECT id FROM exercise_categories WHERE name = 'Core'), ARRAY['core', 'abs'], 'Bodyweight', 'beginner', 'Lie on back, alternate extending opposite arm and leg', NULL),
  
  -- Cardio exercises
  ('Treadmill Running', (SELECT id FROM exercise_categories WHERE name = 'Cardio'), ARRAY['cardio', 'legs'], 'Treadmill', 'beginner', 'Maintain steady pace or interval training', NULL),
  ('Rowing Machine', (SELECT id FROM exercise_categories WHERE name = 'Cardio'), ARRAY['cardio', 'back', 'legs'], 'Rowing Machine', 'beginner', 'Drive with legs, pull with arms, return with control', NULL),
  ('Jump Rope', (SELECT id FROM exercise_categories WHERE name = 'Cardio'), ARRAY['cardio', 'calves'], 'Jump Rope', 'beginner', 'Jump with both feet, maintain steady rhythm', NULL),
  ('Battle Ropes', (SELECT id FROM exercise_categories WHERE name = 'Cardio'), ARRAY['cardio', 'arms', 'core'], 'Battle Ropes', 'intermediate', 'Create waves with alternating or simultaneous arm movements', NULL),
  ('Burpees', (SELECT id FROM exercise_categories WHERE name = 'Cardio'), ARRAY['cardio', 'full body'], 'Bodyweight', 'intermediate', 'Squat, jump back to plank, push-up, jump forward, jump up', NULL),
  
  -- Full Body exercises
  ('Clean and Press', (SELECT id FROM exercise_categories WHERE name = 'Full Body'), ARRAY['full body'], 'Barbell', 'advanced', 'Clean bar to shoulders, press overhead', NULL),
  ('Thrusters', (SELECT id FROM exercise_categories WHERE name = 'Full Body'), ARRAY['legs', 'shoulders'], 'Barbell', 'intermediate', 'Front squat into overhead press in one motion', NULL),
  ('Kettlebell Swings', (SELECT id FROM exercise_categories WHERE name = 'Full Body'), ARRAY['glutes', 'hamstrings', 'core'], 'Kettlebell', 'beginner', 'Hip hinge, swing kettlebell to chest height', NULL),
  ('Turkish Get-Up', (SELECT id FROM exercise_categories WHERE name = 'Full Body'), ARRAY['full body', 'core'], 'Kettlebell', 'advanced', 'Rise from floor to standing while holding weight overhead', NULL),
  ('Man Makers', (SELECT id FROM exercise_categories WHERE name = 'Full Body'), ARRAY['full body'], 'Dumbbells', 'advanced', 'Push-up, row each arm, jump to squat, press overhead', NULL);