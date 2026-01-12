-- Drop existing function to recreate with correct schema
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER, NUMERIC, NUMERIC);
DROP FUNCTION IF EXISTS public.get_ranked_coaches;

-- Recreate get_ranked_coaches with corrected column references
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
  p_limit INTEGER DEFAULT 50,
  p_user_lat NUMERIC DEFAULT NULL,
  p_user_lng NUMERIC DEFAULT NULL
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
  x_url TEXT,
  youtube_url TEXT,
  linkedin_url TEXT,
  tiktok_url TEXT,
  threads_url TEXT,
  is_sponsored BOOLEAN,
  avatar_slug TEXT,
  avatar_rarity TEXT,
  location_tier INTEGER,
  location_score NUMERIC,
  engagement_score NUMERIC,
  profile_score NUMERIC,
  total_score NUMERIC,
  verified_qualification_count BIGINT,
  distance_miles NUMERIC,
  booking_mode TEXT,
  who_i_work_with TEXT,
  marketplace_visible BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_country TEXT;
BEGIN
  -- Normalize country code to uppercase
  v_user_country := UPPER(COALESCE(p_filter_country_code, p_user_country_code, 'GB'));

  RETURN QUERY
  WITH coach_engagement AS (
    SELECT
      r.coach_id,
      COUNT(r.id) AS review_count,
      COALESCE(AVG(r.rating), 0) AS avg_rating
    FROM reviews r
    GROUP BY r.coach_id
  ),
  verified_qualifications AS (
    SELECT
      vd.coach_id,
      COUNT(*) AS qual_count
    FROM verification_documents vd
    WHERE vd.status = 'approved'
    GROUP BY vd.coach_id
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
      cp.x_url,
      cp.youtube_url,
      cp.linkedin_url,
      cp.tiktok_url,
      cp.threads_url,
      COALESCE(cb.is_active, false) AS is_sponsored,
      a.slug AS avatar_slug,
      a.rarity AS avatar_rarity,
      cp.booking_mode,
      cp.who_i_work_with,
      COALESCE(cp.marketplace_visible, false) AS marketplace_visible,
      cp.created_at,
      COALESCE(vq.qual_count, 0) AS verified_qualification_count,
      -- Location tier: 1 = same city, 2 = same region, 3 = same country, 4 = online only
      CASE
        WHEN LOWER(cp.location_city) = LOWER(p_user_city) THEN 1
        WHEN LOWER(cp.location_region) = LOWER(p_user_region) THEN 2
        WHEN UPPER(cp.location_country_code) = v_user_country THEN 3
        WHEN cp.online_available = true AND cp.in_person_available = false THEN 4
        ELSE 5
      END AS location_tier,
      -- Location score (0-100)
      CASE
        WHEN LOWER(cp.location_city) = LOWER(p_user_city) THEN 100
        WHEN LOWER(cp.location_region) = LOWER(p_user_region) THEN 70
        WHEN UPPER(cp.location_country_code) = v_user_country THEN 40
        WHEN cp.online_available = true THEN 30
        ELSE 0
      END AS location_score,
      -- Engagement score (0-100)
      LEAST(100, (COALESCE(ce.review_count, 0) * 10) + (COALESCE(ce.avg_rating, 0) * 10)) AS engagement_score,
      -- Profile score (0-100)
      (
        CASE WHEN cp.bio IS NOT NULL AND LENGTH(cp.bio) > 50 THEN 20 ELSE 0 END +
        CASE WHEN cp.profile_image_url IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN cp.card_image_url IS NOT NULL THEN 15 ELSE 0 END +
        CASE WHEN cp.hourly_rate IS NOT NULL THEN 15 ELSE 0 END +
        CASE WHEN cp.is_verified = true THEN 20 ELSE 0 END +
        CASE WHEN cp.experience_years IS NOT NULL AND cp.experience_years > 0 THEN 10 ELSE 0 END
      ) AS profile_score,
      -- Distance in miles (if coordinates provided)
      CASE
        WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL 
             AND cp.location_lat IS NOT NULL AND cp.location_lng IS NOT NULL THEN
          ROUND(
            (3959 * acos(
              cos(radians(p_user_lat)) * cos(radians(cp.location_lat)) *
              cos(radians(cp.location_lng) - radians(p_user_lng)) +
              sin(radians(p_user_lat)) * sin(radians(cp.location_lat))
            ))::numeric, 1
          )
        ELSE NULL
      END AS distance_miles
    FROM coach_profiles cp
    LEFT JOIN coach_engagement ce ON ce.coach_id = cp.id
    LEFT JOIN verified_qualifications vq ON vq.coach_id = cp.id
    LEFT JOIN coach_boosts cb ON cb.coach_id = cp.id AND cb.is_active = true AND cb.expires_at > NOW()
    LEFT JOIN avatars a ON a.id = cp.selected_avatar_id
    WHERE
      -- Must be visible and onboarded
      COALESCE(cp.marketplace_visible, false) = true
      AND COALESCE(cp.onboarding_completed, false) = true
      AND (cp.status IS NULL OR cp.status = 'active')
      -- Country filter: show coaches from the target country OR online-only coaches
      AND (
        UPPER(cp.location_country_code) = v_user_country
        OR (cp.online_available = true AND cp.in_person_available = false)
      )
      -- Search term filter
      AND (
        p_search_term IS NULL
        OR p_search_term = ''
        OR cp.display_name ILIKE '%' || p_search_term || '%'
        OR cp.bio ILIKE '%' || p_search_term || '%'
        OR cp.location_city ILIKE '%' || p_search_term || '%'
        OR cp.location_region ILIKE '%' || p_search_term || '%'
      )
      -- Coach type filter
      AND (
        p_coach_types IS NULL
        OR cp.coach_types && p_coach_types
      )
      -- Price range filter
      AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
      AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
      -- Online/in-person filter
      AND (p_online_only = false OR cp.online_available = true)
      AND (p_in_person_only = false OR cp.in_person_available = true)
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
    r.hourly_rate,
    r.currency,
    r.location,
    r.location_city,
    r.location_region,
    r.location_country,
    r.location_country_code,
    r.gym_affiliation,
    r.experience_years,
    r.is_verified,
    r.verified_at,
    r.online_available,
    r.in_person_available,
    r.instagram_url,
    r.facebook_url,
    r.x_url,
    r.youtube_url,
    r.linkedin_url,
    r.tiktok_url,
    r.threads_url,
    r.is_sponsored,
    r.avatar_slug,
    r.avatar_rarity,
    r.location_tier,
    r.location_score,
    r.engagement_score,
    r.profile_score,
    -- Total score (weighted: 50% location, 30% engagement, 20% profile)
    ROUND((r.location_score * 0.5 + r.engagement_score * 0.3 + r.profile_score * 0.2)::numeric, 2) AS total_score,
    r.verified_qualification_count,
    r.distance_miles,
    r.booking_mode,
    r.who_i_work_with,
    r.marketplace_visible,
    r.created_at
  FROM ranked r
  ORDER BY
    r.is_sponsored DESC,
    r.location_tier ASC,
    (r.location_score * 0.5 + r.engagement_score * 0.3 + r.profile_score * 0.2) DESC,
    r.verified_qualification_count DESC
  LIMIT p_limit;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches TO anon;
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches TO authenticated;