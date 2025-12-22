-- Add onboarding_progress column to client_profiles to persist onboarding step and form data
ALTER TABLE public.client_profiles 
ADD COLUMN IF NOT EXISTS onboarding_progress JSONB DEFAULT NULL;