-- Create table to store temporary OAuth tokens for OAuth 1.0a flow
CREATE TABLE public.oauth_temp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  oauth_token TEXT NOT NULL,
  oauth_token_secret TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '15 minutes'),
  UNIQUE(user_id, provider)
);

-- Index for auto-cleanup of expired tokens
CREATE INDEX idx_oauth_temp_tokens_expires ON public.oauth_temp_tokens(expires_at);

-- Enable RLS (only service role can access)
ALTER TABLE public.oauth_temp_tokens ENABLE ROW LEVEL SECURITY;

-- Add token_secret column to wearable_connections for OAuth 1.0a providers
ALTER TABLE public.wearable_connections ADD COLUMN IF NOT EXISTS token_secret TEXT;