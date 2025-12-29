-- Add discovery_tour_seen column to client_profiles
ALTER TABLE public.client_profiles 
ADD COLUMN IF NOT EXISTS discovery_tour_seen BOOLEAN DEFAULT FALSE;

-- Add discovery_tour_seen column to coach_profiles
ALTER TABLE public.coach_profiles 
ADD COLUMN IF NOT EXISTS discovery_tour_seen BOOLEAN DEFAULT FALSE;

-- Migrate existing data: mark as seen for users who've completed onboarding
UPDATE public.client_profiles SET discovery_tour_seen = TRUE WHERE onboarding_completed = TRUE;
UPDATE public.coach_profiles SET discovery_tour_seen = TRUE WHERE onboarding_completed = TRUE;