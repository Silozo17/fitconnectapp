-- Drop existing function and recreate with all display fields
DROP FUNCTION IF EXISTS public.get_simple_coaches(TEXT, INTEGER);

CREATE OR REPLACE FUNCTION public.get_simple_coaches(
  p_filter_country_code TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  profile_image_url TEXT,
  location_country TEXT,
  location_country_code TEXT,
  created_at TIMESTAMPTZ,
  bio TEXT,
  coach_types TEXT[],
  hourly_rate NUMERIC,
  currency TEXT,
  online_available BOOLEAN,
  in_person_available BOOLEAN,
  location TEXT,
  location_city TEXT,
  card_image_url TEXT,
  is_verified BOOLEAN,
  verified_at TIMESTAMPTZ,
  gym_affiliation TEXT,
  avg_rating NUMERIC,
  review_count BIGINT,
  is_sponsored BOOLEAN,
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
    cp.profile_image_url,
    cp.location_country,
    cp.location_country_code,
    cp.created_at,
    cp.bio,
    cp.coach_types,
    cp.hourly_rate,
    cp.currency,
    cp.online_available,
    cp.in_person_available,
    cp.location,
    cp.location_city,
    cp.card_image_url,
    cp.is_verified,
    cp.verified_at,
    cp.gym_affiliation,
    COALESCE(r.avg_rating, 0::NUMERIC) AS avg_rating,
    COALESCE(r.review_count, 0::BIGINT) AS review_count,
    COALESCE(cb.is_active AND NOW() >= cb.boost_start_date AND NOW() <= cb.boost_end_date, FALSE) AS is_sponsored,
    COALESCE(cq.qualified_count, 0::BIGINT) AS verified_qualification_count
  FROM coach_profiles cp
  LEFT JOIN LATERAL (
    SELECT 
      AVG(rv.rating)::NUMERIC AS avg_rating,
      COUNT(*)::BIGINT AS review_count
    FROM reviews rv
    WHERE rv.coach_id = cp.id AND rv.is_public = TRUE
  ) r ON TRUE
  LEFT JOIN coach_boosts cb ON cb.coach_id = cp.id
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::BIGINT AS qualified_count
    FROM coach_qualifications q
    WHERE q.coach_id = cp.id AND q.is_verified = TRUE
  ) cq ON TRUE
  WHERE
    cp.marketplace_visible = TRUE
    AND cp.onboarding_completed = TRUE
    AND (cp.status IS NULL OR cp.status = 'active')
    AND (
      p_filter_country_code IS NULL 
      OR UPPER(TRIM(cp.location_country_code)) = UPPER(TRIM(p_filter_country_code))
    )
  ORDER BY cp.created_at DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_simple_coaches(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_simple_coaches(TEXT, INTEGER) TO anon;