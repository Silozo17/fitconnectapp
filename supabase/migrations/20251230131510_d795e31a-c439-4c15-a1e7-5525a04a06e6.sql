-- Add private location columns for precise geolocation (GDPR compliant)
-- These columns are NEVER exposed in public leaderboard RPCs

ALTER TABLE public.client_profiles 
ADD COLUMN IF NOT EXISTS location_lat NUMERIC,
ADD COLUMN IF NOT EXISTS location_lng NUMERIC,
ADD COLUMN IF NOT EXISTS location_accuracy TEXT CHECK (location_accuracy IN ('ip', 'precise', 'manual')),
ADD COLUMN IF NOT EXISTS location_confidence TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.client_profiles.location_lat IS 'Private: GPS latitude, never exposed publicly';
COMMENT ON COLUMN public.client_profiles.location_lng IS 'Private: GPS longitude, never exposed publicly';
COMMENT ON COLUMN public.client_profiles.location_accuracy IS 'Location source: ip (approximate), precise (GPS), manual (user selected)';
COMMENT ON COLUMN public.client_profiles.location_confidence IS 'Geocoding confidence: ROOFTOP, GEOMETRIC_CENTER, APPROXIMATE, etc.';