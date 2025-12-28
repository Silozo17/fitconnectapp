-- Drop ALL three overloads of get_ranked_coaches by specifying exact signatures
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT[], TEXT, BOOLEAN, BOOLEAN, NUMERIC, NUMERIC, NUMERIC, NUMERIC, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER);
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT[], BOOLEAN, BOOLEAN, NUMERIC, NUMERIC, BOOLEAN, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, INTEGER, INTEGER);

-- Also drop by name only to catch any remaining overloads
DROP FUNCTION IF EXISTS public.get_ranked_coaches;

-- Recreate with the CORRECT parameters that the frontend expects AND fixed country filter
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
  experience_years INTEGER,
  is_verified BOOLEAN,
  verification_status TEXT,
  online_available BOOLEAN,
  in_person_available BOOLEAN,
  gym_affiliation TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,
  linkedin_url TEXT,
  x_url TEXT,
  threads_url TEXT,
  who_i_work_with TEXT,
  review_count BIGINT,
  average_rating NUMERIC,
  total_sessions BIGINT,
  is_boosted BOOLEAN,
  location_score NUMERIC,
  engagement_score NUMERIC,
  profile_score NUMERIC,
  total_score NUMERIC,
  location_match_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_city_lower TEXT;
  v_user_region_lower TEXT;
  v_user_country_lower TEXT;
  v_filter_country_lower TEXT;
  v_search_lower TEXT;
BEGIN
  -- Normalize inputs
  v_user_city_lower := LOWER(TRIM(p_user_city));
  v_user_region_lower := LOWER(TRIM(p_user_region));
  v_user_country_lower := LOWER(TRIM(p_user_country_code));
  v_filter_country_lower := LOWER(TRIM(p_filter_country_code));
  v_search_lower := LOWER(TRIM(p_search_term));

  RETURN QUERY
  WITH coach_stats AS (
    SELECT 
      cr.coach_id,
      COUNT(cr.id) AS review_count,
      COALESCE(AVG(cr.rating), 0) AS average_rating
    FROM coach_reviews cr
    WHERE cr.is_approved = TRUE
    GROUP BY cr.coach_id
  ),
  session_stats AS (
    SELECT 
      s.coach_id,
      COUNT(s.id) AS total_sessions
    FROM sessions s
    WHERE s.status = 'completed'
    GROUP BY s.coach_id
  ),
  active_boosts AS (
    SELECT cb.coach_id, TRUE AS is_boosted
    FROM coach_boosts cb
    WHERE cb.is_active = TRUE
      AND cb.boost_start_date <= NOW()
      AND (cb.boost_end_date IS NULL OR cb.boost_end_date >= NOW())
  ),
  ranked_coaches AS (
    SELECT 
      cp.id,
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
      cp.experience_years,
      cp.is_verified,
      cp.verification_status,
      cp.online_available,
      cp.in_person_available,
      cp.gym_affiliation,
      cp.instagram_url,
      cp.facebook_url,
      cp.youtube_url,
      cp.tiktok_url,
      cp.linkedin_url,
      cp.x_url,
      cp.threads_url,
      cp.who_i_work_with,
      COALESCE(cs.review_count, 0) AS review_count,
      COALESCE(cs.average_rating, 0) AS average_rating,
      COALESCE(ss.total_sessions, 0) AS total_sessions,
      COALESCE(ab.is_boosted, FALSE) AS is_boosted,
      -- Location scoring
      CASE 
        WHEN v_user_city_lower IS NOT NULL AND LOWER(cp.location_city) = v_user_city_lower THEN 100
        WHEN v_user_region_lower IS NOT NULL AND LOWER(cp.location_region) = v_user_region_lower THEN 70
        WHEN v_user_country_lower IS NOT NULL AND LOWER(cp.location_country_code) = v_user_country_lower THEN 40
        WHEN cp.online_available = TRUE THEN 20
        ELSE 10
      END AS location_score,
      -- Engagement scoring
      LEAST(
        (COALESCE(cs.average_rating, 0) * 10) + 
        (LEAST(COALESCE(cs.review_count, 0), 50) * 0.5) + 
        (LEAST(COALESCE(ss.total_sessions, 0), 100) * 0.2),
        100
      ) AS engagement_score,
      -- Profile completeness scoring
      (
        CASE WHEN cp.bio IS NOT NULL AND LENGTH(cp.bio) > 50 THEN 15 ELSE 0 END +
        CASE WHEN cp.profile_image_url IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN cp.card_image_url IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN cp.coach_types IS NOT NULL AND array_length(cp.coach_types, 1) > 0 THEN 15 ELSE 0 END +
        CASE WHEN cp.hourly_rate IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN cp.experience_years IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN cp.is_verified = TRUE THEN 20 ELSE 0 END
      ) AS profile_score,
      -- Location match level for frontend display
      CASE 
        WHEN v_user_city_lower IS NOT NULL AND LOWER(cp.location_city) = v_user_city_lower THEN 'city'
        WHEN v_user_region_lower IS NOT NULL AND LOWER(cp.location_region) = v_user_region_lower THEN 'region'
        WHEN v_user_country_lower IS NOT NULL AND LOWER(cp.location_country_code) = v_user_country_lower THEN 'country'
        WHEN cp.online_available = TRUE THEN 'online'
        ELSE 'global'
      END AS location_match_level
    FROM coach_profiles cp
    LEFT JOIN coach_stats cs ON cs.coach_id = cp.id
    LEFT JOIN session_stats ss ON ss.coach_id = cp.id
    LEFT JOIN active_boosts ab ON ab.coach_id = cp.id
    WHERE cp.marketplace_visible = TRUE
      AND cp.status = 'active'
      AND cp.onboarding_completed = TRUE
      -- Search filter
      AND (v_search_lower IS NULL 
           OR LOWER(cp.display_name) LIKE '%' || v_search_lower || '%'
           OR LOWER(cp.username) LIKE '%' || v_search_lower || '%'
           OR LOWER(cp.bio) LIKE '%' || v_search_lower || '%'
           OR LOWER(cp.location) LIKE '%' || v_search_lower || '%'
           OR LOWER(cp.location_city) LIKE '%' || v_search_lower || '%')
      -- Coach types filter
      AND (p_coach_types IS NULL 
           OR cp.coach_types && p_coach_types)
      -- Price filters
      AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
      AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
      -- Online/In-person filters
      AND (p_online_only = FALSE OR cp.online_available = TRUE)
      AND (p_in_person_only = FALSE OR cp.in_person_available = TRUE)
      -- FIXED: Country filter - STRICT matching, NO online_available bypass!
      AND (v_filter_country_lower IS NULL 
           OR LOWER(cp.location_country_code) = v_filter_country_lower)
  )
  SELECT 
    rc.id,
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
    rc.experience_years,
    rc.is_verified,
    rc.verification_status,
    rc.online_available,
    rc.in_person_available,
    rc.gym_affiliation,
    rc.instagram_url,
    rc.facebook_url,
    rc.youtube_url,
    rc.tiktok_url,
    rc.linkedin_url,
    rc.x_url,
    rc.threads_url,
    rc.who_i_work_with,
    rc.review_count,
    rc.average_rating,
    rc.total_sessions,
    rc.is_boosted,
    rc.location_score,
    rc.engagement_score,
    rc.profile_score,
    -- Total score with boost priority
    (
      (rc.location_score * 0.4) + 
      (rc.engagement_score * 0.35) + 
      (rc.profile_score * 0.25) +
      (CASE WHEN rc.is_boosted THEN 200 ELSE 0 END)
    ) AS total_score,
    rc.location_match_level
  FROM ranked_coaches rc
  ORDER BY 
    rc.is_boosted DESC,
    (
      (rc.location_score * 0.4) + 
      (rc.engagement_score * 0.35) + 
      (rc.profile_score * 0.25)
    ) DESC
  LIMIT p_limit;
END;
$$;