-- PHASE 1: FULL FUNCTION RESET
-- Drop ALL existing overloads completely

DROP FUNCTION IF EXISTS public.get_simple_coaches(text, text, text[], numeric, numeric, boolean, boolean, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_ranked_coaches(text, text, text, text, text, text[], numeric, numeric, boolean, boolean, integer, double precision, double precision) CASCADE;
DROP FUNCTION IF EXISTS public.get_ranked_coaches CASCADE;
DROP FUNCTION IF EXISTS public.get_simple_coaches CASCADE;

-- PHASE 2: CREATE ONE MINIMAL BULLETPROOF FUNCTION
-- NO joins, NO reviews, NO boosts, NO avatars, NO tags, NO ranking

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
  created_at TIMESTAMPTZ
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
    cp.created_at
  FROM coach_profiles cp
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_simple_coaches(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_simple_coaches(TEXT, INTEGER) TO anon;