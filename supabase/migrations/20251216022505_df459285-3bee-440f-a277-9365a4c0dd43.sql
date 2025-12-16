-- Create food categories table
CREATE TABLE public.food_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view food categories
CREATE POLICY "Anyone can view food categories" ON public.food_categories
  FOR SELECT USING (true);

-- Admins can manage categories
CREATE POLICY "Admins can manage food categories" ON public.food_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create foods table
CREATE TABLE public.foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.food_categories(id),
  calories_per_100g NUMERIC NOT NULL DEFAULT 0,
  protein_g NUMERIC NOT NULL DEFAULT 0,
  carbs_g NUMERIC NOT NULL DEFAULT 0,
  fat_g NUMERIC NOT NULL DEFAULT 0,
  fiber_g NUMERIC DEFAULT 0,
  serving_size_g NUMERIC DEFAULT 100,
  serving_description TEXT DEFAULT '100g',
  is_custom BOOLEAN DEFAULT false,
  coach_id UUID REFERENCES public.coach_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- Anyone can view public foods
CREATE POLICY "Anyone can view public foods" ON public.foods
  FOR SELECT USING (is_custom = false);

-- Coaches can view their custom foods
CREATE POLICY "Coaches can view their custom foods" ON public.foods
  FOR SELECT USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

-- Coaches can create custom foods
CREATE POLICY "Coaches can create custom foods" ON public.foods
  FOR INSERT WITH CHECK (
    coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()) 
    AND is_custom = true
  );

-- Coaches can update their custom foods
CREATE POLICY "Coaches can update their custom foods" ON public.foods
  FOR UPDATE USING (
    coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()) 
    AND is_custom = true
  );

-- Coaches can delete their custom foods
CREATE POLICY "Coaches can delete their custom foods" ON public.foods
  FOR DELETE USING (
    coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()) 
    AND is_custom = true
  );

-- Admins can manage all foods
CREATE POLICY "Admins can manage all foods" ON public.foods
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create nutrition plans table (extends training_plans with type 'nutrition')
-- We'll use the existing training_plans table with plan_type = 'nutrition'

-- Insert default food categories
INSERT INTO public.food_categories (name, icon, color) VALUES
  ('Proteins', 'Drumstick', '#ef4444'),
  ('Carbohydrates', 'Wheat', '#f59e0b'),
  ('Vegetables', 'Salad', '#22c55e'),
  ('Fruits', 'Apple', '#a855f7'),
  ('Dairy', 'Milk', '#3b82f6'),
  ('Fats & Oils', 'Droplet', '#eab308'),
  ('Snacks', 'Cookie', '#f97316'),
  ('Beverages', 'Coffee', '#6366f1');

-- Insert sample foods
INSERT INTO public.foods (name, category_id, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, serving_size_g, serving_description) 
SELECT 
  'Chicken Breast (Grilled)', id, 165, 31, 0, 3.6, 0, 100, '100g'
FROM public.food_categories WHERE name = 'Proteins';

INSERT INTO public.foods (name, category_id, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, serving_size_g, serving_description) 
SELECT 
  'Salmon (Baked)', id, 208, 20, 0, 13, 0, 150, '1 fillet (150g)'
FROM public.food_categories WHERE name = 'Proteins';

INSERT INTO public.foods (name, category_id, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, serving_size_g, serving_description) 
SELECT 
  'Eggs (Whole)', id, 155, 13, 1.1, 11, 0, 50, '1 large egg'
FROM public.food_categories WHERE name = 'Proteins';

INSERT INTO public.foods (name, category_id, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, serving_size_g, serving_description) 
SELECT 
  'Brown Rice (Cooked)', id, 112, 2.6, 23, 0.9, 1.8, 150, '1 cup cooked'
FROM public.food_categories WHERE name = 'Carbohydrates';

INSERT INTO public.foods (name, category_id, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, serving_size_g, serving_description) 
SELECT 
  'Sweet Potato (Baked)', id, 90, 2, 21, 0.1, 3.3, 150, '1 medium'
FROM public.food_categories WHERE name = 'Carbohydrates';

INSERT INTO public.foods (name, category_id, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, serving_size_g, serving_description) 
SELECT 
  'Oats (Dry)', id, 389, 17, 66, 7, 11, 40, '1/2 cup dry'
FROM public.food_categories WHERE name = 'Carbohydrates';

INSERT INTO public.foods (name, category_id, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, serving_size_g, serving_description) 
SELECT 
  'Broccoli (Steamed)', id, 35, 2.4, 7, 0.4, 3.3, 100, '1 cup'
FROM public.food_categories WHERE name = 'Vegetables';

INSERT INTO public.foods (name, category_id, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, serving_size_g, serving_description) 
SELECT 
  'Spinach (Raw)', id, 23, 2.9, 3.6, 0.4, 2.2, 30, '1 cup raw'
FROM public.food_categories WHERE name = 'Vegetables';

INSERT INTO public.foods (name, category_id, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, serving_size_g, serving_description) 
SELECT 
  'Banana', id, 89, 1.1, 23, 0.3, 2.6, 120, '1 medium'
FROM public.food_categories WHERE name = 'Fruits';

INSERT INTO public.foods (name, category_id, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, serving_size_g, serving_description) 
SELECT 
  'Greek Yogurt (Plain)', id, 97, 9, 3.6, 5, 0, 170, '1 container'
FROM public.food_categories WHERE name = 'Dairy';

INSERT INTO public.foods (name, category_id, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, serving_size_g, serving_description) 
SELECT 
  'Almonds', id, 579, 21, 22, 50, 12, 28, '1 oz (23 almonds)'
FROM public.food_categories WHERE name = 'Fats & Oils';

INSERT INTO public.foods (name, category_id, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, serving_size_g, serving_description) 
SELECT 
  'Olive Oil', id, 884, 0, 0, 100, 0, 14, '1 tbsp'
FROM public.food_categories WHERE name = 'Fats & Oils';

-- Add trigger for updated_at
CREATE TRIGGER update_foods_updated_at
  BEFORE UPDATE ON public.foods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();