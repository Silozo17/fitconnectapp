-- Fix the column reference in get_ranked_coaches: expires_at -> boost_end_date

-- Drop all existing overloads of get_ranked_coaches
DROP FUNCTION IF EXISTS public.get_ranked_coaches(text, text, text, text, text, text[], numeric, numeric, boolean, boolean, integer, double precision, double precision);
DROP FUNCTION IF EXISTS public.get_ranked_coaches(text, text, text, text, text, text[], numeric, numeric, boolean, boolean, integer);
DROP FUNCTION IF EXISTS public.get_ranked_coaches();

-- Recreate the function with the correct column name (boost_end_date instead of expires_at)
CREATE OR REPLACE FUNCTION public.get_ranked_coaches(
  p_user_city text DEFAULT NULL,
  p_user_region text DEFAULT NULL,
  p_user_country_code text DEFAULT NULL,
  p_filter_country_code text DEFAULT NULL,
  p_search_term text DEFAULT NULL,
  p_coach_types text[] DEFAULT NULL,
  p_min_price numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_online_only boolean DEFAULT false,
  p_in_person_only boolean DEFAULT false,
  p_limit integer DEFAULT 50,
  p_user_lat double precision DEFAULT NULL,
  p_user_lng double precision DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  username text,
  display_name text,
  bio text,
  coach_types text[],
  certifications text[],
  experience_years integer,
  hourly_rate numeric,
  currency text,
  location_city text,
  location_region text,
  location_country text,
  location_country_code text,
  online_available boolean,
  in_person_available boolean,
  profile_image_url text,
  card_image_url text,
  is_verified boolean,
  gym_affiliation text,
  selected_avatar_id uuid,
  avatar_slug text,
  avatar_rarity text,
  is_sponsored boolean,
  visibility_score integer,
  location_tier integer,
  review_count bigint,
  avg_rating numeric
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
      COUNT(*) as review_count,
      AVG(r.rating) as avg_rating
    FROM reviews r
    WHERE r.is_public = true
    GROUP BY r.coach_id
  ),
  active_boosts AS (
    SELECT DISTINCT cb.coach_id
    FROM coach_boosts cb
    WHERE cb.is_active = true 
      AND cb.boost_end_date > NOW()  -- FIXED: was expires_at
  )
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
    cp.location_city,
    cp.location_region,
    cp.location_country,
    cp.location_country_code,
    cp.online_available,
    cp.in_person_available,
    cp.profile_image_url,
    COALESCE(cp.card_image_url, cp.profile_image_url) as card_image_url,
    cp.is_verified,
    cp.gym_affiliation,
    cp.selected_avatar_id,
    av.slug as avatar_slug,
    av.rarity as avatar_rarity,
    (ab.coach_id IS NOT NULL) as is_sponsored,
    -- Visibility score calculation
    CASE 
      WHEN ab.coach_id IS NOT NULL THEN 1000
      ELSE 0
    END +
    CASE 
      WHEN lower(cp.location_city) = lower(p_user_city) THEN 400
      WHEN lower(cp.location_region) = lower(p_user_region) THEN 300
      WHEN lower(cp.location_country_code) = lower(p_user_country_code) THEN 200
      WHEN cp.online_available = true THEN 100
      ELSE 0
    END as visibility_score,
    -- Location tier
    CASE 
      WHEN lower(cp.location_city) = lower(p_user_city) THEN 400
      WHEN lower(cp.location_region) = lower(p_user_region) THEN 300
      WHEN lower(cp.location_country_code) = lower(p_user_country_code) THEN 200
      WHEN cp.online_available = true THEN 100
      ELSE 0
    END as location_tier,
    COALESCE(cr.review_count, 0) as review_count,
    cr.avg_rating
  FROM coach_profiles cp
  LEFT JOIN avatars av ON cp.selected_avatar_id = av.id
  LEFT JOIN coach_reviews cr ON cp.id = cr.coach_id
  LEFT JOIN active_boosts ab ON cp.id = ab.coach_id
  WHERE 
    cp.marketplace_visible = true
    AND (cp.status IS NULL OR cp.status = 'active')
    AND cp.display_name IS NOT NULL
    AND cp.coach_types IS NOT NULL 
    AND array_length(cp.coach_types, 1) > 0
    -- Country filter
    AND (
      p_filter_country_code IS NULL 
      OR lower(cp.location_country_code) = lower(p_filter_country_code)
      OR (cp.online_available = true AND p_online_only = true)
    )
    -- Search term filter
    AND (
      p_search_term IS NULL 
      OR cp.display_name ILIKE '%' || p_search_term || '%'
      OR cp.bio ILIKE '%' || p_search_term || '%'
      OR cp.location_city ILIKE '%' || p_search_term || '%'
    )
    -- Coach types filter
    AND (
      p_coach_types IS NULL 
      OR cp.coach_types && p_coach_types
    )
    -- Price filters
    AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
    AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
    -- Online/in-person filters
    AND (p_online_only = false OR cp.online_available = true)
    AND (p_in_person_only = false OR cp.in_person_available = true)
  ORDER BY 
    (ab.coach_id IS NOT NULL) DESC,
    visibility_score DESC,
    COALESCE(cr.avg_rating, 0) DESC,
    cp.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches(text, text, text, text, text, text[], numeric, numeric, boolean, boolean, integer, double precision, double precision) TO anon;
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches(text, text, text, text, text, text[], numeric, numeric, boolean, boolean, integer, double precision, double precision) TO authenticated;