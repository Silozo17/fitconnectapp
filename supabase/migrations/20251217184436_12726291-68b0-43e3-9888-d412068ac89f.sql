-- Insert default platform contact and social media settings
INSERT INTO platform_settings (key, value, description) VALUES
  ('social_facebook', '"https://facebook.com/fitconnect"', 'Facebook page URL'),
  ('social_instagram', '"https://instagram.com/fitconnect"', 'Instagram profile URL'),
  ('social_tiktok', '"https://tiktok.com/@fitconnect"', 'TikTok profile URL'),
  ('social_x', '"https://x.com/fitconnect"', 'X (Twitter) profile URL'),
  ('social_youtube', '"https://youtube.com/@fitconnect"', 'YouTube channel URL'),
  ('contact_email', '"support@fitconnect.com"', 'Primary support email'),
  ('contact_phone', '"+44 800 123 4567"', 'Business phone number'),
  ('contact_address', '"FitConnect Ltd, London, UK"', 'Business address'),
  ('legal_email', '"legal@fitconnect.com"', 'Legal/compliance email'),
  ('privacy_email', '"privacy@fitconnect.com"', 'Privacy-related email')
ON CONFLICT (key) DO NOTHING;