-- Fix: Add selected_avatar_id to public_coach_profiles view
-- This column is required for the foreign key relationship with avatars table
DROP VIEW IF EXISTS public.public_coach_profiles;

CREATE OR REPLACE VIEW public.public_coach_profiles
WITH (security_invoker = true)
AS
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
FROM public.coach_profiles
WHERE marketplace_visible = true 
  AND status = 'active'
  AND onboarding_completed = true;