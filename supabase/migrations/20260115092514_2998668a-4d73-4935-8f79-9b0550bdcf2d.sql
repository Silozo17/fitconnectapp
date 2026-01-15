-- Add member number prefix to locations for generating unique member numbers
ALTER TABLE gym_locations ADD COLUMN IF NOT EXISTS member_number_prefix TEXT;

-- Add opening hours JSON column for simplified storage (alternative to separate table)
ALTER TABLE gym_locations ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT '{}';

-- Ensure member_number exists on gym_members
ALTER TABLE gym_members ADD COLUMN IF NOT EXISTS member_number TEXT UNIQUE;

-- Create index for faster member number lookups by prefix
CREATE INDEX IF NOT EXISTS idx_gym_members_member_number ON gym_members (member_number);

-- Add home_location_id to gym_members if not exists
ALTER TABLE gym_members ADD COLUMN IF NOT EXISTS home_location_id UUID REFERENCES gym_locations(id);