-- Drop existing function and recreate with correct column name
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
  experience_years INTEGER,
  location TEXT,
  location_city TEXT,
  location_region TEXT,
  location_country TEXT,
  location_country_code TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  location_place_id TEXT,
  gym_affiliation TEXT,
  certifications JSONB,
  is_verified BOOLEAN,
  verification_status TEXT,
  online_available BOOLEAN,
  in_person_available BOOLEAN,
  marketplace_visible BOOLEAN,
  subscription_tier TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
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
BEGIN
  RETURN QUERY
  WITH coach_reviews AS (
    SELECT 
      r.coach_id,
      COUNT(*)::BIGINT as review_count,
      COALESCE(AVG(r.rating), 0)::NUMERIC as avg_rating
    FROM reviews r
    WHERE r.is_public = TRUE
    GROUP BY r.coach_id
  ),
  boosted_coaches AS (
    SELECT 
      cb.coach_id,
      TRUE as is_boosted
    FROM coach_boosts cb
    WHERE cb.is_active = TRUE
      AND cb.boost_end_date > NOW()
  ),
  ranked AS (
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
      cp.experience_years,
      cp.location,
      cp.location_city,
      cp.location_region,
      cp.location_country,
      cp.location_country_code,
      cp.location_lat,
      cp.location_lng,
      cp.location_place_id,
      cp.gym_affiliation,
      cp.certifications,
      cp.is_verified,
      cp.verification_status,
      cp.online_available,
      cp.in_person_available,
      cp.marketplace_visible,
      cp.subscription_tier,
      cp.created_at,
      cp.updated_at,
      COALESCE(bc.is_boosted, FALSE) as is_sponsored,
      COALESCE(cr.review_count, 0) as review_count,
      COALESCE(cr.avg_rating, 0) as avg_rating,
      -- Location tier: 1 = city match, 2 = region match, 3 = country match, 4 = online only
      CASE
        WHEN p_user_city IS NOT NULL 
             AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 1
        WHEN p_user_region IS NOT NULL 
             AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 2
        WHEN p_user_country_code IS NOT NULL 
             AND LOWER(cp.location_country_code) = LOWER(p_user_country_code) THEN 3
        WHEN cp.online_available = TRUE THEN 4
        ELSE 5
      END as location_tier,
      -- Visibility score calculation
      (
        -- Base score by location tier
        CASE
          WHEN p_user_city IS NOT NULL 
               AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 1000
          WHEN p_user_region IS NOT NULL 
               AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 700
          WHEN p_user_country_code IS NOT NULL 
               AND LOWER(cp.location_country_code) = LOWER(p_user_country_code) THEN 400
          WHEN cp.online_available = TRUE THEN 300
          ELSE 100
        END
        -- Boost bonus (only within same tier)
        + CASE WHEN COALESCE(bc.is_boosted, FALSE) THEN 30 ELSE 0 END
        -- Verified bonus
        + CASE WHEN cp.is_verified = TRUE THEN 25 ELSE 0 END
        -- Profile completeness bonus (max 20)
        + LEAST(20, (
            CASE WHEN cp.bio IS NOT NULL AND LENGTH(cp.bio) > 50 THEN 5 ELSE 0 END
            + CASE WHEN cp.profile_image_url IS NOT NULL THEN 5 ELSE 0 END
            + CASE WHEN cp.experience_years IS NOT NULL THEN 5 ELSE 0 END
            + CASE WHEN cp.certifications IS NOT NULL THEN 5 ELSE 0 END
          ))
        -- Engagement bonus (max 15)
        + LEAST(15, COALESCE(cr.review_count, 0)::NUMERIC * 3)
      )::NUMERIC as visibility_score
    FROM coach_profiles cp
    LEFT JOIN coach_reviews cr ON cr.coach_id = cp.id
    LEFT JOIN boosted_coaches bc ON bc.coach_id = cp.id
    WHERE cp.marketplace_visible = TRUE
      AND cp.status = 'active'
      -- Country filter
      AND (p_filter_country_code IS NULL 
           OR LOWER(cp.location_country_code) = LOWER(p_filter_country_code)
           OR cp.online_available = TRUE)
      -- Search term filter
      AND (p_search_term IS NULL 
           OR cp.display_name ILIKE '%' || p_search_term || '%'
           OR cp.bio ILIKE '%' || p_search_term || '%'
           OR cp.location_city ILIKE '%' || p_search_term || '%')
      -- Coach types filter
      AND (p_coach_types IS NULL 
           OR cp.coach_types && p_coach_types)
      -- Price filters
      AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
      AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
      -- Availability filters
      AND (p_online_only = FALSE OR cp.online_available = TRUE)
      AND (p_in_person_only = FALSE OR cp.in_person_available = TRUE)
  )
  SELECT 
    r.id,
    r.user_id,
    r.username,
    r.display_name,
    r.bio,
    r.profile_image_url,
    r.card_image_url,
    r.coach_types,
    r.primary_coach_type,
    r.hourly_rate,
    r.currency,
    r.experience_years,
    r.location,
    r.location_city,
    r.location_region,
    r.location_country,
    r.location_country_code,
    r.location_lat,
    r.location_lng,
    r.location_place_id,
    r.gym_affiliation,
    r.certifications,
    r.is_verified,
    r.verification_status,
    r.online_available,
    r.in_person_available,
    r.marketplace_visible,
    r.subscription_tier,
    r.created_at,
    r.updated_at,
    r.is_sponsored,
    r.visibility_score,
    r.location_tier,
    r.review_count,
    r.avg_rating
  FROM ranked r
  ORDER BY r.location_tier ASC, r.visibility_score DESC
  LIMIT p_limit;
END;
$$;