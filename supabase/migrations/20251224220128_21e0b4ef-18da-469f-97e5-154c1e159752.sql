-- Create a function to efficiently calculate leaderboard rank server-side
-- This avoids fetching ALL client_xp rows to calculate a single user's rank
CREATE OR REPLACE FUNCTION get_client_leaderboard_rank(client_id_param uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
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