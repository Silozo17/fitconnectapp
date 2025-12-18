-- Create email_verifications table for OTP storage
CREATE TABLE public.email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Index for quick lookup
CREATE INDEX idx_email_verifications_email ON public.email_verifications(email);
CREATE INDEX idx_email_verifications_code ON public.email_verifications(email, code);

-- Enable RLS
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - only edge functions access this table using service role key

-- Add structured location columns to coach_profiles
ALTER TABLE public.coach_profiles 
ADD COLUMN IF NOT EXISTS location_city text,
ADD COLUMN IF NOT EXISTS location_region text,
ADD COLUMN IF NOT EXISTS location_country text,
ADD COLUMN IF NOT EXISTS location_country_code text,
ADD COLUMN IF NOT EXISTS location_lat numeric,
ADD COLUMN IF NOT EXISTS location_lng numeric,
ADD COLUMN IF NOT EXISTS location_place_id text;

-- Create index for location searches
CREATE INDEX IF NOT EXISTS idx_coach_profiles_location ON public.coach_profiles(location_city, location_country);