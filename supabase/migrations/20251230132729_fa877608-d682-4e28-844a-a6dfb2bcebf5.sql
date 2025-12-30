-- Phase 1: Add terms acceptance fields to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_version TEXT,
ADD COLUMN IF NOT EXISTS terms_platform TEXT,
ADD COLUMN IF NOT EXISTS terms_app_version TEXT;

-- Phase 3: Create user_security_settings table for 2FA
CREATE TABLE IF NOT EXISTS public.user_security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_method TEXT DEFAULT 'email',
  two_factor_verified_at TIMESTAMPTZ,
  two_factor_disabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on user_security_settings
ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only read their own security settings
CREATE POLICY "Users can view their own security settings"
ON public.user_security_settings
FOR SELECT
USING (auth.uid() = user_id);

-- RLS: Users can update their own security settings
CREATE POLICY "Users can update their own security settings"
ON public.user_security_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS: Users can insert their own security settings
CREATE POLICY "Users can insert their own security settings"
ON public.user_security_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Phase 4: Create user_sessions table for session tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL,
  device_info TEXT,
  platform TEXT,
  ip_country TEXT,
  ip_region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_current BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(session_token_hash)
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only view their own sessions
CREATE POLICY "Users can view their own sessions"
ON public.user_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- RLS: Users can update their own sessions
CREATE POLICY "Users can update their own sessions"
ON public.user_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS: Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions"
ON public.user_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- RLS: Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(user_id, is_active);

-- Create trigger to update updated_at on user_security_settings
CREATE OR REPLACE FUNCTION public.update_user_security_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_security_settings_updated_at
BEFORE UPDATE ON public.user_security_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_user_security_settings_updated_at();