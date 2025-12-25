-- Add column to track when client last viewed their plans
ALTER TABLE public.client_profiles
ADD COLUMN IF NOT EXISTS plans_last_viewed_at TIMESTAMPTZ;