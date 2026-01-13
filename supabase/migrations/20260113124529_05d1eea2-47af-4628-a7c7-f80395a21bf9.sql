-- Fix get_simple_coaches: remove reviews join (column mismatch), return 0 for ratings
-- Priority: make it WORK first

DROP FUNCTION IF EXISTS public.get_simple_coaches(TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER);

CREATE OR REPLACE FUNCTION public.get_simple_coaches(
  p_filter_country_code TEXT DEFAULT NULL,
  p_search_term TEXT DEFAULT NULL,
  p_coach_types TEXT[] DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_online_only BOOLEAN DEFAULT FALSE,
  p_in_person_only BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID, username TEXT, display_name TEXT, bio TEXT, coach_types TEXT[],
  certifications TEXT[], experience_years INTEGER, hourly_rate NUMERIC, currency TEXT,
  location TEXT, location_city TEXT, location_region TEXT, location_country TEXT,
  location_country_code TEXT, online_available BOOLEAN, in_person_available BOOLEAN,
  profile_image_url TEXT, card_image_url TEXT, booking_mode TEXT, is_verified BOOLEAN,
  verified_at TIMESTAMPTZ, gym_affiliation TEXT, marketplace_visible BOOLEAN,
  selected_avatar_id UUID, created_at TIMESTAMPTZ, onboarding_completed BOOLEAN,
  who_i_work_with TEXT, facebook_url TEXT, instagram_url TEXT, tiktok_url TEXT,
  x_url TEXT, threads_url TEXT, linkedin_url TEXT, youtube_url TEXT,
  avatar_slug TEXT, avatar_rarity TEXT, is_sponsored BOOLEAN,
  avg_rating NUMERIC, review_count BIGINT, tags TEXT[]
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id, cp.username, cp.display_name, cp.bio, cp.coach_types,
    cp.certifications, cp.experience_years, cp.hourly_rate, cp.currency,
    cp.location, cp.location_city, cp.location_region, cp.location_country,
    cp.location_country_code, cp.online_available, cp.in_person_available,
    cp.profile_image_url, cp.card_image_url, cp.booking_mode, cp.is_verified,
    cp.verified_at, cp.gym_affiliation, cp.marketplace_visible,
    cp.selected_avatar_id, cp.created_at, cp.onboarding_completed,
    cp.who_i_work_with, cp.facebook_url, cp.instagram_url, cp.tiktok_url,
    cp.x_url, cp.threads_url, cp.linkedin_url, cp.youtube_url,
    av.slug AS avatar_slug, av.rarity AS avatar_rarity,
    FALSE AS is_sponsored,
    0::NUMERIC AS avg_rating,
    0::BIGINT AS review_count,
    cp.tags
  FROM coach_profiles cp
  LEFT JOIN avatars av ON av.id = cp.selected_avatar_id
  WHERE
    cp.marketplace_visible = TRUE
    AND cp.onboarding_completed = TRUE
    AND (cp.status IS NULL OR cp.status = 'active')
    AND (p_filter_country_code IS NULL OR UPPER(TRIM(cp.location_country_code)) = UPPER(TRIM(p_filter_country_code)))
    AND (p_search_term IS NULL OR cp.display_name ILIKE '%' || p_search_term || '%' OR cp.bio ILIKE '%' || p_search_term || '%')
    AND (p_coach_types IS NULL OR cp.coach_types && p_coach_types)
    AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
    AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
    AND (NOT p_online_only OR cp.online_available = TRUE)
    AND (NOT p_in_person_only OR cp.in_person_available = TRUE)
  ORDER BY cp.created_at DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_simple_coaches(TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_simple_coaches(TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER) TO anon;