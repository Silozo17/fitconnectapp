-- Drop the existing function first, then recreate with correct schema
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER);

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
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  experience_years INTEGER,
  is_verified BOOLEAN,
  verification_status TEXT,
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
  who_i_work_with TEXT,
  booking_mode TEXT,
  certifications JSONB,
  visibility_score INTEGER,
  location_tier INTEGER,
  is_boosted BOOLEAN,
  review_count BIGINT,
  avg_rating NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH coach_engagement AS (
    SELECT 
      r.coach_id,
      COUNT(r.id) AS review_count,
      COALESCE(AVG(r.rating), 0) AS avg_rating
    FROM reviews r
    WHERE r.is_public = TRUE
    GROUP BY r.coach_id
  ),
  active_boosts AS (
    SELECT DISTINCT cb.coach_id
    FROM coach_boosts cb
    WHERE cb.is_active = TRUE
      AND cb.boost_start_date <= NOW()
      AND (cb.boost_end_date IS NULL OR cb.boost_end_date >= NOW())
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
      cp.is_verified,
      cp.verification_status,
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
      cp.who_i_work_with,
      cp.booking_mode,
      cp.certifications,
      CASE 
        WHEN p_user_city IS NOT NULL AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 1
        WHEN p_user_region IS NOT NULL AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 2
        WHEN p_user_country_code IS NOT NULL AND LOWER(cp.location_country_code) = LOWER(p_user_country_code) THEN 3
        WHEN cp.online_available = TRUE THEN 4
        ELSE 5
      END AS location_tier,
      (
        CASE 
          WHEN p_user_city IS NOT NULL AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 1000
          WHEN p_user_region IS NOT NULL AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 700
          WHEN p_user_country_code IS NOT NULL AND LOWER(cp.location_country_code) = LOWER(p_user_country_code) THEN 400
          WHEN cp.online_available = TRUE THEN 300
          ELSE 0
        END
        + CASE 
            WHEN ab.coach_id IS NOT NULL AND (
              (p_user_city IS NOT NULL AND LOWER(cp.location_city) = LOWER(p_user_city)) OR
              (p_user_region IS NOT NULL AND LOWER(cp.location_region) = LOWER(p_user_region)) OR
              (p_user_country_code IS NOT NULL AND LOWER(cp.location_country_code) = LOWER(p_user_country_code))
            ) THEN 30
            ELSE 0
          END
        + CASE WHEN cp.is_verified = TRUE THEN 25 ELSE 0 END
        + CASE WHEN cp.bio IS NOT NULL AND LENGTH(cp.bio) >= 50 THEN 5 ELSE 0 END
        + CASE WHEN cp.profile_image_url IS NOT NULL OR cp.card_image_url IS NOT NULL THEN 4 ELSE 0 END
        + CASE WHEN cp.coach_types IS NOT NULL AND array_length(cp.coach_types, 1) > 0 THEN 3 ELSE 0 END
        + CASE WHEN cp.hourly_rate IS NOT NULL AND cp.hourly_rate > 0 THEN 3 ELSE 0 END
        + CASE WHEN cp.location_country_code IS NOT NULL THEN 3 ELSE 0 END
        + CASE WHEN cp.certifications IS NOT NULL THEN 2 ELSE 0 END
        + LEAST(15, (
          COALESCE(ce.review_count, 0) * 2 +
          CASE WHEN COALESCE(ce.avg_rating, 0) >= 4.5 THEN 5 
               WHEN COALESCE(ce.avg_rating, 0) >= 4.0 THEN 3 
               WHEN COALESCE(ce.avg_rating, 0) >= 3.5 THEN 1 
               ELSE 0 END
        ))
      )::INTEGER AS visibility_score,
      (ab.coach_id IS NOT NULL) AS is_boosted,
      COALESCE(ce.review_count, 0) AS review_count,
      COALESCE(ce.avg_rating, 0) AS avg_rating
    FROM coach_profiles cp
    LEFT JOIN coach_engagement ce ON ce.coach_id = cp.id
    LEFT JOIN active_boosts ab ON ab.coach_id = cp.id
    WHERE
      cp.marketplace_visible = TRUE
      AND cp.onboarding_completed = TRUE
      AND (cp.status IS NULL OR cp.status = 'active')
      AND (cp.display_name IS NULL OR cp.display_name !~* '(admin|test|demo|example|placeholder|sample|dummy)')
      AND (p_filter_country_code IS NULL OR LOWER(cp.location_country_code) = LOWER(p_filter_country_code))
      AND (p_search_term IS NULL OR (
        cp.display_name ILIKE '%' || p_search_term || '%' OR
        cp.bio ILIKE '%' || p_search_term || '%' OR
        cp.location_city ILIKE '%' || p_search_term || '%' OR
        cp.location ILIKE '%' || p_search_term || '%' OR
        EXISTS (SELECT 1 FROM unnest(cp.coach_types) ct WHERE ct ILIKE '%' || p_search_term || '%')
      ))
      AND (p_coach_types IS NULL OR cp.coach_types && p_coach_types)
      AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
      AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
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
    rc.experience_years,
    rc.is_verified,
    rc.verification_status,
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
    rc.who_i_work_with,
    rc.booking_mode,
    rc.certifications,
    rc.visibility_score,
    rc.location_tier,
    rc.is_boosted,
    rc.review_count,
    rc.avg_rating
  FROM ranked_coaches rc
  ORDER BY rc.location_tier ASC, rc.visibility_score DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ranked_coaches TO anon;
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches TO authenticated;