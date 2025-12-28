-- Drop the existing function
DROP FUNCTION IF EXISTS get_ranked_coaches(TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT[], BOOLEAN, BOOLEAN, NUMERIC, NUMERIC);

-- Recreate with correct reviews table reference
CREATE OR REPLACE FUNCTION get_ranked_coaches(
  p_user_city TEXT DEFAULT NULL,
  p_user_region TEXT DEFAULT NULL,
  p_filter_country_code TEXT DEFAULT NULL,
  p_user_lat NUMERIC DEFAULT NULL,
  p_user_lng NUMERIC DEFAULT NULL,
  p_coach_types TEXT[] DEFAULT NULL,
  p_online_only BOOLEAN DEFAULT FALSE,
  p_in_person_only BOOLEAN DEFAULT FALSE,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL
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
  location TEXT,
  location_city TEXT,
  location_region TEXT,
  location_country TEXT,
  location_country_code TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  hourly_rate NUMERIC,
  currency TEXT,
  experience_years INTEGER,
  is_verified BOOLEAN,
  online_available BOOLEAN,
  in_person_available BOOLEAN,
  gym_affiliation TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,
  linkedin_url TEXT,
  tiktok_url TEXT,
  threads_url TEXT,
  x_url TEXT,
  review_count BIGINT,
  average_rating NUMERIC,
  location_tier INTEGER,
  distance_km NUMERIC,
  ranking_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
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
      cp.location,
      cp.location_city,
      cp.location_region,
      cp.location_country,
      cp.location_country_code,
      cp.location_lat,
      cp.location_lng,
      cp.hourly_rate,
      cp.currency,
      cp.experience_years,
      cp.is_verified,
      cp.online_available,
      cp.in_person_available,
      cp.gym_affiliation,
      cp.instagram_url,
      cp.facebook_url,
      cp.youtube_url,
      cp.linkedin_url,
      cp.tiktok_url,
      cp.threads_url,
      cp.x_url,
      COALESCE(cs.review_count, 0) AS review_count,
      COALESCE(cs.average_rating, 0) AS average_rating,
      -- Location tier calculation
      CASE 
        WHEN p_user_city IS NOT NULL AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 1
        WHEN p_user_region IS NOT NULL AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 2
        WHEN p_filter_country_code IS NOT NULL AND LOWER(cp.location_country_code) = LOWER(p_filter_country_code) THEN 3
        ELSE 4
      END AS location_tier,
      -- Distance calculation (if coordinates provided)
      CASE 
        WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL 
             AND cp.location_lat IS NOT NULL AND cp.location_lng IS NOT NULL THEN
          (6371 * acos(
            cos(radians(p_user_lat)) * cos(radians(cp.location_lat)) *
            cos(radians(cp.location_lng) - radians(p_user_lng)) +
            sin(radians(p_user_lat)) * sin(radians(cp.location_lat))
          ))
        ELSE NULL
      END AS distance_km
    FROM coach_profiles cp
    LEFT JOIN coach_stats cs ON cs.coach_id = cp.id
    WHERE 
      cp.marketplace_visible = TRUE
      AND cp.status = 'active'
      AND cp.onboarding_completed = TRUE
      -- STRICT country filter - no bypass for online coaches
      AND (
        p_filter_country_code IS NULL 
        OR LOWER(cp.location_country_code) = LOWER(p_filter_country_code)
      )
      -- Coach type filter
      AND (
        p_coach_types IS NULL 
        OR cp.coach_types && p_coach_types
      )
      -- Online/in-person filters
      AND (
        NOT p_online_only OR cp.online_available = TRUE
      )
      AND (
        NOT p_in_person_only OR cp.in_person_available = TRUE
      )
      -- Price filters
      AND (
        p_min_price IS NULL OR cp.hourly_rate >= p_min_price
      )
      AND (
        p_max_price IS NULL OR cp.hourly_rate <= p_max_price
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
    rc.location,
    rc.location_city,
    rc.location_region,
    rc.location_country,
    rc.location_country_code,
    rc.location_lat,
    rc.location_lng,
    rc.hourly_rate,
    rc.currency,
    rc.experience_years,
    rc.is_verified,
    rc.online_available,
    rc.in_person_available,
    rc.gym_affiliation,
    rc.instagram_url,
    rc.facebook_url,
    rc.youtube_url,
    rc.linkedin_url,
    rc.tiktok_url,
    rc.threads_url,
    rc.x_url,
    rc.review_count,
    rc.average_rating,
    rc.location_tier,
    rc.distance_km,
    -- Ranking score: prioritize location tier, then verified, then reviews
    (
      (5 - rc.location_tier) * 100 +
      CASE WHEN rc.is_verified THEN 50 ELSE 0 END +
      LEAST(rc.review_count, 10) * 2 +
      rc.average_rating * 5 +
      CASE WHEN rc.distance_km IS NOT NULL THEN GREATEST(0, 50 - rc.distance_km) ELSE 0 END
    )::NUMERIC AS ranking_score
  FROM ranked_coaches rc
  ORDER BY 
    rc.location_tier ASC,
    ranking_score DESC,
    rc.review_count DESC;
END;
$$;