-- Fix get_filtered_coaches_v1: When city is provided, don't also require region match
-- This fixes the bug where Coach Russ (region: "England") was excluded when filtering
-- by "High Wycombe" because Google Places returned region: "Buckinghamshire"

CREATE OR REPLACE FUNCTION public.get_filtered_coaches_v1(
  p_country_code TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_coach_types TEXT[] DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_online_only BOOLEAN DEFAULT FALSE,
  p_in_person_only BOOLEAN DEFAULT FALSE,
  p_verified_only BOOLEAN DEFAULT FALSE,
  p_qualified_only BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
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
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
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
    COALESCE(r.avg_rating, 0::NUMERIC) AS avg_rating,
    COALESCE(r.review_count, 0::BIGINT) AS review_count,
    COALESCE(cb.is_active AND NOW() >= cb.boost_start_date AND NOW() <= cb.boost_end_date, FALSE) AS is_sponsored,
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
    -- Base visibility (ALWAYS applied)
    cp.marketplace_visible = TRUE
    AND cp.onboarding_completed = TRUE
    AND (cp.status IS NULL OR cp.status = 'active')
    
    -- Country filter (STRICT)
    AND (
      p_country_code IS NULL 
      OR UPPER(TRIM(cp.location_country_code)) = UPPER(TRIM(p_country_code))
    )
    
    -- City filter (case-insensitive, trimmed)
    -- When city is provided, match by city ONLY - don't require region match
    AND (
      p_city IS NULL
      OR LOWER(TRIM(cp.location_city)) = LOWER(TRIM(p_city))
    )
    
    -- Region filter: ONLY applied when NO city is provided
    -- This fixes the bug where region mismatch excluded valid city matches
    AND (
      p_city IS NOT NULL  -- Skip region check when city is set
      OR p_region IS NULL
      OR LOWER(TRIM(cp.location_region)) = LOWER(TRIM(p_region))
    )
    
    -- Specialities filter (coach_types)
    AND (
      p_coach_types IS NULL
      OR cp.coach_types && p_coach_types
    )
    
    -- Price filter (handles NULL hourly_rate correctly)
    AND (
      (p_min_price IS NULL AND p_max_price IS NULL)
      OR (
        cp.hourly_rate IS NOT NULL
        AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
        AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
      )
    )
    
    -- Availability filter
    AND (
      (p_online_only = FALSE AND p_in_person_only = FALSE)
      OR (p_online_only = TRUE AND cp.online_available = TRUE)
      OR (p_in_person_only = TRUE AND cp.in_person_available = TRUE)
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
        SELECT 1 FROM coach_qualifications cqf
        WHERE cqf.coach_id = cp.id AND cqf.is_verified = TRUE
      )
    )
    
  -- ORDER BY: Preserve existing order, NO ranking
  ORDER BY cp.created_at DESC
  LIMIT p_limit;
END;
$$;