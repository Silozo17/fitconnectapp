-- ⚠️ STABILITY LOCK
-- get_simple_coaches and get_filtered_coaches_v1 must NOT be modified.
-- They provide visibility baseline and filtering only.
-- This new function handles ranking SEPARATELY.

-- ============================================================
-- NEW RANKING FUNCTION: get_ranked_coaches_v1
-- ============================================================
-- STATUS: CREATED BUT NOT CONNECTED TO FRONTEND
-- PURPOSE: Prepare ranking logic for future activation
-- RULES:
--   - Ranking is internal (platform_score is NOT exposed to users)
--   - Location bucket determines visible grouping
--   - Boost ONLY reorders within same location bucket
--   - Order is 100% deterministic - NO random()
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_ranked_coaches_v1(
  p_country_code TEXT,
  p_city TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_user_lat NUMERIC DEFAULT NULL,
  p_user_lng NUMERIC DEFAULT NULL,
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
  location_lat NUMERIC,
  location_lng NUMERIC,
  online_available BOOLEAN,
  in_person_available BOOLEAN,
  is_verified BOOLEAN,
  verified_at TIMESTAMPTZ,
  gym_affiliation TEXT,
  created_at TIMESTAMPTZ,
  -- Aggregated fields
  avg_rating NUMERIC,
  review_count INTEGER,
  verified_qualification_count INTEGER,
  -- Boost status
  is_sponsored BOOLEAN,
  -- Ranking fields (internal use)
  location_bucket INTEGER,
  platform_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_lat NUMERIC := p_user_lat;
  v_user_lng NUMERIC := p_user_lng;
BEGIN
  RETURN QUERY
  WITH coach_base AS (
    -- Step 1: Base dataset with visibility filters
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
      cp.created_at
    FROM coach_profiles cp
    WHERE cp.marketplace_visible = TRUE
      AND cp.onboarding_completed = TRUE
      AND (cp.status IS NULL OR cp.status = 'active')
      -- STRICT country match
      AND (
        p_country_code IS NULL
        OR UPPER(cp.location_country_code) = UPPER(p_country_code)
      )
  ),
  
  coach_with_aggregates AS (
    -- Add review aggregates and qualification count
    SELECT
      cb.*,
      COALESCE(
        (SELECT AVG(cr.rating)::NUMERIC(3,2) 
         FROM coach_reviews cr 
         WHERE cr.coach_id = cb.id),
        0
      ) AS avg_rating,
      COALESCE(
        (SELECT COUNT(*)::INTEGER 
         FROM coach_reviews cr 
         WHERE cr.coach_id = cb.id),
        0
      ) AS review_count,
      COALESCE(
        (SELECT COUNT(*)::INTEGER 
         FROM coach_qualifications cq 
         WHERE cq.coach_id = cb.id AND cq.is_verified = TRUE),
        0
      ) AS verified_qualification_count,
      -- Check if currently boosted
      EXISTS (
        SELECT 1 FROM coach_boosts boost
        WHERE boost.coach_id = cb.id
          AND boost.is_active = TRUE
          AND boost.expires_at > NOW()
      ) AS is_sponsored
    FROM coach_base cb
  ),
  
  coach_with_location_bucket AS (
    -- Step 2: Compute location bucket
    SELECT
      cwa.*,
      CASE
        -- Bucket 5: Same city OR within 5 miles (if coords available)
        WHEN (
          p_city IS NOT NULL 
          AND LOWER(cwa.location_city) = LOWER(p_city)
        ) THEN 5
        WHEN (
          v_user_lat IS NOT NULL 
          AND v_user_lng IS NOT NULL 
          AND cwa.location_lat IS NOT NULL 
          AND cwa.location_lng IS NOT NULL
          -- Haversine approximation: ~5 miles = 0.08 degrees at typical latitudes
          AND (
            6371 * ACOS(
              LEAST(1.0, GREATEST(-1.0,
                COS(RADIANS(v_user_lat)) * COS(RADIANS(cwa.location_lat)) *
                COS(RADIANS(cwa.location_lng) - RADIANS(v_user_lng)) +
                SIN(RADIANS(v_user_lat)) * SIN(RADIANS(cwa.location_lat))
              ))
            )
          ) <= 8.05  -- 5 miles in km
        ) THEN 5
        -- Bucket 4: Same region
        WHEN (
          p_region IS NOT NULL 
          AND LOWER(cwa.location_region) = LOWER(p_region)
        ) THEN 4
        -- Bucket 3: Same country (already filtered)
        WHEN p_country_code IS NOT NULL THEN 3
        -- Bucket 2: Online-only coaches
        WHEN cwa.online_available = TRUE AND cwa.in_person_available = FALSE THEN 2
        -- Bucket 1: Everything else
        ELSE 1
      END AS location_bucket
    FROM coach_with_aggregates cwa
  ),
  
  coach_with_score AS (
    -- Step 3: Compute platform score (0-100)
    SELECT
      cwlb.*,
      (
        -- TRUST (30 max)
        (CASE WHEN cwlb.is_verified = TRUE THEN 15 ELSE 0 END) +
        (LEAST(cwlb.verified_qualification_count * 5, 15)) +
        
        -- PROFILE QUALITY (30 max)
        (CASE WHEN cwlb.bio IS NOT NULL AND LENGTH(cwlb.bio) > 10 THEN 6 ELSE 0 END) +
        (CASE WHEN cwlb.profile_image_url IS NOT NULL THEN 6 ELSE 0 END) +
        (CASE WHEN cwlb.hourly_rate IS NOT NULL THEN 5 ELSE 0 END) +
        (CASE WHEN cwlb.coach_types IS NOT NULL AND array_length(cwlb.coach_types, 1) > 0 THEN 5 ELSE 0 END) +
        (CASE WHEN cwlb.experience_years IS NOT NULL AND cwlb.experience_years > 0 THEN 4 ELSE 0 END) +
        (CASE WHEN cwlb.booking_mode IS NOT NULL THEN 4 ELSE 0 END) +
        
        -- MARKET FEEDBACK (40 max)
        LEAST(cwlb.avg_rating * 6, 30) +
        LEAST(LN(cwlb.review_count + 1) * 3, 10)
      )::NUMERIC(5,2) AS platform_score
    FROM coach_with_location_bucket cwlb
  )
  
  -- Final query with deterministic ordering
  SELECT
    cws.id,
    cws.username,
    cws.display_name,
    cws.profile_image_url,
    cws.card_image_url,
    cws.bio,
    cws.coach_types,
    cws.hourly_rate,
    cws.currency,
    cws.location,
    cws.location_city,
    cws.location_region,
    cws.location_country,
    cws.location_country_code,
    cws.location_lat,
    cws.location_lng,
    cws.online_available,
    cws.in_person_available,
    cws.is_verified,
    cws.verified_at,
    cws.gym_affiliation,
    cws.created_at,
    cws.avg_rating,
    cws.review_count,
    cws.verified_qualification_count,
    cws.is_sponsored,
    cws.location_bucket,
    cws.platform_score
  FROM coach_with_score cws
  -- Step 4: Deterministic ordering
  -- Location bucket defines grouping (user-visible relevance)
  -- Boost only reorders WITHIN same bucket
  -- Platform score is internal tiebreaker
  ORDER BY
    cws.location_bucket DESC,
    cws.is_sponsored DESC,
    cws.platform_score DESC,
    cws.created_at DESC,
    cws.id ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Add function comment for documentation
COMMENT ON FUNCTION public.get_ranked_coaches_v1 IS 
'⚠️ STABILITY LOCK: This function is PREPARED but NOT YET CONNECTED to frontend.
Ranking function for marketplace coaches.
- Location bucket determines visible grouping (5=same city, 4=same region, 3=same country, 2=online-only, 1=other)
- Boost ONLY reorders within same location bucket
- Platform score is internal and NOT exposed to users
- Order is 100% deterministic (no random)
DO NOT USE THIS FUNCTION until explicitly enabled.';