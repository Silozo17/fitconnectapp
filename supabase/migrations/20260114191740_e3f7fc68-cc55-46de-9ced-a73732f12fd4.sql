-- Add missing columns for gym onboarding
ALTER TABLE public.gym_profiles
ADD COLUMN IF NOT EXISTS business_types text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS owner_name text,
ADD COLUMN IF NOT EXISTS owner_phone text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_progress jsonb DEFAULT '{}';

-- Add an index on onboarding_completed for faster queries
CREATE INDEX IF NOT EXISTS idx_gym_profiles_onboarding_completed 
ON public.gym_profiles(onboarding_completed);