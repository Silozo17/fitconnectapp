-- Add allergen preferences to client_profiles
ALTER TABLE public.client_profiles 
ADD COLUMN IF NOT EXISTS allergen_preferences JSONB DEFAULT '[]'::jsonb;

-- Create food_diary table for client meal logging
CREATE TABLE IF NOT EXISTS public.food_diary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_id UUID REFERENCES public.foods(id) ON DELETE SET NULL,
  fatsecret_id TEXT,
  food_name TEXT NOT NULL,
  serving_size_g NUMERIC,
  servings NUMERIC DEFAULT 1,
  calories NUMERIC,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  fiber_g NUMERIC,
  sugar_g NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.food_diary ENABLE ROW LEVEL SECURITY;

-- Clients can manage their own food diary entries
CREATE POLICY "Clients can view own food diary"
ON public.food_diary FOR SELECT
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can insert own food diary"
ON public.food_diary FOR INSERT
WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can update own food diary"
ON public.food_diary FOR UPDATE
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can delete own food diary"
ON public.food_diary FOR DELETE
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

-- Coaches can view their clients' food diaries
CREATE POLICY "Coaches can view client food diaries"
ON public.food_diary FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.coach_clients cc
    WHERE cc.client_id = food_diary.client_id
    AND cc.coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
    AND cc.status = 'active'
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_food_diary_client_id ON public.food_diary(client_id);
CREATE INDEX IF NOT EXISTS idx_food_diary_logged_at ON public.food_diary(logged_at);
CREATE INDEX IF NOT EXISTS idx_food_diary_meal_type ON public.food_diary(meal_type);

-- Create trigger for updated_at
CREATE TRIGGER update_food_diary_updated_at
BEFORE UPDATE ON public.food_diary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();