-- Drop ALL existing overloads of get_ranked_coaches
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT[], BOOLEAN, BOOLEAN, NUMERIC, NUMERIC);
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER);

-- Create single correct function with frontend-expected parameters
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
  location_lat NUMERIC,
  location_lng NUMERIC,
  experience_years INTEGER,
  gym_affiliation TEXT,
  is_verified BOOLEAN,
  online_available BOOLEAN,
  in_person_available BOOLEAN,
  instagram_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,
  linkedin_url TEXT,
  tiktok_url TEXT,
  x_url TEXT,
  threads_url TEXT,
  is_boosted BOOLEAN,
  location_score NUMERIC,
  engagement_score NUMERIC,
  profile_score NUMERIC,
  total_score NUMERIC,
  location_tier INTEGER,
  review_count BIGINT,
  average_rating NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_search_pattern TEXT;
BEGIN
  -- Prepare search pattern if search term provided
  IF p_search_term IS NOT NULL AND p_search_term != '' THEN
    v_search_pattern := '%' || LOWER(p_search_term) || '%';
  END IF;

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
      cb.is_active AS is_boosted
    FROM coach_boosts cb
    WHERE cb.is_active = TRUE
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
      cp.location_lat,
      cp.location_lng,
      cp.experience_years,
      cp.gym_affiliation,
      cp.is_verified,
      cp.online_available,
      cp.in_person_available,
      cp.instagram_url,
      cp.facebook_url,
      cp.youtube_url,
      cp.linkedin_url,
      cp.tiktok_url,
      cp.x_url,
      cp.threads_url,
      COALESCE(bs.is_boosted, FALSE) AS is_boosted,
      COALESCE(cs.review_count, 0) AS review_count,
      COALESCE(cs.average_rating, 0) AS average_rating,
      -- Location scoring (0-40 points)
      CASE
        WHEN p_user_city IS NOT NULL AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 40
        WHEN p_user_region IS NOT NULL AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 30
        WHEN p_user_country_code IS NOT NULL AND LOWER(cp.location_country_code) = LOWER(p_user_country_code) THEN 20
        ELSE 10
      END AS location_score,
      -- Location tier for display
      CASE
        WHEN p_user_city IS NOT NULL AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 1
        WHEN p_user_region IS NOT NULL AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 2
        WHEN p_user_country_code IS NOT NULL AND LOWER(cp.location_country_code) = LOWER(p_user_country_code) THEN 3
        ELSE 4
      END AS location_tier,
      -- Engagement scoring (0-35 points)
      LEAST(35, 
        (COALESCE(cs.review_count, 0) * 2) + 
        (COALESCE(cs.average_rating, 0) * 5)
      ) AS engagement_score,
      -- Profile completeness scoring (0-25 points)
      (
        CASE WHEN cp.bio IS NOT NULL AND cp.bio != '' THEN 5 ELSE 0 END +
        CASE WHEN cp.profile_image_url IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN cp.experience_years IS NOT NULL THEN 3 ELSE 0 END +
        CASE WHEN cp.hourly_rate IS NOT NULL THEN 3 ELSE 0 END +
        CASE WHEN cp.is_verified = TRUE THEN 5 ELSE 0 END +
        CASE WHEN cp.instagram_url IS NOT NULL OR cp.facebook_url IS NOT NULL THEN 2 ELSE 0 END +
        CASE WHEN cp.gym_affiliation IS NOT NULL THEN 2 ELSE 0 END
      ) AS profile_score
    FROM coach_profiles cp
    LEFT JOIN coach_stats cs ON cs.coach_id = cp.id
    LEFT JOIN boost_status bs ON bs.coach_id = cp.id
    WHERE 
      cp.marketplace_visible = TRUE
      AND cp.status = 'active'
      AND cp.onboarding_completed = TRUE
      -- STRICT country filter - NO online bypass
      AND (
        p_filter_country_code IS NULL 
        OR LOWER(cp.location_country_code) = LOWER(p_filter_country_code)
      )
      -- Coach type filter
      AND (
        p_coach_types IS NULL 
        OR cp.coach_types && p_coach_types
      )
      -- Price range filter
      AND (
        p_min_price IS NULL 
        OR cp.hourly_rate >= p_min_price
      )
      AND (
        p_max_price IS NULL 
        OR cp.hourly_rate <= p_max_price
      )
      -- Online/In-person filters
      AND (
        p_online_only = FALSE 
        OR cp.online_available = TRUE
      )
      AND (
        p_in_person_only = FALSE 
        OR cp.in_person_available = TRUE
      )
      -- Search term filter
      AND (
        v_search_pattern IS NULL
        OR LOWER(cp.display_name) LIKE v_search_pattern
        OR LOWER(cp.username) LIKE v_search_pattern
        OR LOWER(cp.bio) LIKE v_search_pattern
        OR LOWER(cp.location_city) LIKE v_search_pattern
        OR LOWER(cp.location_region) LIKE v_search_pattern
        OR LOWER(cp.gym_affiliation) LIKE v_search_pattern
      )
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
    rc.location_lat,
    rc.location_lng,
    rc.experience_years,
    rc.gym_affiliation,
    rc.is_verified,
    rc.online_available,
    rc.in_person_available,
    rc.instagram_url,
    rc.facebook_url,
    rc.youtube_url,
    rc.linkedin_url,
    rc.tiktok_url,
    rc.x_url,
    rc.threads_url,
    rc.is_boosted,
    rc.location_score,
    rc.engagement_score,
    rc.profile_score,
    (rc.location_score + rc.engagement_score + rc.profile_score) AS total_score,
    rc.location_tier,
    rc.review_count,
    rc.average_rating
  FROM ranked_coaches rc
  ORDER BY 
    rc.is_boosted DESC,
    (rc.location_score + rc.engagement_score + rc.profile_score) DESC,
    rc.review_count DESC
  LIMIT p_limit;
END;
$$;