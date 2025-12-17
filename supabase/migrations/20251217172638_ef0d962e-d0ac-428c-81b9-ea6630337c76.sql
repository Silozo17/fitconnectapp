-- Update badge icons from emoji to Lucide icon names for coach badges
UPDATE badges SET icon = 'FileEdit' WHERE name = 'Profile Starter' AND category IN ('coach_profile', 'coach_milestone');
UPDATE badges SET icon = 'BadgeCheck' WHERE name = 'Profile Pro' AND category IN ('coach_profile', 'coach_milestone');
UPDATE badges SET icon = 'UserPlus' WHERE name = 'First Client' AND category IN ('coach_profile', 'coach_milestone');
UPDATE badges SET icon = 'Dumbbell' WHERE name = 'First Session' AND category IN ('coach_profile', 'coach_milestone');
UPDATE badges SET icon = 'MessageSquareStar' WHERE name = 'First Review' AND category IN ('coach_profile', 'coach_milestone');
UPDATE badges SET icon = 'CircleDollarSign' WHERE name = 'First Earning' AND category IN ('coach_profile', 'coach_milestone');
UPDATE badges SET icon = 'TrendingUp' WHERE name = 'Growing Business' AND category IN ('coach_profile', 'coach_milestone');
UPDATE badges SET icon = 'Rocket' WHERE name = 'Rising Star' AND category IN ('coach_profile', 'coach_milestone');
UPDATE badges SET icon = 'Medal' WHERE name = 'Session Pro' AND category IN ('coach_profile', 'coach_milestone');
UPDATE badges SET icon = 'ShieldCheck' WHERE name = 'Verified Coach' AND category IN ('coach_profile', 'coach_milestone');
UPDATE badges SET icon = 'ThumbsUp' WHERE name = 'Highly Rated' AND category IN ('coach_profile', 'coach_milestone');
UPDATE badges SET icon = 'Sparkles' WHERE name = 'Coaching Star' AND category IN ('coach_profile', 'coach_milestone');
UPDATE badges SET icon = 'Gem' WHERE name = 'Business Builder' AND category IN ('coach_profile', 'coach_milestone');
UPDATE badges SET icon = 'Award' WHERE name = 'Session Master' AND category IN ('coach_profile', 'coach_milestone');
UPDATE badges SET icon = 'Crown' WHERE name = 'Coaching Legend' AND category IN ('coach_profile', 'coach_milestone');
UPDATE badges SET icon = 'Trophy' WHERE name = 'Top Rated' AND category IN ('coach_profile', 'coach_milestone');