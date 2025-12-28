-- First drop ALL overloads of the function by specifying the full signature
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT[], BOOLEAN, BOOLEAN, NUMERIC, NUMERIC, BOOLEAN, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, INTEGER, INTEGER);

-- Now recreate the function with strict country filtering (no online_available bypass)
CREATE OR REPLACE FUNCTION public.get_ranked_coaches(
  p_filter_coach_types TEXT[] DEFAULT NULL,
  p_filter_online BOOLEAN DEFAULT NULL,
  p_filter_in_person BOOLEAN DEFAULT NULL,
  p_filter_min_price NUMERIC DEFAULT NULL,
  p_filter_max_price NUMERIC DEFAULT NULL,
  p_filter_verified BOOLEAN DEFAULT NULL,
  p_filter_country_code TEXT DEFAULT NULL,
  p_filter_city TEXT DEFAULT NULL,
  p_user_lat DOUBLE PRECISION DEFAULT NULL,
  p_user_lng DOUBLE PRECISION DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
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
  location_country TEXT,
  location_country_code TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  experience_years INTEGER,
  is_verified BOOLEAN,
  online_available BOOLEAN,
  in_person_available BOOLEAN,
  gym_affiliation TEXT,
  instagram_url TEXT,
  created_at TIMESTAMPTZ,
  average_rating NUMERIC,
  total_reviews BIGINT,
  total_clients BIGINT,
  is_boosted BOOLEAN,
  distance_km DOUBLE PRECISION,
  rank_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH coach_reviews AS (
    SELECT 
      r.coach_id,
      COALESCE(AVG(r.rating), 0) AS avg_rating,
      COUNT(r.id) AS review_count
    FROM reviews r
    WHERE r.is_public = TRUE
    GROUP BY r.coach_id
  ),
  coach_client_counts AS (
    SELECT 
      cc.coach_id,
      COUNT(DISTINCT cc.client_id) AS client_count
    FROM coach_clients cc
    WHERE cc.status = 'active'
    GROUP BY cc.coach_id
  ),
  active_boosts AS (
    SELECT 
      cb.coach_id,
      TRUE AS has_active_boost
    FROM coach_boosts cb
    WHERE cb.is_active = TRUE
      AND cb.boost_start_date <= NOW()
      AND cb.boost_end_date >= NOW()
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
      cp.location_country,
      cp.location_country_code,
      cp.location_lat,
      cp.location_lng,
      cp.experience_years,
      cp.is_verified,
      cp.online_available,
      cp.in_person_available,
      cp.gym_affiliation,
      cp.instagram_url,
      cp.created_at,
      COALESCE(cr.avg_rating, 0) AS average_rating,
      COALESCE(cr.review_count, 0) AS total_reviews,
      COALESCE(ccc.client_count, 0) AS total_clients,
      COALESCE(ab.has_active_boost, FALSE) AS is_boosted,
      CASE 
        WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL 
             AND cp.location_lat IS NOT NULL AND cp.location_lng IS NOT NULL THEN
          (6371 * acos(
            cos(radians(p_user_lat)) * cos(radians(cp.location_lat)) *
            cos(radians(cp.location_lng) - radians(p_user_lng)) +
            sin(radians(p_user_lat)) * sin(radians(cp.location_lat))
          ))
        ELSE NULL
      END AS distance_km,
      (
        CASE WHEN COALESCE(ab.has_active_boost, FALSE) THEN 1000 ELSE 0 END +
        (COALESCE(cr.avg_rating, 0) * 10) +
        (LEAST(LOG(COALESCE(cr.review_count, 0) + 1) * 10, 30)) +
        (LEAST(LOG(COALESCE(ccc.client_count, 0) + 1) * 10, 20)) +
        CASE WHEN cp.is_verified THEN 10 ELSE 0 END +
        CASE WHEN cp.bio IS NOT NULL AND cp.profile_image_url IS NOT NULL THEN 5 ELSE 0 END +
        CASE 
          WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL 
               AND cp.location_lat IS NOT NULL AND cp.location_lng IS NOT NULL THEN
            -LEAST((6371 * acos(
              cos(radians(p_user_lat)) * cos(radians(cp.location_lat)) *
              cos(radians(cp.location_lng) - radians(p_user_lng)) +
              sin(radians(p_user_lat)) * sin(radians(cp.location_lat))
            )) / 10, 50)
          ELSE 0
        END
      ) AS rank_score
    FROM coach_profiles cp
    LEFT JOIN coach_reviews cr ON cr.coach_id = cp.id
    LEFT JOIN coach_client_counts ccc ON ccc.coach_id = cp.id
    LEFT JOIN active_boosts ab ON ab.coach_id = cp.id
    WHERE 
      cp.marketplace_visible = TRUE
      AND cp.status = 'active'
      AND (p_filter_coach_types IS NULL OR cp.coach_types && p_filter_coach_types)
      AND (p_filter_online IS NULL OR cp.online_available = p_filter_online)
      AND (p_filter_in_person IS NULL OR cp.in_person_available = p_filter_in_person)
      AND (p_filter_min_price IS NULL OR cp.hourly_rate >= p_filter_min_price)
      AND (p_filter_max_price IS NULL OR cp.hourly_rate <= p_filter_max_price)
      AND (p_filter_verified IS NULL OR cp.is_verified = p_filter_verified)
      -- FIXED: Strict country matching - no online_available bypass
      AND (p_filter_country_code IS NULL 
           OR LOWER(cp.location_country_code) = LOWER(p_filter_country_code))
      AND (p_filter_city IS NULL OR LOWER(cp.location_city) = LOWER(p_filter_city))
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
    rc.location_country,
    rc.location_country_code,
    rc.location_lat,
    rc.location_lng,
    rc.experience_years,
    rc.is_verified,
    rc.online_available,
    rc.in_person_available,
    rc.gym_affiliation,
    rc.instagram_url,
    rc.created_at,
    rc.average_rating,
    rc.total_reviews,
    rc.total_clients,
    rc.is_boosted,
    rc.distance_km,
    rc.rank_score
  FROM ranked_coaches rc
  ORDER BY rc.rank_score DESC, rc.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;