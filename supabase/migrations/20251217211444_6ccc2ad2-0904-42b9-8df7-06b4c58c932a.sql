-- Add marketplace_visible column to coach_profiles
ALTER TABLE public.coach_profiles 
ADD COLUMN IF NOT EXISTS marketplace_visible boolean DEFAULT true;

-- Create index for efficient marketplace filtering
CREATE INDEX IF NOT EXISTS idx_coach_profiles_marketplace_visible 
ON public.coach_profiles (marketplace_visible) 
WHERE marketplace_visible = true AND onboarding_completed = true;