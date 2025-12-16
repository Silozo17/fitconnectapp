-- Create avatars table
CREATE TABLE public.avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'free' CHECK (category IN ('free', 'challenge_unlock', 'coach_exclusive')),
  unlock_type TEXT CHECK (unlock_type IN ('workout_count', 'habit_streak', 'progress_entries', 'progress_photos', 'macro_days', 'xp_total', 'leaderboard_rank', 'challenges_completed', 'coach_role')),
  unlock_threshold INTEGER,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_avatars table (tracks unlocked avatars)
CREATE TABLE public.user_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  avatar_id UUID NOT NULL REFERENCES public.avatars ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  unlock_source TEXT NOT NULL DEFAULT 'default' CHECK (unlock_source IN ('default', 'stat_unlock', 'coach_role', 'manual_grant')),
  UNIQUE(user_id, avatar_id)
);

-- Add selected_avatar_id to client_profiles
ALTER TABLE public.client_profiles 
ADD COLUMN selected_avatar_id UUID REFERENCES public.avatars;

-- Add selected_avatar_id to coach_profiles
ALTER TABLE public.coach_profiles 
ADD COLUMN selected_avatar_id UUID REFERENCES public.avatars;

-- Enable RLS
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;

-- RLS policies for avatars (public read)
CREATE POLICY "Anyone can view active avatars" ON public.avatars
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage avatars" ON public.avatars
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for user_avatars
CREATE POLICY "Users can view their own unlocked avatars" ON public.user_avatars
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view others unlocked avatars for leaderboard" ON public.user_avatars
FOR SELECT USING (true);

CREATE POLICY "System can manage user avatars" ON public.user_avatars
FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policy for avatars bucket (public read)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Admins can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND has_role(auth.uid(), 'admin'::app_role));

-- Seed all 19 avatars
INSERT INTO public.avatars (name, slug, description, category, unlock_type, unlock_threshold, rarity, sort_order) VALUES
-- 5 Free Avatars
('Strongman Bear', 'strongman_bear', 'A mighty bear ready to lift mountains', 'free', NULL, NULL, 'common', 1),
('Weightlifting Lion', 'weightlifting_lion', 'The king of the iron jungle', 'free', NULL, NULL, 'common', 2),
('CrossFit Wolf', 'crossfit_wolf', 'Pack mentality, individual strength', 'free', NULL, NULL, 'common', 3),
('Sprinter Cheetah', 'sprinter_cheetah', 'Built for explosive speed', 'free', NULL, NULL, 'common', 4),
('Parkour Monkey', 'parkour_monkey', 'Master of movement and agility', 'free', NULL, NULL, 'common', 5),

-- 13 Challenge-Locked Avatars
('Deadlift Boar', 'deadlift_boar', 'Raw power from the ground up', 'challenge_unlock', 'workout_count', 10, 'common', 6),
('Armoured Rhino', 'armoured_rhino', 'Unstoppable force of nature', 'challenge_unlock', 'workout_count', 50, 'uncommon', 7),
('Boxer Dog', 'boxer_dog', 'A true fighter with heart', 'challenge_unlock', 'workout_count', 100, 'rare', 8),
('HIIT Fox', 'hiit_fox', 'Quick bursts of pure intensity', 'challenge_unlock', 'habit_streak', 7, 'common', 9),
('Rogue Runner Cyborg', 'rogue_runner_cyborg', 'Half machine, all determination', 'challenge_unlock', 'habit_streak', 14, 'uncommon', 10),
('Kickboxer Panther', 'kickboxer_panther', 'Silent and deadly precision', 'challenge_unlock', 'habit_streak', 30, 'rare', 11),
('Martial Arts Crane', 'martial_arts_crane', 'Balance and grace in combat', 'challenge_unlock', 'progress_entries', 10, 'common', 12),
('Yoga Wolf', 'yoga_wolf', 'Strength through inner peace', 'challenge_unlock', 'progress_photos', 10, 'uncommon', 13),
('Shaolin Tiger', 'shaolin_tiger', 'Ancient discipline, modern power', 'challenge_unlock', 'macro_days', 30, 'rare', 14),
('Bodybuilder Bull', 'bodybuilder_bull', 'Massive gains, unstoppable drive', 'challenge_unlock', 'xp_total', 5000, 'uncommon', 15),
('Powerlifter Gorilla', 'powerlifter_gorilla', 'Primal strength unleashed', 'challenge_unlock', 'xp_total', 10000, 'rare', 16),
('Streetwear Gorilla Trainer', 'streetwear_gorilla_trainer', 'Style meets substance', 'challenge_unlock', 'leaderboard_rank', 10, 'epic', 17),
('Meditative Android Monk', 'meditative_android_monk', 'Transcending limits through focus', 'challenge_unlock', 'challenges_completed', 5, 'legendary', 18),

-- 1 Coach-Exclusive Avatar
('Elite Personal Trainer Human', 'elite_personal_trainer_human', 'The pinnacle of coaching excellence', 'coach_exclusive', 'coach_role', NULL, 'legendary', 19);