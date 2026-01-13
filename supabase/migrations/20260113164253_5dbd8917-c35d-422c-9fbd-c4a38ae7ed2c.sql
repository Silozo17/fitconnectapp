-- ============================================================
-- THREE-LAYER MARKETPLACE FUNCTION: get_marketplace_coaches_v2
-- ============================================================
-- LAYER A: Eligibility (Filtering) - who is visible
-- LAYER B: Relevance Buckets (Grouping) - where they appear
-- LAYER C: Ordering (Within Bucket) - how they're sorted
--
-- CRITICAL RULES:
-- 1. Online-only coaches ALWAYS bucket 2 (never city/region buckets)
-- 2. Location filters NEVER exclude online-only coaches
-- 3. Boost NEVER jumps buckets
-- 4. Ordering is deterministic (no flicker)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_marketplace_coaches_v2(
  -- Country filter (always applied)
  p_country_code TEXT DEFAULT NULL,
  -- Location context (for bucket assignment, NOT filtering)
  p_city TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_user_lat NUMERIC DEFAULT NULL,
  p_user_lng NUMERIC DEFAULT NULL,
  -- Availability filters (LAYER A)
  p_online_only BOOLEAN DEFAULT FALSE,
  p_in_person_only BOOLEAN DEFAULT FALSE,
  -- Other filters
  p_coach_types TEXT[] DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_verified_only BOOLEAN DEFAULT FALSE,
  p_qualified_only BOOLEAN DEFAULT FALSE,
  p_min_rating NUMERIC DEFAULT NULL,
  -- Pagination
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  profile_image_url TEXT,
  card_image_url TEXT,
  bio TEXT,
  coach_types TEXT[],
  hourly_rate NUMERIC,
  currency TEXT,
  location TEXT,
  location_city TEXT,
  location_region TEXT,
  location_country TEXT,
  location_country_code TEXT,
  online_available BOOLEAN,
  in_person_available BOOLEAN,
  is_verified BOOLEAN,
  verified_at TIMESTAMPTZ,
  gym_affiliation TEXT,
  created_at TIMESTAMPTZ,
  avg_rating NUMERIC,
  review_count BIGINT,
  verified_qualification_count BIGINT,
  is_sponsored BOOLEAN,
  relevance_bucket INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hour_bucket BIGINT;
  v_has_location BOOLEAN;
BEGIN
  -- Calculate hourly bucket for deterministic boost rotation
  v_hour_bucket := FLOOR(EXTRACT(EPOCH FROM NOW()) / 3600);
  
  -- Determine if we have location context
  v_has_location := (p_city IS NOT NULL OR p_region IS NOT NULL OR (p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL));
  
  RETURN QUERY
  WITH coach_base AS (
    -- ============================================
    -- LAYER A: ELIGIBILITY (Base visibility + filters)
    -- ============================================
    SELECT
      cp.id,
      cp.username,
      cp.display_name,
      cp.profile_image_url,
      cp.card_image_url,
      cp.bio,
      cp.coach_types,
      cp.hourly_rate,
      cp.currency,
      cp.location,
      cp.location_city,
      cp.location_region,
      cp.location_country,
      cp.location_country_code,
      cp.location_lat,
      cp.location_lng,
      cp.online_available,
      cp.in_person_available,
      cp.is_verified,
      cp.verified_at,
      cp.gym_affiliation,
      cp.experience_years,
      cp.booking_mode,
      cp.created_at,
      cp.is_complete_profile,
      -- Helper flags for bucket logic
      (cp.in_person_available = TRUE) AS is_in_person_capable,
      (cp.online_available = TRUE AND cp.in_person_available = FALSE) AS is_online_only
    FROM coach_profiles cp
    WHERE
      -- Base visibility (ALWAYS applied)
      cp.marketplace_visible = TRUE
      AND cp.onboarding_completed = TRUE
      AND (cp.status IS NULL OR cp.status = 'active')
      
      -- Country filter (STRICT)
      AND (
        p_country_code IS NULL 
        OR UPPER(TRIM(cp.location_country_code)) = UPPER(TRIM(p_country_code))
      )
      
      -- ============================================
      -- AVAILABILITY FILTER (LAYER A - Critical Logic)
      -- ============================================
      -- If no filter selected: include ALL coaches
      -- If in_person_only: exclude coaches where in_person_available = false
      -- If online_only: exclude coaches where online_available = false  
      -- If both selected: include ALL coaches (union)
      AND (
        -- No availability filter = include all
        (p_online_only = FALSE AND p_in_person_only = FALSE)
        -- Both selected = include all (union of both)
        OR (p_online_only = TRUE AND p_in_person_only = TRUE)
        -- Online only filter = must be online available
        OR (p_online_only = TRUE AND p_in_person_only = FALSE AND cp.online_available = TRUE)
        -- In-person only filter = must be in-person available
        OR (p_in_person_only = TRUE AND p_online_only = FALSE AND cp.in_person_available = TRUE)
      )
      
      -- ⚠️ CRITICAL: Location filters NEVER exclude online-only coaches
      -- City/region filters only apply to in-person capable coaches
      AND (
        -- Online-only coaches are NEVER excluded by location
        (cp.online_available = TRUE AND cp.in_person_available = FALSE)
        -- No city filter = include all
        OR p_city IS NULL
        -- City matches for in-person capable
        OR LOWER(TRIM(cp.location_city)) = LOWER(TRIM(p_city))
      )
      
      -- Specialities filter
      AND (
        p_coach_types IS NULL
        OR cp.coach_types && p_coach_types
      )
      
      -- Price filter
      AND (
        (p_min_price IS NULL AND p_max_price IS NULL)
        OR (
          cp.hourly_rate IS NOT NULL
          AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
          AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
        )
      )
      
      -- Verified filter
      AND (
        p_verified_only = FALSE
        OR cp.is_verified = TRUE
      )
      
      -- Qualified filter
      AND (
        p_qualified_only = FALSE
        OR EXISTS (
          SELECT 1 FROM coach_qualifications cq
          WHERE cq.coach_id = cp.id AND cq.is_verified = TRUE
        )
      )
  ),
  
  coach_with_aggregates AS (
    SELECT
      cb.*,
      COALESCE(r.avg_rating, 0::NUMERIC) AS avg_rating,
      COALESCE(r.review_count, 0::BIGINT) AS review_count,
      COALESCE(cq.qualified_count, 0::BIGINT) AS verified_qualification_count,
      COALESCE(
        boost.is_active = TRUE 
        AND boost.payment_status = 'paid'
        AND NOW() >= boost.boost_start_date 
        AND NOW() <= boost.boost_end_date, 
        FALSE
      ) AS is_sponsored
    FROM coach_base cb
    LEFT JOIN LATERAL (
      SELECT 
        AVG(rv.rating)::NUMERIC AS avg_rating,
        COUNT(*)::BIGINT AS review_count
      FROM reviews rv
      WHERE rv.coach_id = cb.id AND rv.is_public = TRUE
    ) r ON TRUE
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::BIGINT AS qualified_count
      FROM coach_qualifications q
      WHERE q.coach_id = cb.id AND q.is_verified = TRUE
    ) cq ON TRUE
    LEFT JOIN coach_boosts boost ON boost.coach_id = cb.id
  ),
  
  coach_with_rating_filter AS (
    -- Apply rating filter after aggregates are computed
    SELECT * FROM coach_with_aggregates cwa
    WHERE (
      p_min_rating IS NULL
      OR cwa.avg_rating >= p_min_rating
    )
  ),
  
  coach_with_buckets AS (
    -- ============================================
    -- LAYER B: RELEVANCE BUCKETS
    -- ============================================
    SELECT
      cwrf.*,
      CASE
        -- ⚠️ ONLINE-ONLY COACHES: ALWAYS BUCKET 2 (never city/region buckets)
        WHEN cwrf.is_online_only = TRUE THEN 2
        
        -- IN-PERSON OR HYBRID coaches get location-based buckets
        WHEN cwrf.is_in_person_capable = TRUE THEN
          CASE
            -- Same city (text match OR GPS within 8km/5mi)
            WHEN p_city IS NOT NULL AND LOWER(TRIM(cwrf.location_city)) = LOWER(TRIM(p_city)) THEN 5
            WHEN (
              p_user_lat IS NOT NULL 
              AND p_user_lng IS NOT NULL 
              AND cwrf.location_lat IS NOT NULL 
              AND cwrf.location_lng IS NOT NULL
              AND (
                6371 * ACOS(
                  LEAST(1.0, GREATEST(-1.0,
                    COS(RADIANS(p_user_lat)) * COS(RADIANS(cwrf.location_lat)) *
                    COS(RADIANS(cwrf.location_lng) - RADIANS(p_user_lng)) +
                    SIN(RADIANS(p_user_lat)) * SIN(RADIANS(cwrf.location_lat))
                  ))
                )
              ) <= 8.05
            ) THEN 5
            -- Same region
            WHEN p_region IS NOT NULL AND LOWER(TRIM(cwrf.location_region)) = LOWER(TRIM(p_region)) THEN 4
            -- In-person elsewhere
            ELSE 3
          END
        
        -- Fallback
        ELSE 1
      END AS relevance_bucket
    FROM coach_with_rating_filter cwrf
  ),
  
  coach_with_ordering AS (
    -- ============================================
    -- LAYER C: ORDERING (Within Bucket)
    -- ============================================
    SELECT
      cwb.*,
      -- Profile completeness score (max ~15 points)
      (
        CASE WHEN cwb.is_verified = TRUE THEN 3 ELSE 0 END +
        CASE WHEN cwb.verified_qualification_count > 0 THEN 3 ELSE 0 END +
        CASE WHEN cwb.is_complete_profile = TRUE THEN 2 ELSE 0 END +
        CASE WHEN cwb.bio IS NOT NULL AND LENGTH(cwb.bio) > 50 THEN 1 ELSE 0 END +
        CASE WHEN cwb.profile_image_url IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN cwb.card_image_url IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN cwb.hourly_rate IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN cwb.coach_types IS NOT NULL AND array_length(cwb.coach_types, 1) > 0 THEN 1 ELSE 0 END +
        CASE WHEN cwb.online_available = TRUE OR cwb.in_person_available = TRUE THEN 1 ELSE 0 END +
        CASE WHEN cwb.experience_years IS NOT NULL AND cwb.experience_years > 0 THEN 1 ELSE 0 END
      ) AS completeness_score,
      
      -- Bayesian weighted rating (capped influence)
      -- Formula: (avg_rating * review_count + prior_mean * prior_weight) / (review_count + prior_weight)
      -- prior_mean = 3.5 (neutral), prior_weight = 5 (reviews needed to overcome prior)
      (
        (cwb.avg_rating * LEAST(cwb.review_count, 50) + 3.5 * 5) / (LEAST(cwb.review_count, 50) + 5)
      ) AS bayesian_rating,
      
      -- Boost rotation rank (within bucket, hourly)
      CASE 
        WHEN cwb.is_sponsored = TRUE THEN
          (abs(('x' || substring(cwb.id::TEXT, 1, 8))::bit(32)::int) + v_hour_bucket) % 1000
        ELSE 999999
      END AS boost_rotation_rank
      
    FROM coach_with_buckets cwb
  )
  
  -- Final ordered result
  SELECT
    cwo.id,
    cwo.username,
    cwo.display_name,
    cwo.profile_image_url,
    cwo.card_image_url,
    cwo.bio,
    cwo.coach_types,
    cwo.hourly_rate,
    cwo.currency,
    cwo.location,
    cwo.location_city,
    cwo.location_region,
    cwo.location_country,
    cwo.location_country_code,
    cwo.online_available,
    cwo.in_person_available,
    cwo.is_verified,
    cwo.verified_at,
    cwo.gym_affiliation,
    cwo.created_at,
    cwo.avg_rating,
    cwo.review_count,
    cwo.verified_qualification_count,
    cwo.is_sponsored,
    cwo.relevance_bucket
  FROM coach_with_ordering cwo
  ORDER BY
    -- 1. Relevance bucket (higher = more relevant)
    cwo.relevance_bucket DESC,
    -- 2. Featured/boosted first WITHIN bucket (hourly rotation)
    cwo.is_sponsored DESC,
    cwo.boost_rotation_rank ASC,
    -- 3. Bayesian weighted rating (capped influence)
    cwo.bayesian_rating DESC,
    -- 4. Profile completeness
    cwo.completeness_score DESC,
    -- 5. Verified status
    (CASE WHEN cwo.is_verified = TRUE THEN 0 ELSE 1 END),
    -- 6. Qualified status
    (CASE WHEN cwo.verified_qualification_count > 0 THEN 0 ELSE 1 END),
    -- 7. Deterministic fallback (created_at DESC, id ASC)
    cwo.created_at DESC,
    cwo.id ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_marketplace_coaches_v2 TO anon, authenticated;

-- Add documentation
COMMENT ON FUNCTION public.get_marketplace_coaches_v2 IS 
'Three-layer marketplace function implementing:
LAYER A (Eligibility): Filtering - determines who is visible
LAYER B (Relevance): Buckets - determines grouping (5=city, 4=region, 3=in-person, 2=online-only, 1=other)
LAYER C (Ordering): Within bucket sorting - boost rotation, rating, completeness, verification

CRITICAL RULES:
- Online-only coaches ALWAYS bucket 2 (never enter city/region buckets)
- Location filters NEVER exclude online-only coaches  
- Boost NEVER jumps buckets
- Ordering is fully deterministic (no random, no flicker)';