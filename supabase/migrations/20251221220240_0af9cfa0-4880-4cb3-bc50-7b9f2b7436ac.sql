-- Performance indexes for coach engagement queries
-- These optimize the queries in useCoachEngagement.ts that run for every coach list

-- Index for reviews table - used in engagement scoring
CREATE INDEX IF NOT EXISTS idx_reviews_coach_id ON public.reviews (coach_id);
CREATE INDEX IF NOT EXISTS idx_reviews_coach_public ON public.reviews (coach_id) WHERE is_public = true;

-- Index for coaching_sessions table - used in engagement scoring  
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_coach_id ON public.coaching_sessions (coach_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_coach_completed ON public.coaching_sessions (coach_id) WHERE status = 'completed';