-- Add locale preference columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS country_preference text,
ADD COLUMN IF NOT EXISTS language_preference text,
ADD COLUMN IF NOT EXISTS locale_initialized_at timestamptz;