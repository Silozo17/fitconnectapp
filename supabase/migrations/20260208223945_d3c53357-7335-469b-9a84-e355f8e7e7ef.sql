-- Add external tracking columns to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS external_source TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_external_id ON blog_posts(external_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_external_source ON blog_posts(external_source);

-- Create sync log table to track import history
CREATE TABLE IF NOT EXISTS integration_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name TEXT NOT NULL,
  last_sync_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  articles_imported INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies for sync log (admin only via admin_profiles table)
ALTER TABLE integration_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sync logs"
  ON integration_sync_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert sync logs"
  ON integration_sync_log FOR INSERT
  WITH CHECK (true);