-- Add onboarding_progress JSONB column to coach_profiles for granular tracking
ALTER TABLE public.coach_profiles 
ADD COLUMN IF NOT EXISTS onboarding_progress jsonb DEFAULT '{}';

-- Add also_client boolean to coach_profiles to track dual accounts
ALTER TABLE public.coach_profiles 
ADD COLUMN IF NOT EXISTS also_client boolean DEFAULT false;

COMMENT ON COLUMN public.coach_profiles.onboarding_progress IS 'Tracks individual onboarding step completion: profile_complete, stripe_connected, integrations_setup, plan_selected';
COMMENT ON COLUMN public.coach_profiles.also_client IS 'Whether the coach also has a client account';