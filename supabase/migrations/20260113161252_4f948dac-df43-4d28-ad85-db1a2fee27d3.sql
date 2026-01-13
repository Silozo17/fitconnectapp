-- Create get_base_marketplace_coaches_v1 function
-- Used for default marketplace view (no filters, no city, Best Match OFF)
-- Features:
--   1. Top 5 boosted coaches with HOURLY rotation (deterministic)
--   2. Non-boosted coaches sorted by quality metrics
--   3. Optional minimum rating filter

CREATE OR REPLACE FUNCTION public.get_base_marketplace_coaches_v1(
  p_country_code TEXT DEFAULT NULL,
  p_min_rating NUMERIC DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
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
  avg_rating NUMERIC,
  review_count BIGINT,
  is_sponsored BOOLEAN,
  verified_qualification_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hour_bucket BIGINT;
BEGIN
  -- Calculate hourly bucket for deterministic rotation
  -- This changes once per hour, ensuring stable order within the hour
  v_hour_bucket := FLOOR(EXTRACT(EPOCH FROM NOW()) / 3600);
  
  RETURN QUERY
  WITH coach_base AS (
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
      cp.is_complete_profile,
      COALESCE(r.avg_rating, 0::NUMERIC) AS avg_rating,
      COALESCE(r.review_count, 0::BIGINT) AS review_count,
      COALESCE(
        cb.is_active = TRUE 
        AND cb.payment_status = 'paid'
        AND NOW() >= cb.boost_start_date 
        AND NOW() <= cb.boost_end_date, 
        FALSE
      ) AS is_sponsored,
      COALESCE(cq.qualified_count, 0::BIGINT) AS verified_qualification_count
    FROM coach_profiles cp
    LEFT JOIN LATERAL (
      SELECT 
        AVG(rv.rating)::NUMERIC AS avg_rating,
        COUNT(*)::BIGINT AS review_count
      FROM reviews rv
      WHERE rv.coach_id = cp.id AND rv.is_public = TRUE
    ) r ON TRUE
    LEFT JOIN coach_boosts cb ON cb.coach_id = cp.id
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::BIGINT AS qualified_count
      FROM coach_qualifications q
      WHERE q.coach_id = cp.id AND q.is_verified = TRUE
    ) cq ON TRUE
    WHERE
      -- Base visibility
      cp.marketplace_visible = TRUE
      AND cp.onboarding_completed = TRUE
      AND (cp.status IS NULL OR cp.status = 'active')
      -- Country filter
      AND (
        p_country_code IS NULL 
        OR UPPER(TRIM(cp.location_country_code)) = UPPER(TRIM(p_country_code))
      )
      -- Rating filter (only when p_min_rating is set)
      AND (
        p_min_rating IS NULL
        OR COALESCE(r.avg_rating, 0) >= p_min_rating
      )
  ),
  boosted_coaches AS (
    -- Get boosted coaches with hourly rotation
    SELECT 
      cb2.*,
      -- Create rotation order based on hour bucket using coach id hash
      ROW_NUMBER() OVER (
        ORDER BY 
          (abs(('x' || substring(cb2.id::TEXT, 1, 8))::bit(32)::int) + v_hour_bucket) % 1000,
          cb2.created_at DESC
      ) AS rotation_rank
    FROM coach_base cb2
    WHERE cb2.is_sponsored = TRUE
  ),
  top_boosted AS (
    SELECT * FROM boosted_coaches WHERE rotation_rank <= 5
  ),
  non_boosted_coaches AS (
    -- Non-boosted coaches sorted by quality
    SELECT 
      cb3.*,
      ROW_NUMBER() OVER (
        ORDER BY 
          -- 1. Profile completeness (verified + qualified + complete profile)
          (
            CASE WHEN cb3.is_verified = TRUE THEN 3 ELSE 0 END +
            CASE WHEN cb3.verified_qualification_count > 0 THEN 3 ELSE 0 END +
            CASE WHEN cb3.is_complete_profile = TRUE THEN 2 ELSE 0 END +
            CASE WHEN cb3.bio IS NOT NULL AND LENGTH(cb3.bio) > 50 THEN 1 ELSE 0 END +
            CASE WHEN cb3.profile_image_url IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN cb3.card_image_url IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN cb3.hourly_rate IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN cb3.coach_types IS NOT NULL AND array_length(cb3.coach_types, 1) > 0 THEN 1 ELSE 0 END +
            CASE WHEN cb3.online_available = TRUE OR cb3.in_person_available = TRUE THEN 1 ELSE 0 END
          ) DESC,
          -- 2. Rating (weighted: high rating + high review count)
          (cb3.avg_rating * LEAST(cb3.review_count, 10) / 10.0) DESC,
          -- 3. Newer coaches slightly favoured
          cb3.created_at DESC,
          -- 4. Final deterministic tie-breaker
          cb3.id
      ) AS quality_rank
    FROM coach_base cb3
    WHERE cb3.is_sponsored = FALSE
  ),
  combined AS (
    -- Boosted coaches (sort_order 0 for priority)
    SELECT
      tb.id, tb.username, tb.display_name, tb.profile_image_url,
      tb.location_country, tb.location_country_code, tb.created_at,
      tb.bio, tb.coach_types, tb.hourly_rate, tb.currency,
      tb.online_available, tb.in_person_available, tb.location,
      tb.location_city, tb.location_region, tb.card_image_url,
      tb.is_verified, tb.verified_at, tb.gym_affiliation,
      tb.avg_rating, tb.review_count, tb.is_sponsored, tb.verified_qualification_count,
      0 AS sort_section,
      tb.rotation_rank AS sort_rank
    FROM top_boosted tb
    
    UNION ALL
    
    -- Non-boosted coaches (sort_order 1 for after boosted)
    SELECT
      nbc.id, nbc.username, nbc.display_name, nbc.profile_image_url,
      nbc.location_country, nbc.location_country_code, nbc.created_at,
      nbc.bio, nbc.coach_types, nbc.hourly_rate, nbc.currency,
      nbc.online_available, nbc.in_person_available, nbc.location,
      nbc.location_city, nbc.location_region, nbc.card_image_url,
      nbc.is_verified, nbc.verified_at, nbc.gym_affiliation,
      nbc.avg_rating, nbc.review_count, nbc.is_sponsored, nbc.verified_qualification_count,
      1 AS sort_section,
      nbc.quality_rank AS sort_rank
    FROM non_boosted_coaches nbc
  )
  SELECT
    c.id, c.username, c.display_name, c.profile_image_url,
    c.location_country, c.location_country_code, c.created_at,
    c.bio, c.coach_types, c.hourly_rate, c.currency,
    c.online_available, c.in_person_available, c.location,
    c.location_city, c.location_region, c.card_image_url,
    c.is_verified, c.verified_at, c.gym_affiliation,
    c.avg_rating, c.review_count, c.is_sponsored, c.verified_qualification_count
  FROM combined c
  ORDER BY c.sort_section, c.sort_rank
  LIMIT p_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_base_marketplace_coaches_v1 TO anon, authenticated;