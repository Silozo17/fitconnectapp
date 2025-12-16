-- Add last viewed tracking columns to admin_profiles
ALTER TABLE admin_profiles 
  ADD COLUMN IF NOT EXISTS users_last_viewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS coaches_last_viewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS verifications_last_viewed_at TIMESTAMP WITH TIME ZONE;