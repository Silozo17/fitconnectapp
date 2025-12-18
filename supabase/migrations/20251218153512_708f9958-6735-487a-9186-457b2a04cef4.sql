-- Add primary_coach_type column to coach_profiles
ALTER TABLE public.coach_profiles 
ADD COLUMN IF NOT EXISTS primary_coach_type TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.coach_profiles.primary_coach_type IS 'The coach''s primary specialty from coach_types array';