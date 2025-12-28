-- Coach Ranking Function: SQL-first approach with tiered location scoring
-- Boost only reorders within the same location tier, cannot globally outrank local coaches

-- Create the get_ranked_coaches function
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
  username TEXT,
  display_name TEXT,
  bio TEXT,
  coach_types TEXT[],
  certifications JSONB,
  experience_years INTEGER,
  hourly_rate NUMERIC,
  currency TEXT,
  location TEXT,
  location_city TEXT,
  location_region TEXT,
  location_country TEXT,
  location_country_code TEXT,
  online_available BOOLEAN,
  in_person_available BOOLEAN,
  profile_image_url TEXT,
  card_image_url TEXT,
  booking_mode TEXT,
  is_verified BOOLEAN,
  verified_at TIMESTAMPTZ,
  gym_affiliation TEXT,
  marketplace_visible BOOLEAN,
  selected_avatar_id UUID,
  created_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN,
  who_i_work_with TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  x_url TEXT,
  threads_url TEXT,
  linkedin_url TEXT,
  youtube_url TEXT,
  is_sponsored BOOLEAN,
  visibility_score INTEGER,
  location_tier INTEGER,
  review_count BIGINT,
  avg_rating NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
BEGIN
  RETURN QUERY
  WITH boosted_coaches AS (
    -- Get currently active boosted coaches
    SELECT cb.coach_id
    FROM coach_boosts cb
    WHERE cb.is_active = TRUE
      AND cb.payment_status IN ('succeeded', 'migrated_free')
      AND cb.boost_end_date > v_now
  ),
  coach_reviews AS (
    -- Aggregate review data per coach
    SELECT 
      r.coach_id,
      COUNT(*)::BIGINT AS review_count,
      ROUND(AVG(r.rating)::NUMERIC, 2) AS avg_rating
    FROM reviews r
    WHERE r.is_public = TRUE
    GROUP BY r.coach_id
  ),
  coach_sessions AS (
    -- Check for recent activity (completed sessions in last 30 days)
    SELECT DISTINCT cs.coach_id, TRUE AS recently_active
    FROM coaching_sessions cs
    WHERE cs.status = 'completed'
      AND cs.scheduled_at > v_now - INTERVAL '30 days'
  ),
  ranked AS (
    SELECT 
      cp.id,
      cp.username,
      cp.display_name,
      cp.bio,
      cp.coach_types,
      cp.certifications,
      cp.experience_years,
      cp.hourly_rate,
      cp.currency,
      cp.location,
      cp.location_city,
      cp.location_region,
      cp.location_country,
      cp.location_country_code,
      cp.online_available,
      cp.in_person_available,
      cp.profile_image_url,
      cp.card_image_url,
      cp.booking_mode,
      cp.is_verified,
      cp.verified_at,
      cp.gym_affiliation,
      cp.marketplace_visible,
      cp.selected_avatar_id,
      cp.created_at,
      cp.onboarding_completed,
      cp.who_i_work_with,
      cp.facebook_url,
      cp.instagram_url,
      cp.tiktok_url,
      cp.x_url,
      cp.threads_url,
      cp.linkedin_url,
      cp.youtube_url,
      
      -- Is this coach boosted?
      (bc.coach_id IS NOT NULL) AS is_sponsored,
      
      -- Review data
      COALESCE(cr.review_count, 0) AS review_count,
      cr.avg_rating,
      
      -- Location tier (1000/700/400/300/0 - primary ranking factor, cannot be overcome)
      CASE 
        WHEN p_user_city IS NOT NULL AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 1000
        WHEN p_user_region IS NOT NULL AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 700
        WHEN p_user_country_code IS NOT NULL AND LOWER(cp.location_country_code) = LOWER(p_user_country_code) THEN 400
        WHEN cp.online_available = TRUE THEN 300
        ELSE 0
      END AS location_tier,
      
      -- Boost modifier (30 points, only if location matches - within-tier reordering only)
      CASE 
        WHEN bc.coach_id IS NOT NULL AND (
          (p_user_city IS NOT NULL AND LOWER(cp.location_city) = LOWER(p_user_city)) OR
          (p_user_region IS NOT NULL AND LOWER(cp.location_region) = LOWER(p_user_region)) OR
          (p_user_country_code IS NOT NULL AND LOWER(cp.location_country_code) = LOWER(p_user_country_code))
        ) THEN 30
        ELSE 0
      END AS boost_score,
      
      -- Verified modifier (25 points)
      CASE WHEN cp.is_verified = TRUE THEN 25 ELSE 0 END AS verified_score,
      
      -- Profile completeness (20 points max)
      (
        CASE WHEN cp.bio IS NOT NULL AND LENGTH(cp.bio) >= 50 THEN 5 ELSE 0 END +
        CASE WHEN cp.profile_image_url IS NOT NULL OR cp.card_image_url IS NOT NULL THEN 4 ELSE 0 END +
        CASE WHEN cp.coach_types IS NOT NULL AND array_length(cp.coach_types, 1) > 0 THEN 3 ELSE 0 END +
        CASE WHEN cp.hourly_rate IS NOT NULL AND cp.hourly_rate > 0 THEN 3 ELSE 0 END +
        CASE WHEN cp.location_country_code IS NOT NULL THEN 3 ELSE 0 END +
        CASE WHEN cp.certifications IS NOT NULL THEN 2 ELSE 0 END
      ) AS profile_score,
      
      -- Engagement score (15 points max)
      (
        CASE WHEN COALESCE(cr.review_count, 0) > 0 THEN 5 ELSE 0 END +
        CASE 
          WHEN cr.avg_rating >= 4.5 THEN 5
          WHEN cr.avg_rating >= 4.0 THEN 3
          ELSE 0
        END +
        CASE WHEN cs.recently_active = TRUE THEN 3 ELSE 0 END +
        CASE WHEN COALESCE(cr.review_count, 0) >= 5 THEN 2 ELSE 0 END
      ) AS engagement_score
      
    FROM public_coach_profiles cp
    LEFT JOIN boosted_coaches bc ON bc.coach_id = cp.id
    LEFT JOIN coach_reviews cr ON cr.coach_id = cp.id
    LEFT JOIN coach_sessions cs ON cs.coach_id = cp.id
    
    WHERE 
      -- Exclude admin/test/demo accounts
      cp.display_name !~* '(^admin$|^test$|^demo$|^example$|^placeholder$|^sample$|^dummy$|test\s*coach|demo\s*coach|admin\s*coach)'
      
      -- Country filter (if provided)
      AND (p_filter_country_code IS NULL OR LOWER(cp.location_country_code) = LOWER(p_filter_country_code))
      
      -- Search filter
      AND (p_search_term IS NULL OR (
        cp.display_name ILIKE '%' || p_search_term || '%' OR
        cp.bio ILIKE '%' || p_search_term || '%' OR
        cp.location ILIKE '%' || p_search_term || '%'
      ))
      
      -- Coach types filter
      AND (p_coach_types IS NULL OR cp.coach_types && p_coach_types)
      
      -- Price range filter
      AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
      AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
      
      -- Availability filters
      AND (NOT p_online_only OR cp.online_available = TRUE)
      AND (NOT p_in_person_only OR cp.in_person_available = TRUE)
  )
  SELECT 
    r.id,
    r.username,
    r.display_name,
    r.bio,
    r.coach_types,
    r.certifications,
    r.experience_years,
    r.hourly_rate,
    r.currency,
    r.location,
    r.location_city,
    r.location_region,
    r.location_country,
    r.location_country_code,
    r.online_available,
    r.in_person_available,
    r.profile_image_url,
    r.card_image_url,
    r.booking_mode,
    r.is_verified,
    r.verified_at,
    r.gym_affiliation,
    r.marketplace_visible,
    r.selected_avatar_id,
    r.created_at,
    r.onboarding_completed,
    r.who_i_work_with,
    r.facebook_url,
    r.instagram_url,
    r.tiktok_url,
    r.x_url,
    r.threads_url,
    r.linkedin_url,
    r.youtube_url,
    r.is_sponsored,
    -- Total visibility score = location_tier + modifiers
    (r.location_tier + r.boost_score + r.verified_score + r.profile_score + r.engagement_score)::INTEGER AS visibility_score,
    r.location_tier::INTEGER,
    r.review_count,
    r.avg_rating
  FROM ranked r
  ORDER BY 
    -- Primary: Location tier (city > region > country > online > none)
    r.location_tier DESC,
    -- Secondary: Within tier, boost score (boosted coaches first in their tier)
    r.boost_score DESC,
    -- Tertiary: Verified status
    r.verified_score DESC,
    -- Quaternary: Profile + engagement score
    (r.profile_score + r.engagement_score) DESC,
    -- Final: Alphabetical for determinism
    r.display_name ASC NULLS LAST
  LIMIT p_limit;
END;
$$;

-- Create indexes to optimize the ranking function
CREATE INDEX IF NOT EXISTS idx_coach_profiles_location_city ON coach_profiles(location_city);
CREATE INDEX IF NOT EXISTS idx_coach_profiles_location_region ON coach_profiles(location_region);
CREATE INDEX IF NOT EXISTS idx_coach_profiles_location_country_code ON coach_profiles(location_country_code);
CREATE INDEX IF NOT EXISTS idx_coach_profiles_is_verified ON coach_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_coach_boosts_active ON coach_boosts(coach_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_reviews_coach_public ON reviews(coach_id) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_coach_completed ON coaching_sessions(coach_id, scheduled_at) WHERE status = 'completed';

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches TO anon, authenticated;