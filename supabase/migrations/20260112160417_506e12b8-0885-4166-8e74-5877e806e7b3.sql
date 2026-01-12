-- Drop the existing function (all overloads)
DROP FUNCTION IF EXISTS public.get_ranked_coaches(text, text, text[], numeric, numeric, integer, integer, text, numeric, numeric, text, boolean, text);
DROP FUNCTION IF EXISTS public.get_ranked_coaches;

-- Recreate with correct table references
CREATE OR REPLACE FUNCTION public.get_ranked_coaches(
  p_user_lat numeric DEFAULT NULL,
  p_user_lng numeric DEFAULT NULL,
  p_coach_types text[] DEFAULT NULL,
  p_min_price numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_min_rating numeric DEFAULT NULL,
  p_max_distance_km numeric DEFAULT NULL,
  p_sort_by text DEFAULT 'relevance',
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_filter_country_code text DEFAULT NULL,
  p_online_only boolean DEFAULT false,
  p_search_query text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  username text,
  first_name text,
  last_name text,
  display_name text,
  bio text,
  avatar_url text,
  location text,
  location_lat numeric,
  location_lng numeric,
  location_country_code text,
  hourly_rate numeric,
  currency text,
  coach_types text[],
  years_experience integer,
  is_verified boolean,
  offers_online boolean,
  offers_in_person boolean,
  average_rating numeric,
  total_reviews integer,
  distance_km numeric,
  relevance_score numeric,
  location_tier integer,
  booking_mode text,
  selected_avatar_id uuid,
  created_at timestamptz,
  onboarding_completed boolean,
  marketplace_visible boolean,
  who_i_work_with text,
  threads_url text,
  x_url text,
  specializations text[],
  training_approach text,
  achievements text[],
  certifications text[],
  languages text[],
  gym_affiliations jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized_country text;
BEGIN
  -- Normalize the country code to uppercase for consistent comparison
  v_normalized_country := UPPER(TRIM(COALESCE(p_filter_country_code, '')));
  
  RETURN QUERY
  WITH coach_stats AS (
    SELECT 
      cr.coach_id,
      COALESCE(AVG(cr.rating), 0) as avg_rating,
      COUNT(cr.id) as review_count
    FROM coach_reviews cr
    WHERE cr.is_visible = true
    GROUP BY cr.coach_id
  ),
  verified_qualifications AS (
    -- Use coach_verification_documents table (which exists) instead of verification_documents
    SELECT 
      cvd.coach_id,
      COUNT(*) as verified_count
    FROM coach_verification_documents cvd
    WHERE cvd.status = 'approved'
    GROUP BY cvd.coach_id
  ),
  ranked_coaches AS (
    SELECT 
      cp.id,
      cp.user_id,
      cp.username,
      cp.first_name,
      cp.last_name,
      cp.display_name,
      cp.bio,
      cp.avatar_url,
      cp.location,
      cp.location_lat,
      cp.location_lng,
      cp.location_country_code,
      cp.hourly_rate,
      cp.currency,
      cp.coach_types,
      cp.years_experience,
      cp.is_verified,
      cp.offers_online,
      cp.offers_in_person,
      COALESCE(cs.avg_rating, 0) as average_rating,
      COALESCE(cs.review_count, 0)::integer as total_reviews,
      -- Calculate distance if user location provided
      CASE 
        WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL 
             AND cp.location_lat IS NOT NULL AND cp.location_lng IS NOT NULL THEN
          (6371 * acos(
            cos(radians(p_user_lat)) * cos(radians(cp.location_lat)) *
            cos(radians(cp.location_lng) - radians(p_user_lng)) +
            sin(radians(p_user_lat)) * sin(radians(cp.location_lat))
          ))
        ELSE NULL
      END as distance_km,
      -- Calculate relevance score
      (
        COALESCE(cs.avg_rating, 0) * 20 +
        LEAST(COALESCE(cs.review_count, 0), 50) * 2 +
        CASE WHEN cp.is_verified THEN 30 ELSE 0 END +
        CASE WHEN cp.avatar_url IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN cp.bio IS NOT NULL AND LENGTH(cp.bio) > 100 THEN 15 ELSE 0 END +
        COALESCE(vq.verified_count, 0) * 5
      ) as relevance_score,
      -- Location tier based on country match
      CASE 
        WHEN v_normalized_country != '' AND UPPER(COALESCE(cp.location_country_code, '')) = v_normalized_country THEN 1
        WHEN cp.offers_online THEN 2
        ELSE 3
      END as location_tier,
      cp.booking_mode,
      cp.selected_avatar_id,
      cp.created_at,
      cp.onboarding_completed,
      cp.marketplace_visible,
      cp.who_i_work_with,
      cp.threads_url,
      cp.x_url,
      cp.specializations,
      cp.training_approach,
      cp.achievements,
      cp.certifications,
      cp.languages,
      cp.gym_affiliations
    FROM coach_profiles cp
    LEFT JOIN coach_stats cs ON cs.coach_id = cp.id
    LEFT JOIN verified_qualifications vq ON vq.coach_id = cp.id
    WHERE 
      -- Must be visible on marketplace
      COALESCE(cp.marketplace_visible, false) = true
      -- Must have completed onboarding
      AND COALESCE(cp.onboarding_completed, false) = true
      -- Must be active (or null status treated as active)
      AND (cp.status IS NULL OR cp.status = 'active')
      -- Coach type filter
      AND (p_coach_types IS NULL OR cp.coach_types && p_coach_types)
      -- Price filters
      AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
      AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
      -- Rating filter
      AND (p_min_rating IS NULL OR COALESCE(cs.avg_rating, 0) >= p_min_rating)
      -- Online only filter
      AND (p_online_only = false OR cp.offers_online = true)
      -- Search query filter
      AND (
        p_search_query IS NULL 
        OR p_search_query = ''
        OR cp.first_name ILIKE '%' || p_search_query || '%'
        OR cp.last_name ILIKE '%' || p_search_query || '%'
        OR cp.display_name ILIKE '%' || p_search_query || '%'
        OR cp.username ILIKE '%' || p_search_query || '%'
        OR cp.bio ILIKE '%' || p_search_query || '%'
        OR cp.location ILIKE '%' || p_search_query || '%'
      )
      -- Country filter: show coaches from that country OR coaches offering online
      AND (
        v_normalized_country = ''
        OR UPPER(COALESCE(cp.location_country_code, '')) = v_normalized_country
        OR cp.offers_online = true
      )
  )
  SELECT 
    rc.id,
    rc.user_id,
    rc.username,
    rc.first_name,
    rc.last_name,
    rc.display_name,
    rc.bio,
    rc.avatar_url,
    rc.location,
    rc.location_lat,
    rc.location_lng,
    rc.location_country_code,
    rc.hourly_rate,
    rc.currency,
    rc.coach_types,
    rc.years_experience,
    rc.is_verified,
    rc.offers_online,
    rc.offers_in_person,
    rc.average_rating,
    rc.total_reviews,
    rc.distance_km,
    rc.relevance_score,
    rc.location_tier,
    rc.booking_mode,
    rc.selected_avatar_id,
    rc.created_at,
    rc.onboarding_completed,
    rc.marketplace_visible,
    rc.who_i_work_with,
    rc.threads_url,
    rc.x_url,
    rc.specializations,
    rc.training_approach,
    rc.achievements,
    rc.certifications,
    rc.languages,
    rc.gym_affiliations
  FROM ranked_coaches rc
  WHERE 
    -- Distance filter (applied after calculation)
    (p_max_distance_km IS NULL OR rc.distance_km IS NULL OR rc.distance_km <= p_max_distance_km)
  ORDER BY
    -- Primary sort: location tier (local coaches first)
    rc.location_tier ASC,
    -- Secondary sort based on p_sort_by
    CASE WHEN p_sort_by = 'rating' THEN rc.average_rating END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'price_low' THEN rc.hourly_rate END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'price_high' THEN rc.hourly_rate END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'distance' THEN rc.distance_km END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'relevance' OR p_sort_by IS NULL THEN rc.relevance_score END DESC NULLS LAST,
    -- Final tiebreaker
    rc.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches(numeric, numeric, text[], numeric, numeric, numeric, numeric, text, integer, integer, text, boolean, text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches(numeric, numeric, text[], numeric, numeric, numeric, numeric, text, integer, integer, text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches(numeric, numeric, text[], numeric, numeric, numeric, numeric, text, integer, integer, text, boolean, text) TO service_role;