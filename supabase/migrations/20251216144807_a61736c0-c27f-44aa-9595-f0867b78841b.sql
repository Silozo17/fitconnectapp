-- Add leaderboard privacy and structured location fields to client_profiles
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS leaderboard_visible BOOLEAN DEFAULT false;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS leaderboard_display_name TEXT;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS county TEXT;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Create index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_client_profiles_leaderboard ON client_profiles (leaderboard_visible, country, county, city) WHERE leaderboard_visible = true;