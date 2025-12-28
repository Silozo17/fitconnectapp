-- Add gender column to avatars table
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'male';

-- Create index for efficient gender filtering
CREATE INDEX IF NOT EXISTS idx_avatars_gender ON avatars(gender);

-- Update existing avatars to be male (ensure no NULLs)
UPDATE avatars SET gender = 'male' WHERE gender IS NULL;

-- Insert all 20 female avatars with matching rarity/unlock rules from male equivalents
INSERT INTO avatars (name, slug, description, category, unlock_type, unlock_threshold, rarity, gender, is_active, sort_order) VALUES
-- 5 Free common avatars (matching male equivalents: strongman_bear, weightlifting_lion, crossfit_wolf, sprinter_cheetah, parkour_monkey)
('Strongwoman Bear', 'strongwoman_bear_female', 'A powerful female bear ready to lift', 'free', NULL, NULL, 'common', 'female', true, 101),
('Weightlifting Tigress', 'weightlifting_tigress', 'A fierce tigress at the gym', 'free', NULL, NULL, 'common', 'female', true, 102),
('CrossFit Wolf', 'crossfit_wolf_female', 'A determined she-wolf crushing WODs', 'free', NULL, NULL, 'common', 'female', true, 103),
('Sprinter Cheetah', 'sprinter_cheetah_female', 'The fastest female feline on track', 'free', NULL, NULL, 'common', 'female', true, 104),
('Parkour Monkey', 'parkour_monkey_female', 'A nimble female monkey master of parkour', 'free', NULL, NULL, 'common', 'female', true, 105),

-- 2 Common challenge unlocks (matching hiit_fox: habit_streak 7, martial_arts_crane: progress_entries 10)
('HIIT Fox', 'hiit_fox_female', 'A swift vixen burning calories', 'challenge_unlock', 'habit_streak', 7, 'common', 'female', true, 106),
('Martial Arts Crane', 'martial_arts_crane_female', 'A graceful crane with deadly precision', 'challenge_unlock', 'progress_entries', 10, 'common', 'female', true, 107),

-- 5 Uncommon (matching armoured_rhino: workout_count 50, bodybuilder_bull: xp_total 5000, rogue_runner_cyborg: habit_streak 14, yoga_wolf: progress_photos 10)
('Armoured Rhino', 'armoured_rhino_female', 'A powerful armoured she-rhino', 'challenge_unlock', 'workout_count', 50, 'uncommon', 'female', true, 108),
('Bodybuilder Lioness', 'bodybuilder_lioness', 'A muscular lioness building strength', 'challenge_unlock', 'xp_total', 5000, 'uncommon', 'female', true, 109),
('Rogue Runner Cyborg', 'rogue_runner_cyborg_female', 'A cybernetic runner breaking limits', 'challenge_unlock', 'habit_streak', 14, 'uncommon', 'female', true, 110),
('Yoga Wolf', 'yoga_wolf_female', 'A peaceful she-wolf in harmony', 'challenge_unlock', 'progress_photos', 10, 'uncommon', 'female', true, 111),
('Yoga Deer', 'yoga_deer_female', 'A graceful doe finding inner peace', 'challenge_unlock', 'progress_photos', 10, 'uncommon', 'female', true, 112),

-- 4 Rare (matching boxer_dog: workout_count 100, kickboxer_panther: habit_streak 30, powerlifter_gorilla: xp_total 10000, shaolin_tiger: macro_days 30)
('Boxer Dog', 'boxer_dog_female', 'A fierce female boxer in the ring', 'challenge_unlock', 'workout_count', 100, 'rare', 'female', true, 113),
('Kickboxer Panther', 'kickboxer_panther_female', 'A deadly panther with lightning kicks', 'challenge_unlock', 'habit_streak', 30, 'rare', 'female', true, 114),
('Powerlifting Gorilla', 'powerlifting_gorilla_female', 'An immensely strong female gorilla', 'challenge_unlock', 'xp_total', 10000, 'rare', 'female', true, 115),
('Shaolin Tigress', 'shaolin_tigress', 'A disciplined tigress with ancient wisdom', 'challenge_unlock', 'macro_days', 30, 'rare', 'female', true, 116),

-- 2 Epic (matching streetwear_gorilla_trainer: leaderboard_rank 10, deadlift_boar: workout_count 200)
('Streetwear Gorilla Trainer', 'streetwear_gorilla_trainer_female', 'A stylish female gorilla fitness influencer', 'challenge_unlock', 'leaderboard_rank', 10, 'epic', 'female', true, 117),
('Deadlift Boar', 'deadlift_boar_female', 'A powerful female boar crushing deadlifts', 'challenge_unlock', 'workout_count', 200, 'epic', 'female', true, 118),

-- 2 Legendary (matching meditative_android_monk: challenges_completed 5, elite_personal_trainer_human: coach_role)
('Meditative Android Monk', 'meditative_android_monk_female', 'A transcendent female android in meditation', 'challenge_unlock', 'challenges_completed', 5, 'legendary', 'female', true, 119),
('Elite Personal Trainer', 'elite_personal_trainer_human_female', 'The ultimate female fitness professional', 'coach_exclusive', 'coach_role', NULL, 'legendary', 'female', true, 120);