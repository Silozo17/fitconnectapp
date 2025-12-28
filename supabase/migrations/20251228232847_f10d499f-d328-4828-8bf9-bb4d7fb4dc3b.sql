-- =============================================================================
-- COMPLETE FIX: get_ranked_coaches with proper NUMERIC casting
-- Issue: Function returned INTEGER for score columns but declared NUMERIC
-- =============================================================================

-- Drop the existing function with exact signature
DROP FUNCTION IF EXISTS public.get_ranked_coaches(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], 
  NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER
);

-- Create the corrected function with proper type casting
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
  p_limit INTEGER DEFAULT 20
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
  primary_coach_type TEXT,
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
  experience_years INTEGER,
  gym_affiliation TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,
  linkedin_url TEXT,
  tiktok_url TEXT,
  x_url TEXT,
  threads_url TEXT,
  review_count BIGINT,
  average_rating NUMERIC,
  location_tier INTEGER,
  location_score NUMERIC,
  engagement_score NUMERIC,
  profile_score NUMERIC,
  total_score NUMERIC,
  is_boosted BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH coach_stats AS (
    SELECT 
      r.coach_id,
      COUNT(r.id) AS review_count,
      COALESCE(AVG(r.rating), 0) AS average_rating
    FROM reviews r
    WHERE r.is_public = TRUE
    GROUP BY r.coach_id
  ),
  boost_status AS (
    SELECT 
      cb.coach_id,
      TRUE AS is_boosted
    FROM coach_boosts cb
    WHERE cb.is_active = TRUE
      AND cb.boost_start_date <= NOW()
      AND (cb.boost_end_date IS NULL OR cb.boost_end_date > NOW())
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
      cp.primary_coach_type,
      cp.hourly_rate,
      cp.currency,
      cp.location,
      cp.location_city,
      cp.location_region,
      cp.location_country,
      cp.location_country_code,
      cp.online_available,
      cp.in_person_available,
      cp.is_verified,
      cp.experience_years,
      cp.gym_affiliation,
      cp.instagram_url,
      cp.facebook_url,
      cp.youtube_url,
      cp.linkedin_url,
      cp.tiktok_url,
      cp.x_url,
      cp.threads_url,
      COALESCE(cs.review_count, 0) AS review_count,
      COALESCE(cs.average_rating, 0::NUMERIC) AS average_rating,
      -- Location tier (1=city, 2=region, 3=country, 4=online only)
      CASE
        WHEN p_user_city IS NOT NULL 
             AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 1
        WHEN p_user_region IS NOT NULL 
             AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 2
        WHEN p_user_country_code IS NOT NULL 
             AND LOWER(cp.location_country_code) = LOWER(p_user_country_code) THEN 3
        WHEN cp.online_available = TRUE THEN 4
        ELSE 5
      END AS location_tier,
      -- Location score (cast to NUMERIC to match return type)
      CASE
        WHEN p_user_city IS NOT NULL 
             AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 100::NUMERIC
        WHEN p_user_region IS NOT NULL 
             AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 70::NUMERIC
        WHEN p_user_country_code IS NOT NULL 
             AND LOWER(cp.location_country_code) = LOWER(p_user_country_code) THEN 40::NUMERIC
        WHEN cp.online_available = TRUE THEN 30::NUMERIC
        ELSE 0::NUMERIC
      END AS location_score,
      -- Engagement score (cast to NUMERIC)
      LEAST(100, (COALESCE(cs.review_count, 0) * 10) + (COALESCE(cs.average_rating, 0) * 10))::NUMERIC AS engagement_score,
      -- Profile score (cast to NUMERIC)
      (
        (CASE WHEN cp.bio IS NOT NULL AND LENGTH(cp.bio) > 50 THEN 20 ELSE 0 END) +
        (CASE WHEN cp.profile_image_url IS NOT NULL THEN 20 ELSE 0 END) +
        (CASE WHEN cp.card_image_url IS NOT NULL THEN 15 ELSE 0 END) +
        (CASE WHEN cp.hourly_rate IS NOT NULL THEN 15 ELSE 0 END) +
        (CASE WHEN cp.is_verified = TRUE THEN 15 ELSE 0 END) +
        (CASE WHEN cp.experience_years IS NOT NULL THEN 15 ELSE 0 END)
      )::NUMERIC AS profile_score,
      COALESCE(bs.is_boosted, FALSE) AS is_boosted
    FROM coach_profiles cp
    LEFT JOIN coach_stats cs ON cs.coach_id = cp.id
    LEFT JOIN boost_status bs ON bs.coach_id = cp.id
    WHERE 
      -- Must be visible in marketplace
      cp.marketplace_visible = TRUE
      -- Status: active or NULL (relaxed for legacy data)
      AND (cp.status IS NULL OR cp.status = 'active')
      -- Onboarding: completed or NULL (relaxed for legacy data)
      AND (cp.onboarding_completed = TRUE OR cp.onboarding_completed IS NULL)
      -- STRICT country filter: NO online bypass
      AND (
        p_filter_country_code IS NULL 
        OR LOWER(cp.location_country_code) = LOWER(p_filter_country_code)
      )
      -- Search term filter
      AND (
        p_search_term IS NULL 
        OR cp.display_name ILIKE '%' || p_search_term || '%'
        OR cp.bio ILIKE '%' || p_search_term || '%'
        OR cp.username ILIKE '%' || p_search_term || '%'
      )
      -- Coach type filter
      AND (
        p_coach_types IS NULL 
        OR cp.coach_types && p_coach_types
      )
      -- Price range filter
      AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
      AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
      -- Availability filters
      AND (p_online_only = FALSE OR cp.online_available = TRUE)
      AND (p_in_person_only = FALSE OR cp.in_person_available = TRUE)
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
    rc.primary_coach_type,
    rc.hourly_rate,
    rc.currency,
    rc.location,
    rc.location_city,
    rc.location_region,
    rc.location_country,
    rc.location_country_code,
    rc.online_available,
    rc.in_person_available,
    rc.is_verified,
    rc.experience_years,
    rc.gym_affiliation,
    rc.instagram_url,
    rc.facebook_url,
    rc.youtube_url,
    rc.linkedin_url,
    rc.tiktok_url,
    rc.x_url,
    rc.threads_url,
    rc.review_count,
    rc.average_rating,
    rc.location_tier,
    rc.location_score,
    rc.engagement_score,
    rc.profile_score,
    -- Total score (already NUMERIC from components)
    (rc.location_score * 0.5 + rc.engagement_score * 0.3 + rc.profile_score * 0.2)::NUMERIC AS total_score,
    rc.is_boosted
  FROM ranked_coaches rc
  ORDER BY 
    -- Boosted coaches first within their tier
    rc.location_tier ASC,
    rc.is_boosted DESC,
    (rc.location_score * 0.5 + rc.engagement_score * 0.3 + rc.profile_score * 0.2) DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], 
  NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER
) TO anon, authenticated;