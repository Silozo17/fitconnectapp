-- =====================================================
-- HARD RESET: Fix get_ranked_coaches function
-- This drops ALL overloads and recreates with the exact
-- signature that the frontend hooks expect
-- =====================================================

-- Step A: Drop ALL existing overloads of get_ranked_coaches
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure::text AS func_signature
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = 'get_ranked_coaches'
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
  END LOOP;
END $$;

-- Step B: Recreate with the EXACT parameter names the frontend uses
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
  -- Identity/profile
  id uuid,
  user_id uuid,
  username text,
  display_name text,
  bio text,
  -- Marketplace fields
  coach_types text[],
  certifications jsonb,
  experience_years integer,
  hourly_rate numeric,
  currency text,
  -- Location fields
  location text,
  location_city text,
  location_region text,
  location_country text,
  location_country_code text,
  -- Availability
  online_available boolean,
  in_person_available boolean,
  -- Media
  profile_image_url text,
  card_image_url text,
  -- Booking/verification
  booking_mode text,
  is_verified boolean,
  verified_at timestamptz,
  -- Other
  gym_affiliation text,
  marketplace_visible boolean,
  selected_avatar_id uuid,
  created_at timestamptz,
  onboarding_completed boolean,
  -- Social links
  who_i_work_with text,
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  x_url text,
  threads_url text,
  linkedin_url text,
  youtube_url text,
  -- Avatar data (flattened)
  avatar_slug text,
  avatar_rarity text,
  -- Ranking meta
  is_sponsored boolean,
  visibility_score numeric,
  location_tier integer,
  review_count bigint,
  avg_rating numeric,
  verified_qualification_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized_filter_country text;
  v_normalized_user_city text;
  v_normalized_user_region text;
BEGIN
  -- Normalize inputs for case-insensitive comparison
  v_normalized_filter_country := UPPER(TRIM(p_filter_country_code));
  v_normalized_user_city := LOWER(TRIM(p_user_city));
  v_normalized_user_region := LOWER(TRIM(p_user_region));
  
  RETURN QUERY
  WITH 
  -- Calculate review stats from the reviews table (which exists)
  review_stats AS (
    SELECT 
      r.coach_id,
      COUNT(*)::bigint AS review_count,
      ROUND(AVG(r.rating)::numeric, 2) AS avg_rating
    FROM reviews r
    WHERE r.is_public = true
    GROUP BY r.coach_id
  ),
  -- Count verified qualifications from coach_verification_documents (which exists)
  verified_quals AS (
    SELECT 
      cvd.coach_id,
      COUNT(*)::bigint AS verified_count
    FROM coach_verification_documents cvd
    WHERE cvd.status = 'approved'
    GROUP BY cvd.coach_id
  ),
  -- Check for active boosts
  active_boosts AS (
    SELECT 
      cb.coach_id,
      true AS is_boosted
    FROM coach_boosts cb
    WHERE cb.is_active = true
      AND cb.starts_at <= now()
      AND cb.ends_at > now()
  ),
  -- Main coach selection with ranking
  ranked_coaches AS (
    SELECT
      cp.id,
      cp.user_id,
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
      -- Sponsorship
      COALESCE(ab.is_boosted, false) AS is_sponsored,
      -- Review data
      COALESCE(rs.review_count, 0) AS review_count,
      rs.avg_rating,
      -- Verified qualifications
      COALESCE(vq.verified_count, 0) AS verified_qualification_count,
      -- Calculate location tier (1000=city, 700=region, 400=country, 300=online)
      CASE
        WHEN v_normalized_user_city IS NOT NULL 
             AND LOWER(TRIM(cp.location_city)) = v_normalized_user_city THEN 1000
        WHEN v_normalized_user_region IS NOT NULL 
             AND LOWER(TRIM(cp.location_region)) = v_normalized_user_region THEN 700
        WHEN p_user_country_code IS NOT NULL 
             AND UPPER(TRIM(cp.location_country_code)) = UPPER(TRIM(p_user_country_code)) THEN 400
        WHEN cp.online_available = true THEN 300
        ELSE 100
      END AS location_tier,
      -- Calculate visibility score (tier + boost bonus + verification bonus + completeness)
      (
        CASE
          WHEN v_normalized_user_city IS NOT NULL 
               AND LOWER(TRIM(cp.location_city)) = v_normalized_user_city THEN 1000
          WHEN v_normalized_user_region IS NOT NULL 
               AND LOWER(TRIM(cp.location_region)) = v_normalized_user_region THEN 700
          WHEN p_user_country_code IS NOT NULL 
               AND UPPER(TRIM(cp.location_country_code)) = UPPER(TRIM(p_user_country_code)) THEN 400
          WHEN cp.online_available = true THEN 300
          ELSE 100
        END
        + CASE WHEN COALESCE(ab.is_boosted, false) THEN 50 ELSE 0 END
        + CASE WHEN cp.is_verified THEN 25 ELSE 0 END
        + CASE WHEN cp.profile_image_url IS NOT NULL THEN 10 ELSE 0 END
        + CASE WHEN cp.bio IS NOT NULL AND LENGTH(cp.bio) > 50 THEN 10 ELSE 0 END
        + COALESCE(vq.verified_count, 0) * 5
      )::numeric AS visibility_score
    FROM coach_profiles cp
    LEFT JOIN avatars av ON cp.selected_avatar_id = av.id
    LEFT JOIN review_stats rs ON cp.id = rs.coach_id
    LEFT JOIN verified_quals vq ON cp.id = vq.coach_id
    LEFT JOIN active_boosts ab ON cp.id = ab.coach_id
    WHERE
      -- Must be visible in marketplace
      cp.marketplace_visible = true
      -- Must have completed onboarding
      AND cp.onboarding_completed = true
      -- Must be active (or null = active)
      AND (cp.status IS NULL OR cp.status = 'active')
      -- Country filter (if provided)
      AND (
        v_normalized_filter_country IS NULL 
        OR v_normalized_filter_country = ''
        OR UPPER(TRIM(cp.location_country_code)) = v_normalized_filter_country
      )
      -- Search filter
      AND (
        p_search_term IS NULL 
        OR p_search_term = ''
        OR cp.display_name ILIKE '%' || p_search_term || '%'
        OR cp.username ILIKE '%' || p_search_term || '%'
        OR cp.bio ILIKE '%' || p_search_term || '%'
        OR cp.location_city ILIKE '%' || p_search_term || '%'
      )
      -- Coach types filter
      AND (
        p_coach_types IS NULL 
        OR array_length(p_coach_types, 1) IS NULL
        OR cp.coach_types && p_coach_types
      )
      -- Price filters
      AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
      AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
      -- Availability filters
      AND (NOT p_online_only OR cp.online_available = true)
      AND (NOT p_in_person_only OR cp.in_person_available = true)
  )
  SELECT
    rc.id,
    rc.user_id,
    rc.username,
    rc.display_name,
    rc.bio,
    rc.coach_types,
    rc.certifications,
    rc.experience_years,
    rc.hourly_rate,
    rc.currency,
    rc.location,
    rc.location_city,
    rc.location_region,
    rc.location_country,
    rc.location_country_code,
    rc.online_available,
    rc.in_person_available,
    rc.profile_image_url,
    rc.card_image_url,
    rc.booking_mode,
    rc.is_verified,
    rc.verified_at,
    rc.gym_affiliation,
    rc.marketplace_visible,
    rc.selected_avatar_id,
    rc.created_at,
    rc.onboarding_completed,
    rc.who_i_work_with,
    rc.facebook_url,
    rc.instagram_url,
    rc.tiktok_url,
    rc.x_url,
    rc.threads_url,
    rc.linkedin_url,
    rc.youtube_url,
    rc.avatar_slug,
    rc.avatar_rarity,
    rc.is_sponsored,
    rc.visibility_score,
    rc.location_tier,
    rc.review_count,
    rc.avg_rating,
    rc.verified_qualification_count
  FROM ranked_coaches rc
  ORDER BY
    -- Sponsored coaches first within same tier
    rc.is_sponsored DESC,
    -- Then by location tier (higher = closer)
    rc.location_tier DESC,
    -- Then by visibility score
    rc.visibility_score DESC,
    -- Then by verified status
    rc.is_verified DESC,
    -- Finally by creation date (newer first)
    rc.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_ranked_coaches(
  text, text, text, text, text, text[], numeric, numeric, boolean, boolean, integer, numeric, numeric
) TO anon;

GRANT EXECUTE ON FUNCTION public.get_ranked_coaches(
  text, text, text, text, text, text[], numeric, numeric, boolean, boolean, integer, numeric, numeric
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_ranked_coaches(
  text, text, text, text, text, text[], numeric, numeric, boolean, boolean, integer, numeric, numeric
) TO service_role;