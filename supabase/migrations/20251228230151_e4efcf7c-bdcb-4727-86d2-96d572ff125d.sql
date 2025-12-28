-- Fix type mismatch: location_lat and location_lng should be NUMERIC to match coach_profiles table
DROP FUNCTION IF EXISTS public.get_ranked_coaches(
  TEXT, TEXT[], TEXT, BOOLEAN, BOOLEAN, NUMERIC, NUMERIC, NUMERIC, NUMERIC, INTEGER, INTEGER
);

CREATE OR REPLACE FUNCTION public.get_ranked_coaches(
  p_search_query TEXT DEFAULT NULL,
  p_coach_types TEXT[] DEFAULT NULL,
  p_location_query TEXT DEFAULT NULL,
  p_online_available BOOLEAN DEFAULT NULL,
  p_in_person_available BOOLEAN DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_user_lat NUMERIC DEFAULT NULL,
  p_user_lng NUMERIC DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
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
  location_region TEXT,
  location_country TEXT,
  location_country_code TEXT,
  online_available BOOLEAN,
  in_person_available BOOLEAN,
  experience_years INTEGER,
  gym_affiliation TEXT,
  is_verified BOOLEAN,
  verification_status TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,
  linkedin_url TEXT,
  tiktok_url TEXT,
  threads_url TEXT,
  x_url TEXT,
  who_i_work_with TEXT,
  booking_mode TEXT,
  verified_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN,
  location_lat NUMERIC,
  location_lng NUMERIC,
  average_rating NUMERIC,
  total_reviews BIGINT,
  total_clients BIGINT,
  is_boosted BOOLEAN,
  ranking_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_boost_weight CONSTANT NUMERIC := 100;
  v_verified_weight CONSTANT NUMERIC := 20;
  v_rating_weight CONSTANT NUMERIC := 15;
  v_reviews_weight CONSTANT NUMERIC := 10;
  v_clients_weight CONSTANT NUMERIC := 8;
  v_complete_profile_weight CONSTANT NUMERIC := 5;
  v_recent_activity_weight CONSTANT NUMERIC := 5;
  v_distance_weight CONSTANT NUMERIC := 10;
BEGIN
  RETURN QUERY
  WITH coach_stats AS (
    SELECT
      cp.id AS coach_id,
      COALESCE(AVG(r.rating), 0) AS avg_rating,
      COUNT(DISTINCT r.id) AS review_count,
      COUNT(DISTINCT cc.client_id) AS client_count,
      MAX(br.created_at) AS last_booking_date
    FROM coach_profiles cp
    LEFT JOIN reviews r ON r.coach_id = cp.id AND r.status = 'published'
    LEFT JOIN coach_clients cc ON cc.coach_id = cp.id AND cc.status = 'active'
    LEFT JOIN booking_requests br ON br.coach_id = cp.id AND br.status = 'confirmed'
    GROUP BY cp.id
  ),
  active_boosts AS (
    SELECT cb.coach_id, TRUE AS has_boost
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
      cp.experience_years,
      cp.gym_affiliation,
      cp.is_verified,
      cp.verification_status,
      cp.instagram_url,
      cp.facebook_url,
      cp.youtube_url,
      cp.linkedin_url,
      cp.tiktok_url,
      cp.threads_url,
      cp.x_url,
      cp.who_i_work_with,
      cp.booking_mode,
      cp.verified_at,
      cp.onboarding_completed,
      cp.location_lat,
      cp.location_lng,
      cs.avg_rating,
      cs.review_count,
      cs.client_count,
      COALESCE(ab.has_boost, FALSE) AS is_boosted,
      -- Calculate ranking score
      (
        -- Boost bonus (highest priority)
        CASE WHEN COALESCE(ab.has_boost, FALSE) THEN v_boost_weight ELSE 0 END
        -- Verified bonus
        + CASE WHEN cp.is_verified = TRUE THEN v_verified_weight ELSE 0 END
        -- Rating score (normalized 0-15)
        + (COALESCE(cs.avg_rating, 0) / 5.0) * v_rating_weight
        -- Reviews score (log scale, max 10)
        + LEAST(LN(COALESCE(cs.review_count, 0) + 1) * 2, v_reviews_weight)
        -- Clients score (log scale, max 8)
        + LEAST(LN(COALESCE(cs.client_count, 0) + 1) * 2, v_clients_weight)
        -- Complete profile bonus
        + CASE WHEN cp.is_complete_profile = TRUE THEN v_complete_profile_weight ELSE 0 END
        -- Recent activity bonus (booking in last 30 days)
        + CASE WHEN cs.last_booking_date > NOW() - INTERVAL '30 days' THEN v_recent_activity_weight ELSE 0 END
        -- Distance bonus (if user location provided)
        + CASE 
            WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL 
                 AND cp.location_lat IS NOT NULL AND cp.location_lng IS NOT NULL THEN
              -- Closer = higher score, max 10 points for 0km, 0 points for 100km+
              GREATEST(0, v_distance_weight - (
                6371 * ACOS(
                  LEAST(1, GREATEST(-1,
                    COS(RADIANS(p_user_lat)) * COS(RADIANS(cp.location_lat)) *
                    COS(RADIANS(cp.location_lng) - RADIANS(p_user_lng)) +
                    SIN(RADIANS(p_user_lat)) * SIN(RADIANS(cp.location_lat))
                  ))
                ) / 10
              ))
            ELSE 0 
          END
        -- Small random factor for variety (0-1)
        + RANDOM()
      ) AS ranking_score
    FROM coach_profiles cp
    LEFT JOIN coach_stats cs ON cs.coach_id = cp.id
    LEFT JOIN active_boosts ab ON ab.coach_id = cp.id
    WHERE
      -- Visibility requirements
      cp.marketplace_visible = TRUE
      AND cp.onboarding_completed = TRUE
      AND (cp.status IS NULL OR cp.status = 'active')
      -- Search filter
      AND (
        p_search_query IS NULL 
        OR cp.display_name ILIKE '%' || p_search_query || '%'
        OR cp.username ILIKE '%' || p_search_query || '%'
        OR cp.bio ILIKE '%' || p_search_query || '%'
        OR cp.location_city ILIKE '%' || p_search_query || '%'
      )
      -- Coach type filter
      AND (
        p_coach_types IS NULL 
        OR cp.coach_types && p_coach_types
      )
      -- Location filter
      AND (
        p_location_query IS NULL
        OR cp.location ILIKE '%' || p_location_query || '%'
        OR cp.location_city ILIKE '%' || p_location_query || '%'
        OR cp.location_region ILIKE '%' || p_location_query || '%'
        OR cp.location_country ILIKE '%' || p_location_query || '%'
      )
      -- Online availability filter
      AND (p_online_available IS NULL OR cp.online_available = p_online_available)
      -- In-person availability filter
      AND (p_in_person_available IS NULL OR cp.in_person_available = p_in_person_available)
      -- Price range filter
      AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
      AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
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
    rc.experience_years,
    rc.gym_affiliation,
    rc.is_verified,
    rc.verification_status,
    rc.instagram_url,
    rc.facebook_url,
    rc.youtube_url,
    rc.linkedin_url,
    rc.tiktok_url,
    rc.threads_url,
    rc.x_url,
    rc.who_i_work_with,
    rc.booking_mode,
    rc.verified_at,
    rc.onboarding_completed,
    rc.location_lat,
    rc.location_lng,
    rc.avg_rating,
    rc.review_count,
    rc.client_count,
    rc.is_boosted,
    rc.ranking_score
  FROM ranked_coaches rc
  ORDER BY rc.ranking_score DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;