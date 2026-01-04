-- Fix type mismatch in get_ranked_coaches function
-- Column 38 (distance_miles) returns double precision but expects NUMERIC

CREATE OR REPLACE FUNCTION public.get_ranked_coaches(
  p_user_lat DOUBLE PRECISION DEFAULT NULL,
  p_user_lng DOUBLE PRECISION DEFAULT NULL,
  p_user_city TEXT DEFAULT NULL,
  p_user_county TEXT DEFAULT NULL,
  p_user_country TEXT DEFAULT NULL,
  p_country_code TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  display_name TEXT,
  bio TEXT,
  profile_image_url TEXT,
  cover_image_url TEXT,
  coach_types TEXT[],
  specializations TEXT[],
  experience_years INTEGER,
  hourly_rate NUMERIC,
  currency TEXT,
  city TEXT,
  county TEXT,
  country TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  is_verified BOOLEAN,
  verification_status TEXT,
  availability_status TEXT,
  offers_online BOOLEAN,
  offers_in_person BOOLEAN,
  travel_radius_miles INTEGER,
  languages_spoken TEXT[],
  certifications JSONB,
  achievements JSONB,
  social_links JSONB,
  rating_average NUMERIC,
  rating_count INTEGER,
  total_clients INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  slug TEXT,
  is_accepting_clients BOOLEAN,
  profile_completeness INTEGER,
  boost_expires_at TIMESTAMPTZ,
  location_tier INTEGER,
  is_boosted BOOLEAN,
  base_score NUMERIC,
  distance_miles NUMERIC,
  final_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_coaches AS (
    SELECT 
      cp.id,
      cp.user_id,
      cp.display_name,
      cp.bio,
      cp.profile_image_url,
      cp.cover_image_url,
      cp.coach_types,
      cp.specializations,
      cp.experience_years,
      cp.hourly_rate,
      cp.currency,
      cp.city,
      cp.county,
      cp.country,
      cp.location_lat,
      cp.location_lng,
      cp.is_verified,
      cp.verification_status,
      cp.availability_status,
      cp.offers_online,
      cp.offers_in_person,
      cp.travel_radius_miles,
      cp.languages_spoken,
      cp.certifications,
      cp.achievements,
      cp.social_links,
      cp.rating_average,
      cp.rating_count,
      cp.total_clients,
      cp.created_at,
      cp.updated_at,
      cp.slug,
      cp.is_accepting_clients,
      cp.profile_completeness,
      cp.boost_expires_at,
      
      -- Calculate location tier (1=exact city, 2=same county, 3=same country, 4=global)
      CASE 
        WHEN p_user_city IS NOT NULL AND LOWER(cp.city) = LOWER(p_user_city) THEN 1
        WHEN p_user_county IS NOT NULL AND LOWER(cp.county) = LOWER(p_user_county) THEN 2
        WHEN p_user_country IS NOT NULL AND LOWER(cp.country) = LOWER(p_user_country) THEN 3
        WHEN p_country_code IS NOT NULL AND LOWER(cp.country) = LOWER(p_country_code) THEN 3
        ELSE 4
      END AS location_tier,
      
      -- Check if coach is currently boosted
      (cp.boost_expires_at IS NOT NULL AND cp.boost_expires_at > NOW()) AS is_boosted,
      
      -- Calculate base score from profile quality indicators
      (
        COALESCE(cp.profile_completeness, 0) * 0.3 +
        CASE WHEN cp.is_verified THEN 20 ELSE 0 END +
        LEAST(COALESCE(cp.rating_count, 0) * 2, 20) +
        LEAST(COALESCE(cp.total_clients, 0), 10) +
        CASE WHEN cp.rating_average >= 4.5 THEN 15 
             WHEN cp.rating_average >= 4.0 THEN 10 
             WHEN cp.rating_average >= 3.5 THEN 5 
             ELSE 0 END
      )::NUMERIC AS base_score,
      
      -- Calculate distance in miles using Haversine formula (cast to NUMERIC)
      (CASE 
        WHEN p_user_lat IS NOT NULL 
         AND p_user_lng IS NOT NULL 
         AND cp.location_lat IS NOT NULL 
         AND cp.location_lng IS NOT NULL 
        THEN (
          3959 * acos(
            LEAST(1, GREATEST(-1,
              cos(radians(p_user_lat)) * cos(radians(cp.location_lat)) * 
              cos(radians(cp.location_lng) - radians(p_user_lng)) + 
              sin(radians(p_user_lat)) * sin(radians(cp.location_lat))
            ))
          )
        )
        ELSE NULL
      END)::NUMERIC AS distance_miles
      
    FROM coach_profiles cp
    WHERE cp.status = 'active'
      AND cp.is_accepting_clients = true
      AND cp.profile_completeness >= 30
  )
  SELECT 
    rc.id,
    rc.user_id,
    rc.display_name,
    rc.bio,
    rc.profile_image_url,
    rc.cover_image_url,
    rc.coach_types,
    rc.specializations,
    rc.experience_years,
    rc.hourly_rate,
    rc.currency,
    rc.city,
    rc.county,
    rc.country,
    rc.location_lat,
    rc.location_lng,
    rc.is_verified,
    rc.verification_status,
    rc.availability_status,
    rc.offers_online,
    rc.offers_in_person,
    rc.travel_radius_miles,
    rc.languages_spoken,
    rc.certifications,
    rc.achievements,
    rc.social_links,
    rc.rating_average,
    rc.rating_count,
    rc.total_clients,
    rc.created_at,
    rc.updated_at,
    rc.slug,
    rc.is_accepting_clients,
    rc.profile_completeness,
    rc.boost_expires_at,
    rc.location_tier,
    rc.is_boosted,
    rc.base_score,
    rc.distance_miles,
    -- Calculate final score for ranking
    (
      rc.base_score +
      -- Location proximity bonus (closer = higher score)
      CASE rc.location_tier
        WHEN 1 THEN 50  -- Same city
        WHEN 2 THEN 30  -- Same county
        WHEN 3 THEN 15  -- Same country
        ELSE 0          -- Global
      END +
      -- Boost bonus
      CASE WHEN rc.is_boosted THEN 100 ELSE 0 END +
      -- Distance penalty (if we have coordinates)
      CASE 
        WHEN rc.distance_miles IS NOT NULL THEN
          GREATEST(0, 20 - (rc.distance_miles / 5))
        ELSE 0
      END
    )::NUMERIC AS final_score
  FROM ranked_coaches rc
  ORDER BY 
    rc.is_boosted DESC,
    rc.location_tier ASC,
    (
      rc.base_score +
      CASE rc.location_tier
        WHEN 1 THEN 50
        WHEN 2 THEN 30
        WHEN 3 THEN 15
        ELSE 0
      END +
      CASE WHEN rc.is_boosted THEN 100 ELSE 0 END +
      CASE 
        WHEN rc.distance_miles IS NOT NULL THEN
          GREATEST(0, 20 - (rc.distance_miles / 5))
        ELSE 0
      END
    ) DESC,
    rc.rating_average DESC NULLS LAST,
    rc.created_at DESC
  LIMIT p_limit;
END;
$$;