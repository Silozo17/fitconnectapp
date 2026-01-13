-- Fix: Correct column name from is_visible to is_public
-- The reviews table uses is_public, not is_visible

DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER, DOUBLE PRECISION, DOUBLE PRECISION);

CREATE FUNCTION public.get_ranked_coaches(
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
  p_user_lat DOUBLE PRECISION DEFAULT NULL,
  p_user_lng DOUBLE PRECISION DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  bio TEXT,
  coach_types TEXT[],
  certifications JSONB,
  experience_years INTEGER,
  hourly_rate NUMERIC,
  currency TEXT,
  location TEXT,
  location_city TEXT,
  location_region TEXT,
  location_country TEXT,
  location_country_code TEXT,
  online_available BOOLEAN,
  in_person_available BOOLEAN,
  profile_image_url TEXT,
  card_image_url TEXT,
  booking_mode TEXT,
  is_verified BOOLEAN,
  verified_at TIMESTAMPTZ,
  gym_affiliation TEXT,
  marketplace_visible BOOLEAN,
  selected_avatar_id UUID,
  created_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN,
  who_i_work_with TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  x_url TEXT,
  threads_url TEXT,
  linkedin_url TEXT,
  youtube_url TEXT,
  avatar_slug TEXT,
  avatar_rarity TEXT,
  is_sponsored BOOLEAN,
  visibility_score INTEGER,
  location_tier INTEGER,
  review_count BIGINT,
  avg_rating NUMERIC,
  verified_qualification_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized_user_city TEXT;
  v_normalized_user_region TEXT;
  v_upper_country_code TEXT;
  v_upper_filter_country_code TEXT;
BEGIN
  v_normalized_user_city := LOWER(TRIM(p_user_city));
  v_normalized_user_region := LOWER(TRIM(p_user_region));
  v_upper_country_code := UPPER(TRIM(p_user_country_code));
  v_upper_filter_country_code := UPPER(TRIM(p_filter_country_code));

  RETURN QUERY
  WITH coach_reviews AS (
    SELECT 
      r.coach_id,
      COUNT(*)::BIGINT as review_count,
      ROUND(AVG(r.rating)::NUMERIC, 1) as avg_rating
    FROM reviews r
    WHERE r.is_public = true
    GROUP BY r.coach_id
  ),
  coach_qualifications AS (
    SELECT 
      cq.coach_id,
      COUNT(*)::BIGINT as verified_count
    FROM coach_qualifications cq
    WHERE cq.verification_status = 'verified'
    GROUP BY cq.coach_id
  ),
  active_boosts AS (
    SELECT DISTINCT cb.coach_id
    FROM coach_boosts cb
    WHERE cb.is_active = true 
      AND cb.starts_at <= NOW() 
      AND cb.expires_at > NOW()
  ),
  ranked_coaches AS (
    SELECT
      cp.id,
      cp.username,
      cp.display_name,
      cp.bio,
      cp.coach_types,
      cp.certifications,
      cp.experience_years,
      cp.hourly_rate,
      cp.currency,
      cp.location,
      cp.location_city,
      cp.location_region,
      cp.location_country,
      cp.location_country_code,
      cp.online_available,
      cp.in_person_available,
      cp.profile_image_url,
      cp.card_image_url,
      cp.booking_mode,
      cp.is_verified,
      cp.verified_at,
      cp.gym_affiliation,
      cp.marketplace_visible,
      cp.selected_avatar_id,
      cp.created_at,
      cp.onboarding_completed,
      cp.who_i_work_with,
      cp.facebook_url,
      cp.instagram_url,
      cp.tiktok_url,
      cp.x_url,
      cp.threads_url,
      cp.linkedin_url,
      cp.youtube_url,
      a.slug as avatar_slug,
      a.rarity as avatar_rarity,
      (ab.coach_id IS NOT NULL) as is_sponsored,
      CASE
        WHEN v_normalized_user_city IS NOT NULL 
             AND LOWER(TRIM(cp.location_city)) = v_normalized_user_city THEN 1000
        WHEN v_normalized_user_region IS NOT NULL 
             AND LOWER(TRIM(cp.location_region)) = v_normalized_user_region THEN 700
        WHEN v_upper_country_code IS NOT NULL 
             AND UPPER(cp.location_country_code) = v_upper_country_code THEN 400
        WHEN cp.online_available = true THEN 300
        ELSE 100
      END as location_tier,
      (
        CASE WHEN cp.is_verified THEN 30 ELSE 0 END +
        CASE WHEN cp.profile_image_url IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN cp.bio IS NOT NULL AND LENGTH(cp.bio) > 50 THEN 10 ELSE 0 END +
        CASE WHEN COALESCE(cr.review_count, 0) > 0 THEN 20 ELSE 0 END +
        CASE WHEN COALESCE(cr.avg_rating, 0) >= 4.5 THEN 15 ELSE 0 END +
        CASE WHEN COALESCE(cq.verified_count, 0) > 0 THEN 15 ELSE 0 END +
        CASE WHEN ab.coach_id IS NOT NULL THEN 50 ELSE 0 END
      )::INTEGER as visibility_score,
      COALESCE(cr.review_count, 0) as review_count,
      cr.avg_rating,
      COALESCE(cq.verified_count, 0) as verified_qualification_count
    FROM coach_profiles cp
    LEFT JOIN avatars a ON cp.selected_avatar_id = a.id
    LEFT JOIN coach_reviews cr ON cp.id = cr.coach_id
    LEFT JOIN coach_qualifications cq ON cp.id = cq.coach_id
    LEFT JOIN active_boosts ab ON cp.id = ab.coach_id
    WHERE 
      cp.marketplace_visible = true
      AND cp.onboarding_completed = true
      AND (
        v_upper_filter_country_code IS NULL 
        OR UPPER(cp.location_country_code) = v_upper_filter_country_code
        OR cp.online_available = true
      )
      AND (
        p_search_term IS NULL 
        OR cp.display_name ILIKE '%' || p_search_term || '%'
        OR cp.bio ILIKE '%' || p_search_term || '%'
        OR cp.location_city ILIKE '%' || p_search_term || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(cp.coach_types) ct WHERE ct ILIKE '%' || p_search_term || '%'
        )
      )
      AND (
        p_coach_types IS NULL 
        OR cp.coach_types && p_coach_types
      )
      AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
      AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
      AND (NOT p_online_only OR cp.online_available = true)
      AND (NOT p_in_person_only OR cp.in_person_available = true)
  )
  SELECT 
    rc.id,
    rc.username,
    rc.display_name,
    rc.bio,
    rc.coach_types,
    rc.certifications,
    rc.experience_years,
    rc.hourly_rate,
    rc.currency,
    rc.location,
    rc.location_city,
    rc.location_region,
    rc.location_country,
    rc.location_country_code,
    rc.online_available,
    rc.in_person_available,
    rc.profile_image_url,
    rc.card_image_url,
    rc.booking_mode,
    rc.is_verified,
    rc.verified_at,
    rc.gym_affiliation,
    rc.marketplace_visible,
    rc.selected_avatar_id,
    rc.created_at,
    rc.onboarding_completed,
    rc.who_i_work_with,
    rc.facebook_url,
    rc.instagram_url,
    rc.tiktok_url,
    rc.x_url,
    rc.threads_url,
    rc.linkedin_url,
    rc.youtube_url,
    rc.avatar_slug,
    rc.avatar_rarity,
    rc.is_sponsored,
    rc.visibility_score,
    rc.location_tier,
    rc.review_count,
    rc.avg_rating,
    rc.verified_qualification_count
  FROM ranked_coaches rc
  ORDER BY 
    rc.location_tier DESC,
    rc.is_sponsored DESC,
    rc.visibility_score DESC,
    rc.created_at DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER, DOUBLE PRECISION, DOUBLE PRECISION) TO anon, authenticated;