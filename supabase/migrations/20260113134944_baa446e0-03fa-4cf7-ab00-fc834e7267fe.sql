-- =====================================================
-- CREATE: get_marketplace_coaches_v1
-- Two-layer deterministic ranking: Location buckets + Platform score
-- Does NOT modify get_simple_coaches (kept as fallback)
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_marketplace_coaches_v1(
  p_filter_country_code TEXT,
  p_search_term TEXT DEFAULT NULL,
  p_coach_types TEXT[] DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_online_only BOOLEAN DEFAULT FALSE,
  p_in_person_only BOOLEAN DEFAULT FALSE,
  p_user_lat NUMERIC DEFAULT NULL,
  p_user_lng NUMERIC DEFAULT NULL,
  p_user_city TEXT DEFAULT NULL,
  p_user_region TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  -- Core coach fields
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
  -- Aggregated fields
  avg_rating NUMERIC,
  review_count BIGINT,
  is_boosted BOOLEAN,
  verified_qualification_count BIGINT,
  -- Ranking fields (for transparency/debugging)
  location_bucket INTEGER,
  platform_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_country_upper TEXT;
  v_search_lower TEXT;
  v_user_city_lower TEXT;
  v_user_region_lower TEXT;
BEGIN
  -- Normalize inputs once
  v_country_upper := UPPER(TRIM(COALESCE(p_filter_country_code, '')));
  v_search_lower := LOWER(TRIM(COALESCE(p_search_term, '')));
  v_user_city_lower := LOWER(TRIM(COALESCE(p_user_city, '')));
  v_user_region_lower := LOWER(TRIM(COALESCE(p_user_region, '')));

  RETURN QUERY
  WITH coach_data AS (
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
      -- Reviews aggregation
      COALESCE(r.avg_rating, 0)::NUMERIC AS avg_rating,
      COALESCE(r.review_count, 0)::BIGINT AS review_count,
      -- Boost status
      COALESCE(cb.is_active AND NOW() >= cb.boost_start_date AND NOW() <= cb.boost_end_date, FALSE) AS is_boosted,
      -- Qualified count
      COALESCE(cq.qualified_count, 0)::BIGINT AS verified_qualification_count
    FROM coach_profiles cp
    -- LEFT JOIN for reviews aggregation
    LEFT JOIN LATERAL (
      SELECT 
        AVG(rv.rating)::NUMERIC AS avg_rating,
        COUNT(*)::BIGINT AS review_count
      FROM reviews rv
      WHERE rv.coach_id = cp.id AND rv.is_public = TRUE
    ) r ON TRUE
    -- LEFT JOIN for boost status
    LEFT JOIN coach_boosts cb ON cb.coach_id = cp.id
    -- LEFT JOIN for verified qualifications count
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::BIGINT AS qualified_count
      FROM coach_qualifications q
      WHERE q.coach_id = cp.id AND q.is_verified = TRUE
    ) cq ON TRUE
    WHERE
      -- Always applied filters
      cp.marketplace_visible = TRUE
      AND cp.onboarding_completed = TRUE
      AND (cp.status IS NULL OR cp.status = 'active')
      -- Country filter (STRICT - required)
      AND (
        v_country_upper = '' 
        OR UPPER(TRIM(COALESCE(cp.location_country_code, ''))) = v_country_upper
      )
      -- Search filter (optional)
      AND (
        v_search_lower = ''
        OR LOWER(COALESCE(cp.display_name, '')) ILIKE '%' || v_search_lower || '%'
        OR LOWER(COALESCE(cp.bio, '')) ILIKE '%' || v_search_lower || '%'
        OR LOWER(COALESCE(array_to_string(cp.coach_types, ' '), '')) ILIKE '%' || v_search_lower || '%'
      )
      -- Coach types filter (optional)
      AND (
        p_coach_types IS NULL 
        OR cardinality(p_coach_types) = 0
        OR cp.coach_types && p_coach_types
      )
      -- Price range filter (optional)
      AND (
        p_min_price IS NULL 
        OR cp.hourly_rate >= p_min_price
      )
      AND (
        p_max_price IS NULL 
        OR cp.hourly_rate <= p_max_price
      )
      -- Online only filter
      AND (
        COALESCE(p_online_only, FALSE) = FALSE
        OR cp.online_available = TRUE
      )
      -- In-person only filter
      AND (
        COALESCE(p_in_person_only, FALSE) = FALSE
        OR cp.in_person_available = TRUE
      )
  ),
  ranked_coaches AS (
    SELECT
      cd.*,
      -- LAYER 1: Location Bucket (higher = better match)
      CASE
        -- If user provides lat/lng, use distance-based buckets
        WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL AND cd.location_lat IS NOT NULL AND cd.location_lng IS NOT NULL THEN
          CASE
            -- Distance in miles using Haversine approximation
            WHEN (
              3959 * acos(
                LEAST(1, GREATEST(-1,
                  cos(radians(p_user_lat)) * cos(radians(cd.location_lat)) * 
                  cos(radians(cd.location_lng) - radians(p_user_lng)) + 
                  sin(radians(p_user_lat)) * sin(radians(cd.location_lat))
                ))
              )
            ) <= 5 THEN 5   -- Within 5 miles
            WHEN (
              3959 * acos(
                LEAST(1, GREATEST(-1,
                  cos(radians(p_user_lat)) * cos(radians(cd.location_lat)) * 
                  cos(radians(cd.location_lng) - radians(p_user_lng)) + 
                  sin(radians(p_user_lat)) * sin(radians(cd.location_lat))
                ))
              )
            ) <= 15 THEN 4  -- Within 15 miles
            WHEN (
              3959 * acos(
                LEAST(1, GREATEST(-1,
                  cos(radians(p_user_lat)) * cos(radians(cd.location_lat)) * 
                  cos(radians(cd.location_lng) - radians(p_user_lng)) + 
                  sin(radians(p_user_lat)) * sin(radians(cd.location_lat))
                ))
              )
            ) <= 50 THEN 3  -- Within 50 miles
            ELSE 2          -- Same country but far
          END
        -- Fallback: City match
        WHEN v_user_city_lower != '' AND LOWER(COALESCE(cd.location_city, '')) = v_user_city_lower THEN 4
        -- Fallback: Region match
        WHEN v_user_region_lower != '' AND LOWER(COALESCE(cd.location_region, '')) = v_user_region_lower THEN 3
        -- Default: Country match (baseline)
        WHEN cd.in_person_available = TRUE THEN 2
        -- Online-only coaches get lower priority
        WHEN cd.online_available = TRUE AND cd.in_person_available = FALSE THEN 1
        ELSE 2
      END AS location_bucket,
      
      -- LAYER 2: Platform Score (0-100 scale)
      (
        -- Trust & Legitimacy (max 30 points)
        CASE WHEN cd.is_verified = TRUE THEN 15 ELSE 0 END +
        LEAST(cd.verified_qualification_count * 5, 15) +
        -- Profile Quality (max 35 points)
        CASE WHEN cd.bio IS NOT NULL AND LENGTH(cd.bio) > 10 THEN 7 ELSE 0 END +
        CASE WHEN cd.profile_image_url IS NOT NULL THEN 7 ELSE 0 END +
        CASE WHEN cd.hourly_rate IS NOT NULL AND cd.hourly_rate > 0 THEN 5 ELSE 0 END +
        CASE WHEN cd.card_image_url IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN cd.coach_types IS NOT NULL AND cardinality(cd.coach_types) > 0 THEN 5 ELSE 0 END +
        CASE WHEN cd.experience_years IS NOT NULL AND cd.experience_years > 0 THEN 3 ELSE 0 END +
        CASE WHEN cd.gym_affiliation IS NOT NULL AND LENGTH(cd.gym_affiliation) > 0 THEN 3 ELSE 0 END +
        -- Market Feedback (max 35 points)
        LEAST(COALESCE(cd.avg_rating, 0) * 5, 25) +
        LEAST(LN(COALESCE(cd.review_count, 0) + 1) * 3, 10)
      )::NUMERIC AS platform_score
    FROM coach_data cd
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
  -- MANDATORY ORDER BY - NO EXCEPTIONS
  ORDER BY
    rc.location_bucket DESC,      -- Layer 1: User-visible location priority
    rc.is_boosted DESC,           -- Layer 2: Boosted coaches first within bucket
    rc.platform_score DESC,       -- Layer 2: Quality score
    rc.review_count DESC,         -- Tie-breaker: More reviews
    rc.created_at DESC,           -- Tie-breaker: Newer coaches
    rc.id ASC                     -- Final deterministic tie-breaker
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_marketplace_coaches_v1(TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, NUMERIC, NUMERIC, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_marketplace_coaches_v1(TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, NUMERIC, NUMERIC, TEXT, TEXT, INTEGER, INTEGER) TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_marketplace_coaches_v1 IS 'Marketplace coach listing with two-layer deterministic ranking: Location buckets (user-visible) + Platform score (internal quality). Does NOT replace get_simple_coaches which remains as fallback.';