-- Drop existing function (any signature)
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER, NUMERIC, NUMERIC);
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER, double precision, double precision);
DROP FUNCTION IF EXISTS public.get_ranked_coaches;

-- Recreate with correct signature matching latest schema
CREATE OR REPLACE FUNCTION public.get_ranked_coaches(
  p_user_city TEXT DEFAULT NULL,
  p_user_region TEXT DEFAULT NULL,
  p_user_country_code TEXT DEFAULT NULL,
  p_filter_country_code TEXT DEFAULT NULL,
  p_search_term TEXT DEFAULT NULL,
  p_coach_types TEXT[] DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_online_only BOOLEAN DEFAULT FALSE,
  p_in_person_only BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT 50,
  p_user_lat NUMERIC DEFAULT NULL,
  p_user_lng NUMERIC DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  bio TEXT,
  profile_image_url TEXT,
  card_image_url TEXT,
  coach_types TEXT[],
  hourly_rate NUMERIC,
  currency TEXT,
  location TEXT,
  location_city TEXT,
  location_region TEXT,
  location_country TEXT,
  location_country_code TEXT,
  gym_affiliation TEXT,
  experience_years INTEGER,
  is_verified BOOLEAN,
  verified_at TIMESTAMPTZ,
  online_available BOOLEAN,
  in_person_available BOOLEAN,
  instagram_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  linkedin_url TEXT,
  tiktok_url TEXT,
  is_sponsored BOOLEAN,
  avatar_slug TEXT,
  avatar_rarity TEXT,
  location_tier INTEGER,
  location_score NUMERIC,
  engagement_score NUMERIC,
  profile_score NUMERIC,
  total_score NUMERIC,
  verified_qualification_count BIGINT,
  distance_miles NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_location BOOLEAN;
  v_has_coordinates BOOLEAN;
BEGIN
  v_has_location := (p_user_city IS NOT NULL OR p_user_region IS NOT NULL OR p_user_country_code IS NOT NULL);
  v_has_coordinates := (p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL);

  RETURN QUERY
  WITH coach_qualifications AS (
    SELECT 
      cq.coach_id,
      COUNT(*) FILTER (WHERE cq.verification_status = 'verified') as verified_count
    FROM coach_qualifications cq
    GROUP BY cq.coach_id
  ),
  ranked_coaches AS (
    SELECT 
      cp.id,
      cp.user_id,
      cp.username,
      cp.display_name,
      cp.bio,
      cp.profile_image_url,
      cp.card_image_url,
      cp.coach_types,
      cp.hourly_rate,
      cp.currency,
      cp.location,
      cp.location_city,
      cp.location_region,
      cp.location_country,
      cp.location_country_code,
      cp.gym_affiliation,
      cp.experience_years,
      cp.is_verified,
      cp.verified_at,
      cp.online_available,
      cp.in_person_available,
      cp.instagram_url,
      cp.facebook_url,
      cp.twitter_url,
      cp.youtube_url,
      cp.linkedin_url,
      cp.tiktok_url,
      COALESCE(cb.is_active AND cb.expires_at > NOW(), FALSE) as is_sponsored,
      a.slug as avatar_slug,
      a.rarity as avatar_rarity,
      COALESCE(cq.verified_count, 0) as verified_qualification_count,
      cp.location_lat,
      cp.location_lng,
      -- Calculate distance in miles if coordinates provided
      CASE 
        WHEN v_has_coordinates AND cp.location_lat IS NOT NULL AND cp.location_lng IS NOT NULL THEN
          3959 * acos(
            cos(radians(p_user_lat::double precision)) * cos(radians(cp.location_lat::double precision)) *
            cos(radians(cp.location_lng::double precision) - radians(p_user_lng::double precision)) +
            sin(radians(p_user_lat::double precision)) * sin(radians(cp.location_lat::double precision))
          )
        ELSE NULL
      END as distance_miles,
      -- Location tier scoring
      CASE 
        WHEN NOT v_has_location THEN 3
        WHEN cp.location_city IS NOT NULL AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 1
        WHEN cp.location_region IS NOT NULL AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 2
        WHEN cp.location_country_code IS NOT NULL AND LOWER(cp.location_country_code) = LOWER(p_user_country_code) THEN 3
        ELSE 4
      END as location_tier,
      -- Location score (0-30 points)
      CASE 
        WHEN NOT v_has_location THEN 15
        WHEN cp.location_city IS NOT NULL AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 30
        WHEN cp.location_region IS NOT NULL AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 20
        WHEN cp.location_country_code IS NOT NULL AND LOWER(cp.location_country_code) = LOWER(p_user_country_code) THEN 10
        ELSE 0
      END as location_score,
      -- Engagement score (0-40 points)
      (
        CASE WHEN cp.bio IS NOT NULL AND LENGTH(cp.bio) > 50 THEN 10 ELSE 0 END +
        CASE WHEN cp.profile_image_url IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN cp.card_image_url IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN cp.is_verified THEN 10 ELSE 0 END +
        LEAST(COALESCE(cq.verified_count, 0) * 2, 5)
      ) as engagement_score,
      -- Profile completeness score (0-30 points)
      (
        CASE WHEN cp.hourly_rate IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN cp.experience_years IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN cp.coach_types IS NOT NULL AND array_length(cp.coach_types, 1) > 0 THEN 5 ELSE 0 END +
        CASE WHEN cp.gym_affiliation IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN cp.online_available OR cp.in_person_available THEN 5 ELSE 0 END +
        CASE WHEN cp.instagram_url IS NOT NULL OR cp.facebook_url IS NOT NULL OR cp.youtube_url IS NOT NULL THEN 5 ELSE 0 END
      ) as profile_score
    FROM coach_profiles cp
    LEFT JOIN coach_boosts cb ON cb.coach_id = cp.id
    LEFT JOIN avatars a ON a.id = cp.selected_avatar_id
    LEFT JOIN coach_qualifications cq ON cq.coach_id = cp.id
    WHERE 
      cp.status = 'active'
      AND cp.is_marketplace_visible = TRUE
      -- Country filter
      AND (p_filter_country_code IS NULL OR LOWER(cp.location_country_code) = LOWER(p_filter_country_code))
      -- Search term filter
      AND (
        p_search_term IS NULL 
        OR cp.display_name ILIKE '%' || p_search_term || '%'
        OR cp.bio ILIKE '%' || p_search_term || '%'
        OR cp.location_city ILIKE '%' || p_search_term || '%'
        OR cp.location_region ILIKE '%' || p_search_term || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(cp.coach_types) ct WHERE ct ILIKE '%' || p_search_term || '%'
        )
      )
      -- Coach types filter
      AND (p_coach_types IS NULL OR cp.coach_types && p_coach_types)
      -- Price filters
      AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
      AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
      -- Online/In-person filters
      AND (NOT p_online_only OR cp.online_available = TRUE)
      AND (NOT p_in_person_only OR cp.in_person_available = TRUE)
  )
  SELECT 
    rc.id,
    rc.user_id,
    rc.username,
    rc.display_name,
    rc.bio,
    rc.profile_image_url,
    rc.card_image_url,
    rc.coach_types,
    rc.hourly_rate,
    rc.currency,
    rc.location,
    rc.location_city,
    rc.location_region,
    rc.location_country,
    rc.location_country_code,
    rc.gym_affiliation,
    rc.experience_years,
    rc.is_verified,
    rc.verified_at,
    rc.online_available,
    rc.in_person_available,
    rc.instagram_url,
    rc.facebook_url,
    rc.twitter_url,
    rc.youtube_url,
    rc.linkedin_url,
    rc.tiktok_url,
    rc.is_sponsored,
    rc.avatar_slug,
    rc.avatar_rarity,
    rc.location_tier,
    rc.location_score::NUMERIC,
    rc.engagement_score::NUMERIC,
    rc.profile_score::NUMERIC,
    (rc.location_score + rc.engagement_score + rc.profile_score)::NUMERIC as total_score,
    rc.verified_qualification_count,
    rc.distance_miles
  FROM ranked_coaches rc
  ORDER BY 
    rc.is_sponsored DESC,
    rc.location_tier ASC,
    (rc.location_score + rc.engagement_score + rc.profile_score) DESC,
    rc.is_verified DESC,
    rc.display_name ASC
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches TO anon;
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches TO authenticated;