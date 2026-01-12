-- Drop any existing overloaded versions of get_ranked_coaches
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT[], BOOLEAN, BOOLEAN, NUMERIC, NUMERIC, BOOLEAN, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT[], BOOLEAN, BOOLEAN, NUMERIC, NUMERIC, BOOLEAN, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.get_ranked_coaches();

-- Fix coach ranking: Location proximity must always take priority over boost status
-- Boosted coaches should only be prioritized WITHIN their location tier, not globally

CREATE OR REPLACE FUNCTION public.get_ranked_coaches(
  p_user_city TEXT DEFAULT NULL,
  p_user_region TEXT DEFAULT NULL,
  p_user_country TEXT DEFAULT NULL,
  p_user_country_code TEXT DEFAULT NULL,
  p_coach_types TEXT[] DEFAULT NULL,
  p_offers_online BOOLEAN DEFAULT NULL,
  p_offers_in_person BOOLEAN DEFAULT NULL,
  p_min_rating NUMERIC DEFAULT NULL,
  p_max_hourly_rate NUMERIC DEFAULT NULL,
  p_is_verified BOOLEAN DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  profile_image_url TEXT,
  card_image_url TEXT,
  coach_types TEXT[],
  hourly_rate NUMERIC,
  currency TEXT,
  location TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  country_code TEXT,
  certifications JSONB,
  is_verified BOOLEAN,
  offers_online BOOLEAN,
  offers_in_person BOOLEAN,
  created_at TIMESTAMPTZ,
  visibility_score NUMERIC,
  location_tier INTEGER,
  is_sponsored BOOLEAN,
  avg_rating NUMERIC,
  review_count BIGINT,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_count BIGINT;
  v_user_country_upper TEXT;
BEGIN
  -- Normalize country code to uppercase for comparison
  v_user_country_upper := UPPER(COALESCE(p_user_country_code, ''));
  
  -- First, get the total count of matching coaches
  SELECT COUNT(*)
  INTO v_total_count
  FROM public.coach_profiles cp
  WHERE cp.status = 'active'
    AND cp.onboarding_completed = true
    AND (p_coach_types IS NULL OR cp.coach_types && p_coach_types)
    AND (p_offers_online IS NULL OR cp.offers_online = p_offers_online)
    AND (p_offers_in_person IS NULL OR cp.offers_in_person = p_offers_in_person)
    AND (p_max_hourly_rate IS NULL OR cp.hourly_rate <= p_max_hourly_rate)
    AND (p_is_verified IS NULL OR cp.is_verified = p_is_verified)
    -- Country filtering: only show coaches from user's country (or online-only coaches)
    AND (
      v_user_country_upper = '' 
      OR UPPER(COALESCE(cp.country_code, '')) = v_user_country_upper
      OR (cp.offers_online = true AND cp.offers_in_person = false)
    );
  
  -- Return the ranked coaches with all required data
  RETURN QUERY
  WITH coach_reviews AS (
    SELECT 
      r.coach_id,
      AVG(r.rating)::NUMERIC AS avg_rating,
      COUNT(*)::BIGINT AS review_count
    FROM public.reviews r
    GROUP BY r.coach_id
  ),
  active_boosts AS (
    SELECT DISTINCT cb.coach_id
    FROM public.coach_boosts cb
    WHERE cb.status = 'active'
      AND cb.starts_at <= NOW()
      AND cb.expires_at > NOW()
  ),
  ranked_coaches AS (
    SELECT 
      cp.id,
      cp.user_id,
      cp.username,
      cp.first_name,
      cp.last_name,
      cp.bio,
      cp.profile_image_url,
      cp.card_image_url,
      cp.coach_types,
      cp.hourly_rate,
      cp.currency,
      cp.location,
      cp.city,
      cp.region,
      cp.country,
      cp.country_code,
      cp.certifications,
      cp.is_verified,
      cp.offers_online,
      cp.offers_in_person,
      cp.created_at,
      -- Calculate visibility score
      (
        -- Base score from profile completeness
        CASE WHEN cp.bio IS NOT NULL AND LENGTH(cp.bio) > 50 THEN 10 ELSE 0 END +
        CASE WHEN cp.profile_image_url IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN cp.card_image_url IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN cp.certifications IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN cp.is_verified = true THEN 15 ELSE 0 END +
        -- Review score (up to 30 points)
        LEAST(COALESCE(cr.avg_rating, 0) * 6, 30) +
        -- Review count bonus (up to 10 points)
        LEAST(COALESCE(cr.review_count, 0) * 2, 10) +
        -- Boost bonus (adds to score within tier, but doesn't change tier)
        CASE WHEN ab.coach_id IS NOT NULL THEN 50 ELSE 0 END
      )::NUMERIC AS visibility_score,
      -- Location tier for sorting (higher = better match)
      CASE 
        -- Exact city match (highest priority)
        WHEN p_user_city IS NOT NULL 
             AND LOWER(COALESCE(cp.city, '')) = LOWER(p_user_city) 
        THEN 1000
        -- Same region/county match
        WHEN p_user_region IS NOT NULL 
             AND LOWER(COALESCE(cp.region, '')) = LOWER(p_user_region) 
        THEN 700
        -- Same country match
        WHEN v_user_country_upper != '' 
             AND UPPER(COALESCE(cp.country_code, '')) = v_user_country_upper 
        THEN 400
        -- Online-only coaches (available to everyone)
        WHEN cp.offers_online = true AND cp.offers_in_person = false 
        THEN 300
        -- Fallback
        ELSE 100
      END AS location_tier,
      -- Is this coach currently boosted?
      (ab.coach_id IS NOT NULL) AS is_sponsored,
      COALESCE(cr.avg_rating, 0) AS avg_rating,
      COALESCE(cr.review_count, 0) AS review_count
    FROM public.coach_profiles cp
    LEFT JOIN coach_reviews cr ON cr.coach_id = cp.id
    LEFT JOIN active_boosts ab ON ab.coach_id = cp.id
    WHERE cp.status = 'active'
      AND cp.onboarding_completed = true
      AND (p_coach_types IS NULL OR cp.coach_types && p_coach_types)
      AND (p_offers_online IS NULL OR cp.offers_online = p_offers_online)
      AND (p_offers_in_person IS NULL OR cp.offers_in_person = p_offers_in_person)
      AND (p_max_hourly_rate IS NULL OR cp.hourly_rate <= p_max_hourly_rate)
      AND (p_is_verified IS NULL OR cp.is_verified = p_is_verified)
      AND (p_min_rating IS NULL OR COALESCE(cr.avg_rating, 0) >= p_min_rating)
      -- Country filtering
      AND (
        v_user_country_upper = '' 
        OR UPPER(COALESCE(cp.country_code, '')) = v_user_country_upper
        OR (cp.offers_online = true AND cp.offers_in_person = false)
      )
  )
  SELECT 
    rc.id,
    rc.user_id,
    rc.username,
    rc.first_name,
    rc.last_name,
    rc.bio,
    rc.profile_image_url,
    rc.card_image_url,
    rc.coach_types,
    rc.hourly_rate,
    rc.currency,
    rc.location,
    rc.city,
    rc.region,
    rc.country,
    rc.country_code,
    rc.certifications,
    rc.is_verified,
    rc.offers_online,
    rc.offers_in_person,
    rc.created_at,
    rc.visibility_score,
    rc.location_tier,
    rc.is_sponsored,
    rc.avg_rating,
    rc.review_count,
    v_total_count AS total_count
  FROM ranked_coaches rc
  -- FIXED: Location tier FIRST, then boost within tier, then visibility score
  ORDER BY 
    rc.location_tier DESC,      -- 1. Location proximity is ALWAYS primary
    rc.is_sponsored DESC,       -- 2. Boosted coaches prioritized WITHIN same tier
    rc.visibility_score DESC,   -- 3. Profile quality and engagement
    rc.created_at DESC          -- 4. Newer coaches as tiebreaker
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Ensure permissions are set
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT[], BOOLEAN, BOOLEAN, NUMERIC, NUMERIC, BOOLEAN, INTEGER, INTEGER) TO anon, authenticated;