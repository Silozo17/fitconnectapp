-- Add booking settings columns to coach_profiles
ALTER TABLE coach_profiles 
ADD COLUMN IF NOT EXISTS pre_booking_buffer_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS post_booking_buffer_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS default_session_location TEXT;