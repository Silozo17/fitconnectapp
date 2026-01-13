-- Drop existing function (all overloads) and recreate with new parameters
DROP FUNCTION IF EXISTS public.get_marketplace_coaches_v1(TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, NUMERIC, NUMERIC, TEXT, TEXT, INTEGER, INTEGER);

-- Now create the updated function with verified/qualified filters
CREATE OR REPLACE FUNCTION public.get_marketplace_coaches_v1(
  p_filter_country_code TEXT,
  p_search_term TEXT DEFAULT NULL,
  p_coach_types TEXT[] DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_online_only BOOLEAN DEFAULT FALSE,
  p_in_person_only BOOLEAN DEFAULT FALSE,
  p_verified_only BOOLEAN DEFAULT FALSE,
  p_qualified_only BOOLEAN DEFAULT FALSE,
  p_user_lat NUMERIC DEFAULT NULL,
  p_user_lng NUMERIC DEFAULT NULL,
  p_user_city TEXT DEFAULT NULL,
  p_user_region TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  profile_image_url TEXT,
  location_country TEXT,
  location_country_code TEXT,
  created_at TIMESTAMPTZ,
  bio TEXT,
  coach_types TEXT[],
  hourly_rate NUMERIC,
  currency TEXT,
  online_available BOOLEAN,
  in_person_available BOOLEAN,
  location TEXT,
  location_city TEXT,
  location_region TEXT,
  card_image_url TEXT,
  is_verified BOOLEAN,
  verified_at TIMESTAMPTZ,
  gym_affiliation TEXT,
  experience_years INTEGER,
  avg_rating NUMERIC,
  review_count BIGINT,
  is_boosted BOOLEAN,
  verified_qualification_count BIGINT,
  location_bucket INTEGER,
  platform_score NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH coach_reviews AS (
    SELECT 
      r.coach_id,
      AVG(r.rating)::NUMERIC AS avg_rating,
      COUNT(*)::BIGINT AS review_count
    FROM reviews r
    WHERE r.is_public = TRUE
    GROUP BY r.coach_id
  ),
  coach_boosts AS (
    SELECT 
      cb.coach_id,
      TRUE AS is_boosted
    FROM coach_boosts cb
    WHERE cb.is_active = TRUE
      AND cb.start_date <= NOW()
      AND cb.end_date >= NOW()
  ),
  coach_quals AS (
    SELECT 
      cq.coach_id,
      COUNT(*)::BIGINT AS verified_count
    FROM coach_qualifications cq
    WHERE cq.is_verified = TRUE
    GROUP BY cq.coach_id
  ),
  filtered_coaches AS (
    SELECT 
      cp.id,
      cp.username,
      cp.display_name,
      cp.profile_image_url,
      cp.location_country,
      cp.location_country_code,
      cp.created_at,
      cp.bio,
      cp.coach_types,
      cp.hourly_rate,
      cp.currency,
      cp.online_available,
      cp.in_person_available,
      cp.location,
      cp.location_city,
      cp.location_region,
      cp.card_image_url,
      cp.is_verified,
      cp.verified_at,
      cp.gym_affiliation,
      cp.experience_years,
      cp.location_lat,
      cp.location_lng,
      COALESCE(cr.avg_rating, 0) AS avg_rating,
      COALESCE(cr.review_count, 0) AS review_count,
      COALESCE(cbs.is_boosted, FALSE) AS is_boosted,
      COALESCE(cq.verified_count, 0) AS verified_qualification_count
    FROM coach_profiles cp
    LEFT JOIN coach_reviews cr ON cr.coach_id = cp.id
    LEFT JOIN coach_boosts cbs ON cbs.coach_id = cp.id
    LEFT JOIN coach_quals cq ON cq.coach_id = cp.id
    WHERE 
      cp.marketplace_visible = TRUE
      AND cp.onboarding_completed = TRUE
      AND (cp.status IS NULL OR cp.status = 'active')
      AND (
        p_filter_country_code IS NULL 
        OR UPPER(TRIM(cp.location_country_code)) = UPPER(TRIM(p_filter_country_code))
      )
      AND (
        p_search_term IS NULL
        OR LOWER(cp.display_name) LIKE '%' || LOWER(p_search_term) || '%'
        OR LOWER(cp.bio) LIKE '%' || LOWER(p_search_term) || '%'
        OR LOWER(cp.coach_types::TEXT) LIKE '%' || LOWER(p_search_term) || '%'
      )
      AND (
        p_coach_types IS NULL
        OR cp.coach_types && p_coach_types
      )
      AND (
        (p_min_price IS NULL AND p_max_price IS NULL)
        OR (
          cp.hourly_rate IS NOT NULL
          AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
          AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
        )
      )
      AND (
        CASE
          WHEN COALESCE(p_online_only, FALSE) = FALSE 
               AND COALESCE(p_in_person_only, FALSE) = FALSE 
          THEN TRUE
          WHEN COALESCE(p_online_only, FALSE) = TRUE 
               AND COALESCE(p_in_person_only, FALSE) = FALSE 
          THEN cp.online_available = TRUE
          WHEN COALESCE(p_online_only, FALSE) = FALSE 
               AND COALESCE(p_in_person_only, FALSE) = TRUE 
          THEN cp.in_person_available = TRUE
          WHEN COALESCE(p_online_only, FALSE) = TRUE 
               AND COALESCE(p_in_person_only, FALSE) = TRUE 
          THEN (cp.online_available = TRUE OR cp.in_person_available = TRUE)
          ELSE TRUE
        END
      )
      AND (
        COALESCE(p_verified_only, FALSE) = FALSE
        OR cp.is_verified = TRUE
      )
      AND (
        COALESCE(p_qualified_only, FALSE) = FALSE
        OR COALESCE(cq.verified_count, 0) > 0
      )
  ),
  ranked_coaches AS (
    SELECT 
      fc.*,
      CASE
        WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL 
             AND fc.location_lat IS NOT NULL AND fc.location_lng IS NOT NULL THEN
          CASE
            WHEN (
              3959 * ACOS(
                LEAST(1, GREATEST(-1,
                  COS(RADIANS(p_user_lat)) * COS(RADIANS(fc.location_lat)) *
                  COS(RADIANS(fc.location_lng) - RADIANS(p_user_lng)) +
                  SIN(RADIANS(p_user_lat)) * SIN(RADIANS(fc.location_lat))
                ))
              )
            ) <= 5 THEN 5
            WHEN (
              3959 * ACOS(
                LEAST(1, GREATEST(-1,
                  COS(RADIANS(p_user_lat)) * COS(RADIANS(fc.location_lat)) *
                  COS(RADIANS(fc.location_lng) - RADIANS(p_user_lng)) +
                  SIN(RADIANS(p_user_lat)) * SIN(RADIANS(fc.location_lat))
                ))
              )
            ) <= 15 THEN 4
            WHEN (
              3959 * ACOS(
                LEAST(1, GREATEST(-1,
                  COS(RADIANS(p_user_lat)) * COS(RADIANS(fc.location_lat)) *
                  COS(RADIANS(fc.location_lng) - RADIANS(p_user_lng)) +
                  SIN(RADIANS(p_user_lat)) * SIN(RADIANS(fc.location_lat))
                ))
              )
            ) <= 50 THEN 3
            ELSE 2
          END
        WHEN p_user_city IS NOT NULL 
             AND LOWER(TRIM(fc.location_city)) = LOWER(TRIM(p_user_city)) THEN 4
        WHEN p_user_region IS NOT NULL 
             AND LOWER(TRIM(fc.location_region)) = LOWER(TRIM(p_user_region)) THEN 3
        WHEN fc.online_available = TRUE AND fc.in_person_available = FALSE THEN 1
        ELSE 2
      END AS location_bucket,
      (
        CASE WHEN fc.is_verified = TRUE THEN 15 ELSE 0 END +
        LEAST(fc.verified_qualification_count * 5, 15) +
        CASE WHEN fc.bio IS NOT NULL AND LENGTH(fc.bio) > 20 THEN 7 ELSE 0 END +
        CASE WHEN fc.profile_image_url IS NOT NULL THEN 7 ELSE 0 END +
        CASE WHEN fc.hourly_rate IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN fc.card_image_url IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN fc.coach_types IS NOT NULL AND ARRAY_LENGTH(fc.coach_types, 1) > 0 THEN 5 ELSE 0 END +
        CASE WHEN fc.experience_years IS NOT NULL THEN 3 ELSE 0 END +
        CASE WHEN fc.gym_affiliation IS NOT NULL THEN 3 ELSE 0 END +
        LEAST(COALESCE(fc.avg_rating, 0) * 5, 25) +
        LEAST(LN(COALESCE(fc.review_count, 0) + 1) * 3, 10)
      )::NUMERIC AS platform_score
    FROM filtered_coaches fc
  )
  SELECT 
    rc.id,
    rc.username,
    rc.display_name,
    rc.profile_image_url,
    rc.location_country,
    rc.location_country_code,
    rc.created_at,
    rc.bio,
    rc.coach_types,
    rc.hourly_rate,
    rc.currency,
    rc.online_available,
    rc.in_person_available,
    rc.location,
    rc.location_city,
    rc.location_region,
    rc.card_image_url,
    rc.is_verified,
    rc.verified_at,
    rc.gym_affiliation,
    rc.experience_years,
    rc.avg_rating,
    rc.review_count,
    rc.is_boosted,
    rc.verified_qualification_count,
    rc.location_bucket,
    rc.platform_score
  FROM ranked_coaches rc
  ORDER BY
    rc.location_bucket DESC,
    rc.is_boosted DESC,
    rc.platform_score DESC,
    rc.review_count DESC,
    rc.created_at DESC,
    rc.id ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_marketplace_coaches_v1(TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, NUMERIC, NUMERIC, TEXT, TEXT, INTEGER, INTEGER) TO anon, authenticated;