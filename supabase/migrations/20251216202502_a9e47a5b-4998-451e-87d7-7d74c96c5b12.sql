-- Add currency column to coach_profiles table
ALTER TABLE coach_profiles 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'GBP';

-- Update existing coaches to GBP (UK launch default)
UPDATE coach_profiles SET currency = 'GBP' WHERE currency IS NULL;