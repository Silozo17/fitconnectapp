-- Insert the Founder badge for FitConnect founding coaches
INSERT INTO badges (
  name,
  description, 
  category,
  icon,
  image_url,
  rarity,
  xp_reward,
  criteria,
  is_active
) VALUES (
  'Founder',
  'Exclusive badge for FitConnect founding coaches',
  'coach_milestone',
  'Sparkles',
  'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/founder.png',
  'legendary',
  500,
  '{"type": "subscription_tier", "value": "founder"}',
  true
);