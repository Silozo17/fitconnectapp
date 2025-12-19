-- Drop the existing view
DROP VIEW IF EXISTS public.public_coach_profiles;

-- Recreate with SECURITY DEFINER (security_invoker = false)
-- This allows the view to bypass RLS on coach_profiles while only exposing safe columns
CREATE VIEW public.public_coach_profiles
WITH (security_invoker = false)
AS
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
    primary_coach_type
FROM coach_profiles
WHERE 
    onboarding_completed = true 
    AND marketplace_visible = true 
    AND (status IS NULL OR status = 'active');

-- Grant SELECT access to anonymous and authenticated users
GRANT SELECT ON public.public_coach_profiles TO anon;
GRANT SELECT ON public.public_coach_profiles TO authenticated;