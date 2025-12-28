-- Drop the dependent view first
DROP VIEW IF EXISTS public_coach_profiles;

-- Update is_complete_profile computed column to REMOVE photo requirement
-- Required for visibility: display_name, bio, coach_types, hourly_rate, session type, location
-- Photo is now OPTIONAL

ALTER TABLE coach_profiles DROP COLUMN IF EXISTS is_complete_profile;

ALTER TABLE coach_profiles 
ADD COLUMN is_complete_profile BOOLEAN 
GENERATED ALWAYS AS (
  -- Has valid display name (not blocked patterns)
  (display_name IS NOT NULL AND display_name <> '' 
   AND lower(display_name) NOT LIKE '%admin%'
   AND lower(display_name) NOT LIKE '%test%'
   AND lower(display_name) NOT LIKE '%demo%'
   AND lower(display_name) NOT LIKE '%placeholder%'
   AND lower(display_name) NOT LIKE '%sample%'
   AND lower(display_name) NOT LIKE '%dummy%'
   AND lower(display_name) NOT LIKE '%example%')
  -- Has bio with minimum length (50 chars)
  AND (bio IS NOT NULL AND length(bio) >= 50)
  -- REMOVED: Profile photo requirement (profile_image_url OR card_image_url)
  -- Has coach types
  AND (coach_types IS NOT NULL AND array_length(coach_types, 1) >= 1)
  -- Has pricing
  AND (hourly_rate IS NOT NULL AND hourly_rate > 0)
  -- Has session type (online or in-person)
  AND (online_available = true OR in_person_available = true)
  -- Has location (country code or location text)
  AND (location_country_code IS NOT NULL OR (location IS NOT NULL AND location <> ''))
) STORED;

-- Recreate the view with updated column
CREATE VIEW public_coach_profiles AS
SELECT 
  id,
  username,
  display_name,
  bio,
  profile_image_url,
  card_image_url,
  coach_types,
  primary_coach_type,
  hourly_rate,
  currency,
  location,
  location_city,
  location_region,
  location_country,
  location_country_code,
  location_lat,
  location_lng,
  experience_years,
  gym_affiliation,
  certifications,
  in_person_available,
  online_available,
  is_verified,
  verification_status,
  marketplace_visible,
  is_complete_profile,
  created_at,
  who_i_work_with,
  instagram_url,
  facebook_url,
  youtube_url,
  tiktok_url,
  x_url,
  linkedin_url,
  threads_url,
  selected_avatar_id
FROM coach_profiles
WHERE marketplace_visible = true AND status = 'active' AND onboarding_completed = true;