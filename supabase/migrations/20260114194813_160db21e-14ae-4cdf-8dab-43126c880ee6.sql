-- Add missing columns to gym_locations table
ALTER TABLE public.gym_locations 
ADD COLUMN IF NOT EXISTS access_type text DEFAULT 'members_only',
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Europe/London';