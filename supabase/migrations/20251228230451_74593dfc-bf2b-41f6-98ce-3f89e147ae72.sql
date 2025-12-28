-- Drop all existing versions of the function
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER);
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT[], TEXT, NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER, INTEGER);

-- Recreate the function with correct parameter names matching frontend calls
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
  p_limit INTEGER DEFAULT 50
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
  online_available BOOLEAN,
  in_person_available BOOLEAN,
  is_verified BOOLEAN,
  experience_years INTEGER,
  gym_affiliation TEXT,
  certifications JSONB,
  instagram_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,
  linkedin_url TEXT,
  tiktok_url TEXT,
  x_url TEXT,
  threads_url TEXT,
  who_i_work_with TEXT,
  is_sponsored BOOLEAN,
  visibility_score NUMERIC,
  location_tier INTEGER,
  review_count BIGINT,
  avg_rating NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_city_lower TEXT := LOWER(TRIM(COALESCE(p_user_city, '')));
  v_user_region_lower TEXT := LOWER(TRIM(COALESCE(p_user_region, '')));
  v_user_country_code_upper TEXT := UPPER(TRIM(COALESCE(p_user_country_code, '')));
  v_filter_country_code_upper TEXT := UPPER(TRIM(COALESCE(p_filter_country_code, '')));
  v_search_term_lower TEXT := LOWER(TRIM(COALESCE(p_search_term, '')));
BEGIN
  RETURN QUERY
  WITH coach_reviews AS (
    SELECT 
      r.coach_id,
      COUNT(*)::BIGINT AS review_count,
      ROUND(AVG(r.rating)::NUMERIC, 2) AS avg_rating
    FROM reviews r
    WHERE r.is_published = TRUE
    GROUP BY r.coach_id
  ),
  active_boosts AS (
    SELECT cb.coach_id
    FROM coach_boosts cb
    WHERE cb.is_active = TRUE
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
      cp.location_lat,
      cp.location_lng,
      cp.online_available,
      cp.in_person_available,
      cp.is_verified,
      cp.experience_years,
      cp.gym_affiliation,
      cp.certifications,
      cp.instagram_url,
      cp.facebook_url,
      cp.youtube_url,
      cp.linkedin_url,
      cp.tiktok_url,
      cp.x_url,
      cp.threads_url,
      cp.who_i_work_with,
      -- Is sponsored (has active boost)
      (ab.coach_id IS NOT NULL) AS is_sponsored,
      -- Review data
      COALESCE(cr.review_count, 0) AS review_count,
      COALESCE(cr.avg_rating, 0) AS avg_rating,
      -- Location tier calculation (1=city, 2=region, 3=country, 4=online-only, 5=no-match)
      CASE
        -- Exact city match
        WHEN v_user_city_lower <> '' AND LOWER(COALESCE(cp.location_city, '')) = v_user_city_lower THEN 1
        -- Same region match
        WHEN v_user_region_lower <> '' AND LOWER(COALESCE(cp.location_region, '')) = v_user_region_lower THEN 2
        -- Same country match
        WHEN v_user_country_code_upper <> '' AND UPPER(COALESCE(cp.location_country_code, '')) = v_user_country_code_upper THEN 3
        -- Online-only coach (no location penalty if they offer online)
        WHEN cp.online_available = TRUE AND cp.in_person_available = FALSE THEN 4
        -- No match
        ELSE 5
      END AS location_tier,
      -- Calculate visibility score
      (
        -- Base score from location tier (higher is better)
        CASE
          WHEN v_user_city_lower <> '' AND LOWER(COALESCE(cp.location_city, '')) = v_user_city_lower THEN 1000
          WHEN v_user_region_lower <> '' AND LOWER(COALESCE(cp.location_region, '')) = v_user_region_lower THEN 700
          WHEN v_user_country_code_upper <> '' AND UPPER(COALESCE(cp.location_country_code, '')) = v_user_country_code_upper THEN 400
          WHEN cp.online_available = TRUE AND cp.in_person_available = FALSE THEN 300
          ELSE 100
        END
        -- Boost bonus (only if location tier <= 3, i.e., same country or closer)
        + CASE 
            WHEN ab.coach_id IS NOT NULL AND (
              (v_user_city_lower <> '' AND LOWER(COALESCE(cp.location_city, '')) = v_user_city_lower) OR
              (v_user_region_lower <> '' AND LOWER(COALESCE(cp.location_region, '')) = v_user_region_lower) OR
              (v_user_country_code_upper <> '' AND UPPER(COALESCE(cp.location_country_code, '')) = v_user_country_code_upper)
            ) THEN 30
            ELSE 0
          END
        -- Verified bonus
        + CASE WHEN cp.is_verified = TRUE THEN 25 ELSE 0 END
        -- Profile completeness bonus (max 20 points)
        + CASE WHEN cp.bio IS NOT NULL AND LENGTH(cp.bio) > 50 THEN 5 ELSE 0 END
        + CASE WHEN cp.profile_image_url IS NOT NULL THEN 5 ELSE 0 END
        + CASE WHEN cp.coach_types IS NOT NULL AND array_length(cp.coach_types, 1) > 0 THEN 5 ELSE 0 END
        + CASE WHEN cp.hourly_rate IS NOT NULL THEN 5 ELSE 0 END
        -- Engagement bonus (max 15 points based on reviews)
        + LEAST(15, COALESCE(cr.review_count, 0) * 3)
      )::NUMERIC AS visibility_score
    FROM coach_profiles cp
    LEFT JOIN coach_reviews cr ON cr.coach_id = cp.id
    LEFT JOIN active_boosts ab ON ab.coach_id = cp.id
    WHERE 
      -- Must be visible in marketplace
      cp.marketplace_visible = TRUE
      -- Must have completed onboarding
      AND cp.onboarding_completed = TRUE
      -- Must have active status
      AND (cp.status IS NULL OR cp.status = 'active')
      -- Country filter (if specified)
      AND (
        v_filter_country_code_upper = ''
        OR UPPER(COALESCE(cp.location_country_code, '')) = v_filter_country_code_upper
        OR (cp.online_available = TRUE AND cp.in_person_available = FALSE)
      )
      -- Search term filter
      AND (
        v_search_term_lower = ''
        OR LOWER(COALESCE(cp.display_name, '')) ILIKE '%' || v_search_term_lower || '%'
        OR LOWER(COALESCE(cp.username, '')) ILIKE '%' || v_search_term_lower || '%'
        OR LOWER(COALESCE(cp.bio, '')) ILIKE '%' || v_search_term_lower || '%'
        OR LOWER(COALESCE(cp.location, '')) ILIKE '%' || v_search_term_lower || '%'
        OR LOWER(COALESCE(cp.location_city, '')) ILIKE '%' || v_search_term_lower || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(cp.coach_types) ct WHERE LOWER(ct) ILIKE '%' || v_search_term_lower || '%'
        )
      )
      -- Coach types filter
      AND (
        p_coach_types IS NULL
        OR array_length(p_coach_types, 1) IS NULL
        OR cp.coach_types && p_coach_types
      )
      -- Price range filter
      AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
      AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
      -- Online/In-person filter
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
    rc.location_lat,
    rc.location_lng,
    rc.online_available,
    rc.in_person_available,
    rc.is_verified,
    rc.experience_years,
    rc.gym_affiliation,
    rc.certifications,
    rc.instagram_url,
    rc.facebook_url,
    rc.youtube_url,
    rc.linkedin_url,
    rc.tiktok_url,
    rc.x_url,
    rc.threads_url,
    rc.who_i_work_with,
    rc.is_sponsored,
    rc.visibility_score,
    rc.location_tier,
    rc.review_count,
    rc.avg_rating
  FROM ranked_coaches rc
  ORDER BY 
    rc.location_tier ASC,
    rc.is_sponsored DESC,
    rc.visibility_score DESC,
    rc.review_count DESC
  LIMIT p_limit;
END;
$$;