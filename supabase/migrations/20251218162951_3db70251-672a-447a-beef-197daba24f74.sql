-- Add social media URL columns to coach_profiles
ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS facebook_url text;
ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS tiktok_url text;
ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS x_url text;
ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS threads_url text;
ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS youtube_url text;