-- Coach badges/achievements table
CREATE TABLE public.coach_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  source_data JSONB,
  is_featured BOOLEAN DEFAULT false,
  UNIQUE(coach_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.coach_badges ENABLE ROW LEVEL SECURITY;

-- Coaches can view their own badges
CREATE POLICY "Coaches can view own badges" ON public.coach_badges
  FOR SELECT USING (coach_id IN (
    SELECT id FROM coach_profiles WHERE user_id = auth.uid()
  ));

-- Public can view coach badges (for display on profiles)
CREATE POLICY "Public can view coach badges" ON public.coach_badges
  FOR SELECT TO anon USING (true);

-- System can insert badges (for automatic awards)
CREATE POLICY "Service role can manage coach badges" ON public.coach_badges
  FOR ALL USING (true);

-- Insert coach-specific badges
INSERT INTO public.badges (name, description, category, icon, rarity, xp_reward, criteria, is_active) VALUES
-- Profile completion badges
('Profile Starter', 'Complete 50% of your coach profile', 'coach_profile', '📝', 'common', 0, '{"type": "profile_completion", "value": 50}', true),
('Profile Pro', 'Complete 100% of your coach profile', 'coach_profile', '⭐', 'rare', 0, '{"type": "profile_completion", "value": 100}', true),

-- Milestone badges  
('First Client', 'Accept your first client connection', 'coach_milestone', '🤝', 'common', 0, '{"type": "client_count", "value": 1}', true),
('Growing Business', 'Reach 10 active clients', 'coach_milestone', '📈', 'uncommon', 0, '{"type": "client_count", "value": 10}', true),
('Coaching Star', 'Reach 50 active clients', 'coach_milestone', '🌟', 'rare', 0, '{"type": "client_count", "value": 50}', true),
('Coaching Legend', 'Reach 100 active clients', 'coach_milestone', '👑', 'legendary', 0, '{"type": "client_count", "value": 100}', true),

-- Session badges
('First Session', 'Complete your first coaching session', 'coach_milestone', '💪', 'common', 0, '{"type": "session_count", "value": 1}', true),
('Session Pro', 'Complete 50 coaching sessions', 'coach_milestone', '🏋️', 'uncommon', 0, '{"type": "session_count", "value": 50}', true),
('Session Master', 'Complete 500 coaching sessions', 'coach_milestone', '🎖️', 'epic', 0, '{"type": "session_count", "value": 500}', true),

-- Review badges
('First Review', 'Receive your first client review', 'coach_milestone', '⭐', 'common', 0, '{"type": "review_count", "value": 1}', true),
('Highly Rated', 'Maintain 4.5+ rating with 10+ reviews', 'coach_milestone', '🌟', 'rare', 0, '{"type": "rating_threshold", "rating": 4.5, "min_reviews": 10}', true),
('Top Rated', 'Maintain 4.8+ rating with 50+ reviews', 'coach_milestone', '🏆', 'legendary', 0, '{"type": "rating_threshold", "rating": 4.8, "min_reviews": 50}', true),

-- Verification badge
('Verified Coach', 'Complete the verification process', 'coach_milestone', '✓', 'rare', 0, '{"type": "verification", "value": true}', true),

-- Revenue badges
('First Earning', 'Receive your first payment', 'coach_milestone', '💰', 'common', 0, '{"type": "revenue_milestone", "value": 1}', true),
('Rising Star', 'Earn £1,000 through the platform', 'coach_milestone', '💵', 'uncommon', 0, '{"type": "revenue_milestone", "value": 1000}', true),
('Business Builder', 'Earn £10,000 through the platform', 'coach_milestone', '💎', 'epic', 0, '{"type": "revenue_milestone", "value": 10000}', true);