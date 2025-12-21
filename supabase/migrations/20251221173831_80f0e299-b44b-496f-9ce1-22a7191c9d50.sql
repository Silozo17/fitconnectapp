-- Add computed column to coach_profiles for profile completeness
ALTER TABLE coach_profiles 
ADD COLUMN IF NOT EXISTS is_complete_profile BOOLEAN 
GENERATED ALWAYS AS (
  -- Has valid display name (not null, not blocked patterns)
  display_name IS NOT NULL 
  AND display_name != ''
  AND LOWER(display_name) NOT LIKE '%admin%'
  AND LOWER(display_name) NOT LIKE '%test%'
  AND LOWER(display_name) NOT LIKE '%demo%'
  AND LOWER(display_name) NOT LIKE '%placeholder%'
  -- Has meaningful bio (at least 50 chars)
  AND bio IS NOT NULL 
  AND LENGTH(bio) >= 50
  -- Has profile image
  AND (profile_image_url IS NOT NULL OR card_image_url IS NOT NULL)
  -- Has at least one coach type
  AND coach_types IS NOT NULL 
  AND ARRAY_LENGTH(coach_types, 1) >= 1
  -- Has pricing set
  AND hourly_rate IS NOT NULL 
  AND hourly_rate > 0
  -- Has session availability defined
  AND (online_available = true OR in_person_available = true)
  -- Has location defined
  AND (
    location_country_code IS NOT NULL 
    OR (location IS NOT NULL AND location != '')
  )
) STORED;

-- Drop and recreate view to add the new column (must match existing column order first)
DROP VIEW IF EXISTS public_coach_profiles;

CREATE VIEW public_coach_profiles AS
SELECT 
  id,
  username,
  display_name,
  bio,
  coach_types,
  certifications,
  experience_years,
  hourly_rate,
  currency,
  location,
  location_city,
  location_region,
  location_country,
  location_country_code,
  location_lat,
  location_lng,
  online_available,
  in_person_available,
  profile_image_url,
  card_image_url,
  booking_mode,
  is_verified,
  verified_at,
  gym_affiliation,
  marketplace_visible,
  selected_avatar_id,
  created_at,
  onboarding_completed,
  who_i_work_with,
  facebook_url,
  instagram_url,
  tiktok_url,
  x_url,
  threads_url,
  linkedin_url,
  youtube_url,
  primary_coach_type,
  is_complete_profile
FROM coach_profiles
WHERE onboarding_completed = true 
  AND marketplace_visible = true 
  AND (status IS NULL OR status = 'active');