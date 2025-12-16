-- Allow public (anonymous) users to view limited profile data for leaderboard
CREATE POLICY "Public can view leaderboard profiles"
ON client_profiles FOR SELECT
TO anon
USING (leaderboard_visible = true);

-- Allow public (anonymous) users to view XP for leaderboard profiles
CREATE POLICY "Public can view XP for leaderboard profiles"
ON client_xp FOR SELECT
TO anon
USING (
  client_id IN (
    SELECT id FROM client_profiles WHERE leaderboard_visible = true
  )
);