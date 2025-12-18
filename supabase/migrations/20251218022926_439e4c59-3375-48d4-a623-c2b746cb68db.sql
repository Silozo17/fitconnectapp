-- Add verified_at to the public coach profiles view (not sensitive data)
DROP VIEW IF EXISTS public.public_coach_profiles;

CREATE VIEW public.public_coach_profiles AS
SELECT 
  id,
  display_name,
  bio,
  coach_types,
  certifications,
  experience_years,
  hourly_rate,
  currency,
  location,
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
  onboarding_completed
FROM public.coach_profiles
WHERE onboarding_completed = true 
  AND marketplace_visible = true
  AND (status IS NULL OR status = 'active');

-- Set security invoker and grant permissions
ALTER VIEW public.public_coach_profiles SET (security_invoker = on);
GRANT SELECT ON public.public_coach_profiles TO anon, authenticated;