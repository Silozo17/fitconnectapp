-- PLATFORM STABILISATION: Drop ALL ranking functions and create simple country-filtered query
-- This removes ALL ranking, boosting, scoring, and complex ordering logic

-- Drop ALL existing get_ranked_coaches overloads (all parameter combinations)
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER, NUMERIC, NUMERIC);
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER);
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER, NUMERIC, NUMERIC);
DROP FUNCTION IF EXISTS public.get_ranked_coaches(TEXT, TEXT, TEXT, TEXT, TEXT[], NUMERIC, NUMERIC, BOOLEAN, BOOLEAN, INTEGER);
DROP FUNCTION IF EXISTS public.get_ranked_coaches();

-- Create simple coach listing function with STRICT country filtering
-- NO ranking logic, NO boost ordering, NO distance sorting
CREATE OR REPLACE FUNCTION public.get_simple_coaches(
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
  avatar_slug TEXT,
  avatar_rarity TEXT,
  is_sponsored BOOLEAN,
  review_count BIGINT,
  avg_rating NUMERIC,
  verified_qualification_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
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
    -- Avatar data
    av.slug AS avatar_slug,
    av.rarity AS avatar_rarity,
    -- Boost status (kept for display badge, NOT used for ordering)
    COALESCE(cb.is_active, FALSE) AS is_sponsored,
    -- Review stats
    COALESCE(rs.review_count, 0) AS review_count,
    rs.avg_rating,
    -- Qualification count
    COALESCE(vc.verified_count, 0) AS verified_qualification_count
  FROM coach_profiles cp
  LEFT JOIN avatars av ON av.id = cp.selected_avatar_id
  LEFT JOIN coach_boosts cb ON cb.coach_id = cp.id AND cb.is_active = TRUE AND cb.expires_at > NOW()
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS review_count, AVG(rating)::NUMERIC(3,2) AS avg_rating
    FROM coach_reviews cr WHERE cr.coach_id = cp.id AND cr.is_published = TRUE
  ) rs ON TRUE
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS verified_count
    FROM coach_qualifications cq WHERE cq.coach_id = cp.id AND cq.verification_status = 'verified'
  ) vc ON TRUE
  WHERE
    -- Must be marketplace visible
    cp.marketplace_visible = TRUE
    -- Must have completed onboarding
    AND cp.onboarding_completed = TRUE
    -- Must be active (null status = active)
    AND (cp.status IS NULL OR cp.status = 'active')
    -- STRICT country filter: if provided, ONLY match that country (case-insensitive)
    AND (
      p_filter_country_code IS NULL
      OR UPPER(TRIM(cp.location_country_code)) = UPPER(TRIM(p_filter_country_code))
    )
    -- Search filter
    AND (
      p_search_term IS NULL
      OR cp.display_name ILIKE '%' || p_search_term || '%'
      OR cp.bio ILIKE '%' || p_search_term || '%'
      OR cp.location ILIKE '%' || p_search_term || '%'
      OR cp.location_city ILIKE '%' || p_search_term || '%'
    )
    -- Coach type filter
    AND (
      p_coach_types IS NULL
      OR cp.coach_types && p_coach_types
    )
    -- Price range filter
    AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
    AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
    -- Session type filter
    AND (p_online_only = FALSE OR cp.online_available = TRUE)
    AND (p_in_person_only = FALSE OR cp.in_person_available = TRUE)
  -- Simple deterministic ordering: newest first (NO ranking, NO boost priority)
  ORDER BY cp.created_at DESC
  LIMIT p_limit;
END;
$$;