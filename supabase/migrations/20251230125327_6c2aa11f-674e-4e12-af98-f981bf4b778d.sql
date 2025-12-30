-- Create RPC for public leaderboard data (GDPR-safe, no user IDs exposed)
CREATE OR REPLACE FUNCTION public.get_public_leaderboard(
  p_location_type TEXT DEFAULT 'global',
  p_location_value TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 25,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  rank BIGINT,
  display_name TEXT,
  city TEXT,
  county TEXT,
  country TEXT,
  level INTEGER,
  total_xp INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY cx.total_xp DESC)::BIGINT as rank,
    COALESCE(cp.leaderboard_display_name, 'Anonymous')::TEXT as display_name,
    cp.city::TEXT,
    cp.county::TEXT,
    cp.country::TEXT,
    COALESCE(cx.current_level, 1)::INTEGER as level,
    COALESCE(cx.total_xp, 0)::INTEGER as total_xp
  FROM client_profiles cp
  LEFT JOIN client_xp cx ON cp.id = cx.client_id
  WHERE cp.leaderboard_visible = true
    AND (cp.status IS NULL OR cp.status = 'active')
    AND (
      p_location_type = 'global'
      OR (p_location_type = 'city' AND cp.city = p_location_value)
      OR (p_location_type = 'county' AND cp.county = p_location_value)
      OR (p_location_type = 'country' AND cp.country = p_location_value)
    )
  ORDER BY cx.total_xp DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create RPC for leaderboard count
CREATE OR REPLACE FUNCTION public.get_public_leaderboard_count(
  p_location_type TEXT DEFAULT 'global',
  p_location_value TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM client_profiles cp
  WHERE cp.leaderboard_visible = true
    AND (cp.status IS NULL OR cp.status = 'active')
    AND (
      p_location_type = 'global'
      OR (p_location_type = 'city' AND cp.city = p_location_value)
      OR (p_location_type = 'county' AND cp.county = p_location_value)
      OR (p_location_type = 'country' AND cp.country = p_location_value)
    );
  RETURN v_count;
END;
$$;

-- Create RPC for location options
CREATE OR REPLACE FUNCTION public.get_leaderboard_locations(
  p_location_type TEXT
)
RETURNS TABLE (
  location_value TEXT,
  user_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_location_type = 'city' THEN
    RETURN QUERY
    SELECT cp.city::TEXT, COUNT(*)::INTEGER
    FROM client_profiles cp
    WHERE cp.leaderboard_visible = true 
      AND (cp.status IS NULL OR cp.status = 'active') 
      AND cp.city IS NOT NULL
    GROUP BY cp.city ORDER BY COUNT(*) DESC;
  ELSIF p_location_type = 'county' THEN
    RETURN QUERY
    SELECT cp.county::TEXT, COUNT(*)::INTEGER
    FROM client_profiles cp
    WHERE cp.leaderboard_visible = true 
      AND (cp.status IS NULL OR cp.status = 'active') 
      AND cp.county IS NOT NULL
    GROUP BY cp.county ORDER BY COUNT(*) DESC;
  ELSIF p_location_type = 'country' THEN
    RETURN QUERY
    SELECT cp.country::TEXT, COUNT(*)::INTEGER
    FROM client_profiles cp
    WHERE cp.leaderboard_visible = true 
      AND (cp.status IS NULL OR cp.status = 'active') 
      AND cp.country IS NOT NULL
    GROUP BY cp.country ORDER BY COUNT(*) DESC;
  END IF;
END;
$$;

-- Grant execute permissions to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_leaderboard TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_leaderboard_count TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_leaderboard_count TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_locations TO anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_locations TO authenticated;