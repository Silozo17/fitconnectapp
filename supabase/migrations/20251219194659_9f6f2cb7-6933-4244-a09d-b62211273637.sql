-- Allow anonymous and authenticated users to read only stat-related settings
CREATE POLICY "Anyone can view public stats"
ON public.platform_settings
FOR SELECT
TO anon, authenticated
USING (key IN ('stat_total_users', 'stat_total_coaches', 'stat_avg_rating'));