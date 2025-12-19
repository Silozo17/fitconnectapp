-- Add leads_last_viewed_at column to coach_profiles for tracking when coach last viewed their pipeline
ALTER TABLE coach_profiles 
ADD COLUMN IF NOT EXISTS leads_last_viewed_at timestamptz DEFAULT NULL;