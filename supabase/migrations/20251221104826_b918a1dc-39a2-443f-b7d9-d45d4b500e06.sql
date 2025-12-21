-- Create push_tokens table to store device tokens for push notifications
CREATE TABLE public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  device_type TEXT,
  device_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, player_id)
);

-- Enable RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view their own push tokens
CREATE POLICY "Users can view own push tokens" ON public.push_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own push tokens
CREATE POLICY "Users can insert own push tokens" ON public.push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own push tokens
CREATE POLICY "Users can update own push tokens" ON public.push_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own push tokens
CREATE POLICY "Users can delete own push tokens" ON public.push_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add new push notification preference columns to notification_preferences
ALTER TABLE public.notification_preferences 
ADD COLUMN IF NOT EXISTS push_challenges BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_achievements BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_connections BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_motivation BOOLEAN DEFAULT true;