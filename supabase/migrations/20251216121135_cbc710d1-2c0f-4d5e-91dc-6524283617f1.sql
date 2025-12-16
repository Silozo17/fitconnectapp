-- Phase 14: Gamification System

-- Create client_xp table for tracking XP and levels
CREATE TABLE public.client_xp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create xp_transactions table for XP history
CREATE TABLE public.xp_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id UUID,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table for badge definitions
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'milestone',
  icon TEXT NOT NULL DEFAULT '🏆',
  rarity TEXT NOT NULL DEFAULT 'common',
  xp_reward INTEGER NOT NULL DEFAULT 50,
  criteria JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_badges table for earned badges
CREATE TABLE public.client_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source_data JSONB,
  is_featured BOOLEAN DEFAULT false,
  UNIQUE(client_id, badge_id)
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL DEFAULT 'habit_streak',
  target_value INTEGER NOT NULL DEFAULT 7,
  target_unit TEXT NOT NULL DEFAULT 'days',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  badge_reward_id UUID REFERENCES public.badges(id),
  visibility TEXT NOT NULL DEFAULT 'public',
  max_participants INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge_participants table
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(challenge_id, client_id)
);

-- Create leaderboard_entries table
CREATE TABLE public.leaderboard_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  period_type TEXT NOT NULL DEFAULT 'weekly',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_xp INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.client_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_xp
CREATE POLICY "Clients can view their own XP"
ON public.client_xp FOR SELECT
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can manage client XP"
ON public.client_xp FOR ALL
USING (true) WITH CHECK (true);

-- RLS Policies for xp_transactions
CREATE POLICY "Clients can view their own XP transactions"
ON public.xp_transactions FOR SELECT
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert XP transactions"
ON public.xp_transactions FOR INSERT
WITH CHECK (true);

-- RLS Policies for badges
CREATE POLICY "Anyone can view active badges"
ON public.badges FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage badges"
ON public.badges FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for client_badges
CREATE POLICY "Clients can view their own badges"
ON public.client_badges FOR SELECT
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view featured badges"
ON public.client_badges FOR SELECT
USING (is_featured = true);

CREATE POLICY "System can manage client badges"
ON public.client_badges FOR ALL
USING (true) WITH CHECK (true);

-- RLS Policies for challenges
CREATE POLICY "Anyone can view public active challenges"
ON public.challenges FOR SELECT
USING (is_active = true AND visibility = 'public');

CREATE POLICY "Coaches can manage their challenges"
ON public.challenges FOR ALL
USING (created_by IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all challenges"
ON public.challenges FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for challenge_participants
CREATE POLICY "Clients can view their challenge participation"
ON public.challenge_participants FOR SELECT
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can join challenges"
ON public.challenge_participants FOR INSERT
WITH CHECK (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can update their participation"
ON public.challenge_participants FOR UPDATE
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

-- RLS Policies for leaderboard_entries
CREATE POLICY "Anyone can view leaderboard"
ON public.leaderboard_entries FOR SELECT
USING (true);

CREATE POLICY "System can manage leaderboard entries"
ON public.leaderboard_entries FOR ALL
USING (true) WITH CHECK (true);

-- Add updated_at trigger for client_xp
CREATE TRIGGER update_client_xp_updated_at
BEFORE UPDATE ON public.client_xp
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert predefined badges
INSERT INTO public.badges (name, description, category, icon, rarity, xp_reward, criteria) VALUES
-- Workout Badges
('First Step', 'Complete your first workout', 'workout', '👟', 'common', 25, '{"type": "workout_count", "value": 1}'),
('Getting Fit', 'Complete 10 workouts', 'workout', '💪', 'common', 50, '{"type": "workout_count", "value": 10}'),
('Iron Will', 'Complete 50 workouts', 'workout', '🏋️', 'rare', 150, '{"type": "workout_count", "value": 50}'),
('Marathon Runner', 'Complete 100 workouts', 'workout', '🏃', 'epic', 300, '{"type": "workout_count", "value": 100}'),
('Unstoppable', 'Complete 365 workouts in a year', 'workout', '⚡', 'legendary', 1000, '{"type": "workout_count", "value": 365}'),

-- Streak Badges
('Getting Started', 'Maintain a 3-day habit streak', 'streak', '🔥', 'common', 25, '{"type": "streak_days", "value": 3}'),
('Week Warrior', 'Maintain a 7-day habit streak', 'streak', '🗓️', 'uncommon', 75, '{"type": "streak_days", "value": 7}'),
('Fortnight Fighter', 'Maintain a 14-day habit streak', 'streak', '⚔️', 'rare', 150, '{"type": "streak_days", "value": 14}'),
('Monthly Master', 'Maintain a 30-day habit streak', 'streak', '👑', 'epic', 400, '{"type": "streak_days", "value": 30}'),
('Century Club', 'Maintain a 100-day habit streak', 'streak', '💯', 'legendary', 1000, '{"type": "streak_days", "value": 100}'),

-- Progress Badges
('Progress Tracker', 'Log your first progress entry', 'progress', '📊', 'common', 25, '{"type": "progress_count", "value": 1}'),
('Consistent Logger', 'Log 10 progress entries', 'progress', '📈', 'uncommon', 75, '{"type": "progress_count", "value": 10}'),
('Transformation Journey', 'Upload 10 progress photos', 'progress', '📸', 'rare', 150, '{"type": "photo_count", "value": 10}'),
('Goal Crusher', 'Achieve your first fitness goal', 'progress', '🎯', 'rare', 200, '{"type": "goal_achieved", "value": 1}'),

-- Nutrition Badges
('Meal Planner', 'Follow your meal plan for 7 days', 'nutrition', '🥗', 'uncommon', 75, '{"type": "meal_days", "value": 7}'),
('Macro Master', 'Hit your macro targets 30 days', 'nutrition', '🧮', 'rare', 200, '{"type": "macro_days", "value": 30}'),
('Nutrition Ninja', 'Complete 90 days of nutrition tracking', 'nutrition', '🥷', 'epic', 400, '{"type": "nutrition_days", "value": 90}'),

-- Challenge Badges
('Challenger', 'Join your first challenge', 'challenge', '🎪', 'common', 25, '{"type": "challenge_joined", "value": 1}'),
('Competitor', 'Complete 5 challenges', 'challenge', '🏅', 'uncommon', 100, '{"type": "challenge_completed", "value": 5}'),
('Champion', 'Win a challenge', 'challenge', '🏆', 'rare', 250, '{"type": "challenge_won", "value": 1}'),
('Undefeated', 'Win 10 challenges', 'challenge', '👊', 'legendary', 1000, '{"type": "challenge_won", "value": 10}'),

-- Social Badges
('Connected', 'Connect with your first coach', 'social', '🤝', 'common', 25, '{"type": "coach_connected", "value": 1}'),
('Community Member', 'Appear on the leaderboard', 'social', '👥', 'common', 25, '{"type": "leaderboard_entry", "value": 1}'),
('Top 10', 'Reach top 10 on weekly leaderboard', 'social', '🔟', 'rare', 200, '{"type": "leaderboard_rank", "value": 10}'),
('Number One', 'Reach #1 on any leaderboard', 'social', '🥇', 'legendary', 500, '{"type": "leaderboard_rank", "value": 1}'),

-- Milestone Badges
('Early Bird', 'Complete a workout before 7am', 'milestone', '🌅', 'uncommon', 50, '{"type": "early_workout", "value": 1}'),
('Night Owl', 'Complete a workout after 9pm', 'milestone', '🌙', 'uncommon', 50, '{"type": "late_workout", "value": 1}'),
('Weekend Warrior', 'Work out every weekend for a month', 'milestone', '🎉', 'rare', 150, '{"type": "weekend_workouts", "value": 8}');