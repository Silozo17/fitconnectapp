-- =========================================
-- PRODUCTION READINESS: SECURITY HARDENING & PERFORMANCE
-- =========================================

-- 1. Fix function missing search_path
CREATE OR REPLACE FUNCTION public.update_user_security_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Add performance indexes for frequently queried columns

-- Coach marketplace search optimization
CREATE INDEX IF NOT EXISTS idx_coach_profiles_marketplace_visible 
ON coach_profiles(marketplace_visible) 
WHERE marketplace_visible = true;

CREATE INDEX IF NOT EXISTS idx_coach_profiles_location_country_code 
ON coach_profiles(location_country_code);

CREATE INDEX IF NOT EXISTS idx_coach_profiles_onboarding_completed 
ON coach_profiles(onboarding_completed) 
WHERE onboarding_completed = true;

-- Session scheduling optimization
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_scheduled_at 
ON coaching_sessions(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_coaching_sessions_coach_status 
ON coaching_sessions(coach_id, status);

CREATE INDEX IF NOT EXISTS idx_coaching_sessions_client_status 
ON coaching_sessions(client_id, status);

-- Reviews optimization for ratings
CREATE INDEX IF NOT EXISTS idx_reviews_coach_id 
ON reviews(coach_id);

CREATE INDEX IF NOT EXISTS idx_reviews_rating 
ON reviews(rating);

-- Booking requests optimization
CREATE INDEX IF NOT EXISTS idx_booking_requests_status 
ON booking_requests(status);

CREATE INDEX IF NOT EXISTS idx_booking_requests_coach_status 
ON booking_requests(coach_id, status);

-- Messages optimization for unread counts
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread 
ON messages(receiver_id) 
WHERE read_at IS NULL;

-- Coach clients optimization
CREATE INDEX IF NOT EXISTS idx_coach_clients_status 
ON coach_clients(status);

CREATE INDEX IF NOT EXISTS idx_coach_clients_coach_status 
ON coach_clients(coach_id, status);

-- Connection requests optimization
CREATE INDEX IF NOT EXISTS idx_connection_requests_status 
ON connection_requests(status);

CREATE INDEX IF NOT EXISTS idx_connection_requests_coach_status 
ON connection_requests(coach_id, status);

-- Training logs for progress tracking
CREATE INDEX IF NOT EXISTS idx_training_logs_client_date 
ON training_logs(client_id, logged_at DESC);

-- Habit logs for streak calculations
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date 
ON habit_logs(habit_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_habit_logs_client_date 
ON habit_logs(client_id, logged_at DESC);

-- Challenge participants for leaderboards
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_progress 
ON challenge_participants(challenge_id, current_progress DESC);

-- Notifications for unread counts
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id) 
WHERE read = false;

-- 3. Add RLS policy for oauth_temp_tokens (table with RLS enabled but no policies)
CREATE POLICY "Users can only access their own temp tokens" 
ON oauth_temp_tokens FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Service role needs full access for OAuth callback handling
CREATE POLICY "Service role can manage all temp tokens" 
ON oauth_temp_tokens FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Analyze key tables to update statistics for query optimizer
ANALYZE coach_profiles;
ANALYZE coaching_sessions;
ANALYZE reviews;
ANALYZE booking_requests;
ANALYZE messages;