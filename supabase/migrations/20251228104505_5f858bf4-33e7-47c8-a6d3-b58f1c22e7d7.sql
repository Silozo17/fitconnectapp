-- Add gender column (replacing pronouns conceptually)
ALTER TABLE client_profiles 
ADD COLUMN IF NOT EXISTS gender text 
CHECK (gender IN ('male', 'female', 'prefer_not_to_say'));

-- Add activity_level column
ALTER TABLE client_profiles 
ADD COLUMN IF NOT EXISTS activity_level text 
CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active'))
DEFAULT 'moderate';

-- Migrate existing pronouns data to gender
UPDATE client_profiles 
SET gender = CASE 
  WHEN lower(gender_pronouns) LIKE '%she%' OR lower(gender_pronouns) LIKE '%her%' OR lower(gender_pronouns) = 'female' THEN 'female'
  WHEN lower(gender_pronouns) LIKE '%he%' OR lower(gender_pronouns) LIKE '%him%' OR lower(gender_pronouns) = 'male' THEN 'male'
  WHEN gender_pronouns IS NOT NULL AND gender_pronouns != '' THEN 'prefer_not_to_say'
  ELSE NULL
END
WHERE gender IS NULL;

-- Set default activity level for existing users without any data
UPDATE client_profiles SET activity_level = 'moderate' WHERE activity_level IS NULL;