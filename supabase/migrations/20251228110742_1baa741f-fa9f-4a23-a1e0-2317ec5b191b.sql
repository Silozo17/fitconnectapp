-- Add fatsecret_id column to foods table
ALTER TABLE foods ADD COLUMN IF NOT EXISTS fatsecret_id text;

-- Add source column to track where food data came from
ALTER TABLE foods ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';

-- Create index for faster lookups by fatsecret_id
CREATE INDEX IF NOT EXISTS idx_foods_fatsecret_id ON foods(fatsecret_id);

-- Create unique constraint to prevent duplicate FatSecret foods per coach
CREATE UNIQUE INDEX IF NOT EXISTS idx_foods_fatsecret_coach 
ON foods(fatsecret_id, coach_id) 
WHERE fatsecret_id IS NOT NULL;

-- Mark existing foods as legacy
UPDATE foods SET source = 'legacy' WHERE source IS NULL OR source = 'manual';