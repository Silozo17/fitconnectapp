-- Drop existing function
DROP FUNCTION IF EXISTS public.get_ranked_coaches(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], 
  NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER
);

-- Recreate with verified_qualification_count included
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
  hourly_rate NUMERIC,
  currency TEXT,
  location TEXT,
  location_city TEXT,
  location_region TEXT,
  location_country TEXT,
  location_country_code TEXT,
  gym_affiliation TEXT,
  experience_years INTEGER,
  is_verified BOOLEAN,
  verified_at TIMESTAMPTZ,
  online_available BOOLEAN,
  in_person_available BOOLEAN,
  instagram_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  linkedin_url TEXT,
  tiktok_url TEXT,
  is_sponsored BOOLEAN,
  avatar_slug TEXT,
  avatar_rarity TEXT,
  location_tier INTEGER,
  location_score NUMERIC,
  engagement_score NUMERIC,
  profile_score NUMERIC,
  total_score NUMERIC,
  verified_qualification_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH qualification_counts AS (
    SELECT 
      cq.coach_id,
      COUNT(cq.id) AS verified_count
    FROM coach_qualifications cq
    WHERE cq.is_verified = TRUE
    GROUP BY cq.coach_id
  ),
  review_counts AS (
    SELECT 
      r.coach_id,
      COUNT(r.id) AS review_count,
      AVG(r.rating) AS avg_rating
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
      cp.hourly_rate,
      cp.currency,
      cp.location,
      cp.location_city,
      cp.location_region,
      cp.location_country,
      cp.location_country_code,
      cp.gym_affiliation,
      cp.experience_years,
      cp.is_verified,
      cp.verified_at,
      cp.online_available,
      cp.in_person_available,
      cp.instagram_url,
      cp.facebook_url,
      cp.x_url AS twitter_url,
      cp.youtube_url,
      cp.linkedin_url,
      cp.tiktok_url,
      EXISTS (
        SELECT 1 FROM coach_boosts cb 
        WHERE cb.coach_id = cp.id 
        AND cb.is_active = TRUE 
        AND cb.boost_end_date > NOW()
      ) AS is_sponsored,
      av.slug AS avatar_slug,
      av.rarity AS avatar_rarity,
      COALESCE(qc.verified_count, 0) AS verified_qualification_count,
      -- Location tier (1=city, 2=region, 3=country, 4=online only)
      CASE
        WHEN p_user_city IS NOT NULL AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 1
        WHEN p_user_region IS NOT NULL AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 2
        WHEN p_user_country_code IS NOT NULL AND LOWER(cp.location_country_code) = LOWER(p_user_country_code) THEN 3
        WHEN cp.online_available = TRUE THEN 4
        ELSE 5
      END AS location_tier,
      -- Location score (NUMERIC)
      CASE
        WHEN p_user_city IS NOT NULL AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 100::NUMERIC
        WHEN p_user_region IS NOT NULL AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 75::NUMERIC
        WHEN p_user_country_code IS NOT NULL AND LOWER(cp.location_country_code) = LOWER(p_user_country_code) THEN 50::NUMERIC
        WHEN cp.online_available = TRUE THEN 25::NUMERIC
        ELSE 0::NUMERIC
      END AS location_score,
      -- Engagement score (NUMERIC)
      LEAST(COALESCE(rc.review_count, 0) * 5 + COALESCE(rc.avg_rating, 0) * 10, 100)::NUMERIC AS engagement_score,
      -- Profile score (NUMERIC)
      (
        CASE WHEN cp.bio IS NOT NULL AND LENGTH(cp.bio) > 50 THEN 20 ELSE 0 END +
        CASE WHEN cp.profile_image_url IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN cp.is_verified = TRUE THEN 30 ELSE 0 END +
        CASE WHEN cp.experience_years IS NOT NULL AND cp.experience_years > 0 THEN 15 ELSE 0 END +
        CASE WHEN cp.hourly_rate IS NOT NULL THEN 15 ELSE 0 END
      )::NUMERIC AS profile_score
    FROM coach_profiles cp
    LEFT JOIN avatars av ON cp.selected_avatar_id = av.id
    LEFT JOIN review_counts rc ON rc.coach_id = cp.id
    LEFT JOIN qualification_counts qc ON qc.coach_id = cp.id
    WHERE 
      cp.marketplace_visible = TRUE
      AND (cp.status IS NULL OR cp.status = 'active')
      AND (cp.onboarding_completed = TRUE OR cp.onboarding_completed IS NULL)
      -- Strict country filter
      AND (
        p_filter_country_code IS NULL 
        OR LOWER(cp.location_country_code) = LOWER(p_filter_country_code)
      )
      -- Search filter
      AND (
        p_search_term IS NULL 
        OR cp.display_name ILIKE '%' || p_search_term || '%'
        OR cp.bio ILIKE '%' || p_search_term || '%'
        OR cp.location_city ILIKE '%' || p_search_term || '%'
      )
      -- Coach type filter
      AND (
        p_coach_types IS NULL 
        OR cp.coach_types && p_coach_types
      )
      -- Price filters
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
    rc.hourly_rate,
    rc.currency,
    rc.location,
    rc.location_city,
    rc.location_region,
    rc.location_country,
    rc.location_country_code,
    rc.gym_affiliation,
    rc.experience_years,
    rc.is_verified,
    rc.verified_at,
    rc.online_available,
    rc.in_person_available,
    rc.instagram_url,
    rc.facebook_url,
    rc.twitter_url,
    rc.youtube_url,
    rc.linkedin_url,
    rc.tiktok_url,
    rc.is_sponsored,
    rc.avatar_slug,
    rc.avatar_rarity,
    rc.location_tier,
    rc.location_score,
    rc.engagement_score,
    rc.profile_score,
    (rc.location_score + rc.engagement_score + rc.profile_score)::NUMERIC AS total_score,
    rc.verified_qualification_count
  FROM ranked_coaches rc
  ORDER BY 
    rc.is_sponsored DESC,
    rc.location_tier ASC,
    (rc.location_score + rc.engagement_score + rc.profile_score) DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], 
  NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER
) TO anon, authenticated;