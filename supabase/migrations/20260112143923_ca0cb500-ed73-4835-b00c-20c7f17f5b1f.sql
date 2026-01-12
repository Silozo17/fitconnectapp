-- Drop all existing versions of get_ranked_coaches to resolve ambiguity
DROP FUNCTION IF EXISTS public.get_ranked_coaches(
  p_user_city text, p_user_region text, p_user_country_code text, 
  p_filter_country_code text, p_search_term text, p_coach_types text[], 
  p_min_price numeric, p_max_price numeric, p_online_only boolean, 
  p_in_person_only boolean, p_limit integer, p_user_lat numeric, p_user_lng numeric
);

DROP FUNCTION IF EXISTS public.get_ranked_coaches(
  p_user_lat double precision, p_user_lng double precision, p_user_city text, 
  p_user_county text, p_user_country text, p_country_code text, p_limit integer
);

DROP FUNCTION IF EXISTS public.get_ranked_coaches(
  p_user_city text, p_user_region text, p_user_country_code text, 
  p_filter_country_code text, p_search_term text, p_coach_types text[], 
  p_min_price numeric, p_max_price numeric, p_online_only boolean, 
  p_in_person_only boolean, p_limit integer, p_user_lat double precision, p_user_lng double precision
);

-- Create the single correct version
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
  p_user_lat numeric DEFAULT NULL,
  p_user_lng numeric DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  display_name text,
  bio text,
  coach_types text[],
  city text,
  country text,
  country_code text,
  location_lat double precision,
  location_lng double precision,
  card_image_url text,
  profile_image_url text,
  gallery_images text[],
  hourly_rate numeric,
  currency text,
  rating_average numeric,
  review_count bigint,
  is_online boolean,
  is_in_person boolean,
  years_experience integer,
  is_boosted boolean,
  boost_expires_at timestamptz,
  certifications jsonb,
  distance_km double precision,
  rank_score double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_boost_weight constant numeric := 1000;
  v_distance_weight constant numeric := 50;
  v_rating_weight constant numeric := 20;
  v_review_weight constant numeric := 5;
  v_experience_weight constant numeric := 2;
BEGIN
  RETURN QUERY
  WITH coach_stats AS (
    SELECT 
      r.coach_id,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(r.id) as total_reviews
    FROM reviews r
    WHERE r.is_approved = true
    GROUP BY r.coach_id
  ),
  ranked_coaches AS (
    SELECT 
      cp.id,
      cp.display_name,
      cp.bio,
      cp.coach_types,
      cp.city,
      cp.country,
      cp.country_code,
      cp.location_lat,
      cp.location_lng,
      COALESCE(cp.card_image_url, cp.profile_image_url) as card_image_url,
      cp.profile_image_url,
      cp.gallery_images,
      cp.hourly_rate,
      cp.currency,
      COALESCE(cs.avg_rating, 0) as rating_average,
      COALESCE(cs.total_reviews, 0) as review_count,
      cp.is_online,
      cp.is_in_person,
      cp.years_experience,
      COALESCE(cp.is_boosted, false) as is_boosted,
      cp.boost_expires_at,
      cp.certifications,
      CASE 
        WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL 
             AND cp.location_lat IS NOT NULL AND cp.location_lng IS NOT NULL THEN
          6371 * acos(
            cos(radians(p_user_lat)) * cos(radians(cp.location_lat)) *
            cos(radians(cp.location_lng) - radians(p_user_lng)) +
            sin(radians(p_user_lat)) * sin(radians(cp.location_lat))
          )
        ELSE NULL
      END as distance_km,
      (
        CASE WHEN cp.is_boosted = true AND cp.boost_expires_at > now() THEN v_boost_weight ELSE 0 END +
        CASE 
          WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL 
               AND cp.location_lat IS NOT NULL AND cp.location_lng IS NOT NULL THEN
            v_distance_weight / NULLIF(1 + 6371 * acos(
              cos(radians(p_user_lat)) * cos(radians(cp.location_lat)) *
              cos(radians(cp.location_lng) - radians(p_user_lng)) +
              sin(radians(p_user_lat)) * sin(radians(cp.location_lat))
            ), 0)
          ELSE 0
        END +
        COALESCE(cs.avg_rating, 0) * v_rating_weight +
        LEAST(COALESCE(cs.total_reviews, 0), 50) * v_review_weight +
        COALESCE(cp.years_experience, 0) * v_experience_weight
      ) as rank_score
    FROM coach_profiles cp
    LEFT JOIN coach_stats cs ON cs.coach_id = cp.id
    WHERE cp.marketplace_visible = true
      AND cp.display_name IS NOT NULL
      AND cp.coach_types IS NOT NULL
      AND array_length(cp.coach_types, 1) > 0
      AND (p_filter_country_code IS NULL OR cp.country_code = p_filter_country_code)
      AND (p_search_term IS NULL OR 
           cp.display_name ILIKE '%' || p_search_term || '%' OR
           cp.bio ILIKE '%' || p_search_term || '%' OR
           cp.city ILIKE '%' || p_search_term || '%')
      AND (p_coach_types IS NULL OR cp.coach_types && p_coach_types)
      AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
      AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
      AND (p_online_only = false OR cp.is_online = true)
      AND (p_in_person_only = false OR cp.is_in_person = true)
  )
  SELECT 
    rc.id,
    rc.display_name,
    rc.bio,
    rc.coach_types,
    rc.city,
    rc.country,
    rc.country_code,
    rc.location_lat,
    rc.location_lng,
    rc.card_image_url,
    rc.profile_image_url,
    rc.gallery_images,
    rc.hourly_rate,
    rc.currency,
    rc.rating_average,
    rc.review_count,
    rc.is_online,
    rc.is_in_person,
    rc.years_experience,
    rc.is_boosted,
    rc.boost_expires_at,
    rc.certifications,
    rc.distance_km,
    rc.rank_score
  FROM ranked_coaches rc
  ORDER BY rc.rank_score DESC NULLS LAST
  LIMIT p_limit;
END;
$$;