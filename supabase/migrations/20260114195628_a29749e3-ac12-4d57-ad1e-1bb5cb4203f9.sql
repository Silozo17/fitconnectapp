-- Add service_settings JSONB column to gym_profiles for storing service-related settings during onboarding
ALTER TABLE public.gym_profiles
ADD COLUMN IF NOT EXISTS service_settings jsonb NOT NULL DEFAULT '{}'::jsonb;