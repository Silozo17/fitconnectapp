-- Drop all existing versions of get_ranked_coaches to avoid ambiguity
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

-- Create the single correct version matching our actual schema
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
  certifications jsonb,
  experience_years integer,
  hourly_rate numeric,
  currency text,
  location text,
  location_city text,
  location_region text,
  location_country text,
  location_country_code text,
  online_available boolean,
  in_person_available boolean,
  profile_image_url text,
  card_image_url text,
  booking_mode text,
  is_verified boolean,
  verified_at timestamptz,
  gym_affiliation text,
  marketplace_visible boolean,
  selected_avatar_id uuid,
  created_at timestamptz,
  onboarding_completed boolean,
  who_i_work_with text,
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  x_url text,
  threads_url text,
  linkedin_url text,
  youtube_url text,
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
      COUNT(*)::bigint AS review_count,
      ROUND(AVG(r.rating)::numeric, 1) AS avg_rating
    FROM reviews r
    WHERE r.is_public = true
    GROUP BY r.coach_id
  ),
  coach_boosts AS (
    SELECT 
      cb.coach_id,
      true AS is_boosted
    FROM coach_boosts cb
    WHERE cb.is_active = true
      AND cb.expires_at > NOW()
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
    cp.location,
    cp.location_city,
    cp.location_region,
    cp.location_country,
    cp.location_country_code,
    cp.online_available,
    cp.in_person_available,
    cp.profile_image_url,
    COALESCE(cp.card_image_url, cp.profile_image_url) AS card_image_url,
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
    av.slug AS avatar_slug,
    av.rarity AS avatar_rarity,
    COALESCE(cb.is_boosted, false) AS is_sponsored,
    -- Visibility score: boosted coaches get priority
    CASE WHEN cb.is_boosted THEN 10000 ELSE 0 END +
    COALESCE(cr.review_count::integer, 0) * 10 +
    CASE WHEN cp.is_verified THEN 500 ELSE 0 END AS visibility_score,
    -- Location tier scoring
    CASE
      WHEN p_user_city IS NOT NULL AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 1000
      WHEN p_user_region IS NOT NULL AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 700
      WHEN p_user_country_code IS NOT NULL AND LOWER(cp.location_country_code) = LOWER(p_user_country_code) THEN 400
      WHEN cp.online_available = true AND cp.in_person_available = false THEN 300
      ELSE 100
    END AS location_tier,
    COALESCE(cr.review_count, 0) AS review_count,
    cr.avg_rating
  FROM coach_profiles cp
  LEFT JOIN coach_reviews cr ON cr.coach_id = cp.id
  LEFT JOIN coach_boosts cb ON cb.coach_id = cp.id
  LEFT JOIN avatars av ON av.id = cp.selected_avatar_id
  WHERE 
    -- Core visibility requirements (NOT blocking on onboarding_completed or Stripe)
    cp.marketplace_visible = true
    AND cp.display_name IS NOT NULL
    AND cp.coach_types IS NOT NULL
    AND array_length(cp.coach_types, 1) > 0
    AND (cp.status IS NULL OR cp.status = 'active')
    -- Country filter
    AND (
      p_filter_country_code IS NULL 
      OR LOWER(cp.location_country_code) = LOWER(p_filter_country_code)
      OR (cp.online_available = true AND cp.in_person_available = false)
    )
    -- Search term filter
    AND (
      p_search_term IS NULL 
      OR p_search_term = ''
      OR cp.display_name ILIKE '%' || p_search_term || '%'
      OR cp.bio ILIKE '%' || p_search_term || '%'
      OR cp.location_city ILIKE '%' || p_search_term || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(cp.coach_types) AS ct 
        WHERE ct ILIKE '%' || p_search_term || '%'
      )
    )
    -- Coach types filter
    AND (
      p_coach_types IS NULL 
      OR array_length(p_coach_types, 1) IS NULL
      OR cp.coach_types && p_coach_types
    )
    -- Price range filters
    AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
    AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
    -- Online/in-person filters
    AND (p_online_only = false OR cp.online_available = true)
    AND (p_in_person_only = false OR cp.in_person_available = true)
  ORDER BY 
    COALESCE(cb.is_boosted, false) DESC,
    location_tier DESC,
    visibility_score DESC,
    cr.avg_rating DESC NULLS LAST,
    cp.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches(
  text, text, text, text, text, text[], numeric, numeric, boolean, boolean, integer, double precision, double precision
) TO anon, authenticated;