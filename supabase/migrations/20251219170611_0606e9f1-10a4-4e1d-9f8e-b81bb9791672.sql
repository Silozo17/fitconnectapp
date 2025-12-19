-- Add platform stats settings for admin control
INSERT INTO platform_settings (key, value, description)
VALUES 
  ('stat_total_users', '0', 'Display count for total users (0 = live from database)'),
  ('stat_total_coaches', '0', 'Display count for total coaches (0 = live from database)'),
  ('stat_avg_rating', '4.9', 'Display average rating')
ON CONFLICT (key) DO NOTHING;