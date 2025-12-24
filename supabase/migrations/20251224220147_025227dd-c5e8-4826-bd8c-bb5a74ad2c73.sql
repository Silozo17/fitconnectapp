-- Fix function search path mutable security warning
CREATE OR REPLACE FUNCTION get_client_leaderboard_rank(client_id_param uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT rank::integer 
      FROM (
        SELECT client_id, ROW_NUMBER() OVER (ORDER BY total_xp DESC) as rank
        FROM client_xp
      ) ranked
      WHERE ranked.client_id = client_id_param
    ),
    0
  );
$$;